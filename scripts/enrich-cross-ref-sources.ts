/**
 * Enrich source_text for cross-reference checklist items.
 *
 * What it does
 * ─────────────
 * For items whose display_text cites another clause
 * (ตามข้อ / เป็นไปตามข้อ / ตามข้อกำหนด / ตามมาตรฐาน + 3.x.x),
 * the source_text is extended to contain:
 *
 *   [ข้อกำหนดในหมวดนี้]
 *   …original source_text of this item…
 *
 *   [ข้อที่อ้างอิง 3.x.x]
 *   …source_text(s) from matching items elsewhere in the catalog…
 *
 * display_text is NEVER changed.
 * Running the script twice is idempotent (old enrichment is stripped first).
 *
 * Usage
 * ─────
 *   npx tsx scripts/enrich-cross-ref-sources.ts           # apply
 *   npx tsx scripts/enrich-cross-ref-sources.ts --dry-run # preview only
 */

import fs from "fs";
import path from "path";

const STANDARDS_DIR = path.join(process.cwd(), "lib", "standards");

const CATALOG_FILES = [
  "ทั่วไป.json",
  "ทางเข้าอาคาร ทางเดินระหว่างอาคาร ทางเชื่อมระหว่างอาคาร ทางลาด ลิฟต์ และบันได.json",
  "ประตูและหน้าต่าง.json",
  "ที่จอดรถและที่รับส่งผู้โดยสาร.json",
  "ที่พักอาศัยและห้องนอน.json",
  "การครอบครองพิเศษ.json",
  "ป้ายสัญลักษณ์.json",
  "อย่ายุ่งกับอันนี้.json",
] as const;

const ENRICH_MARKER = "[ข้อที่อ้างอิง";
const LOCAL_HEADER = "[ข้อกำหนดในหมวดนี้]";

// NOTE: no /g flag on these — used for .test() which must not carry lastIndex state
const CROSS_REF_TEST = /ตามข้อ|เป็นไปตามข้อ|ตามข้อกำหนด|ตามมาตรฐาน/;
const CLAUSE_TEST = /3\.\d+(?:\.\d+)*(?:\(\d+(?:\.\d+)?\))?/;

// /g flag only for matchAll / exec loops
const CLAUSE_MATCH_ALL = () => /3\.\d+(?:\.\d+)*(?:\(\d+(?:\.\d+)?\))?(?:\s*\(\d+(?:\.\d+)?\))?/g;
const RANGE_MATCH_ALL = () => /(3(?:\.\d+)+)\s*[–-]\s*(3(?:\.\d+)+)/g;

// ── clause helpers ────────────────────────────────────────────────────────────

function normClause(c: string): string {
  return c.trim().replace(/\s+/g, "");
}

function clauseParts(c: string): number[] {
  return c
    .replace(/\([^)]*\)/g, "")
    .split(".")
    .map(Number)
    .filter((n) => !Number.isNaN(n));
}

function cmpClause(a: string, b: string): number {
  const pa = clauseParts(a);
  const pb = clauseParts(b);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

function clauseMatchesRef(itemClause: string, ref: string): boolean {
  const a = normClause(itemClause);
  const r = normClause(ref);
  if (!a || !r) return false;
  if (a === r) return true;
  return a.startsWith(r + ".") || a.startsWith(r + "(");
}

function clauseInRange(c: string, lo: string, hi: string): boolean {
  return cmpClause(c, lo) >= 0 && cmpClause(c, hi) <= 0;
}

// ── catalog row type ──────────────────────────────────────────────────────────

type CatalogRow = {
  item_id: string;
  source_clause: string;
  source_text: string;
};

// ── parse clause refs from a display_text string ──────────────────────────────

function parseRefs(text: string, allRows: CatalogRow[]): string[] {
  const seen = new Set<string>();
  const add = (r: string) => {
    const t = normClause(r);
    if (t) seen.add(t);
  };

  // expand ranges first; remove them so CLAUSE_MATCH_ALL doesn't double-match
  let remainder = text;
  for (const m of text.matchAll(RANGE_MATCH_ALL())) {
    const lo = m[1];
    const hi = m[2];
    remainder = remainder.replace(m[0], " ");
    const prefix = lo.split(".").slice(0, -1).join(".");
    for (const row of allRows) {
      if (!row.source_clause.startsWith(prefix + ".")) continue;
      if (clauseInRange(row.source_clause, lo, hi)) add(row.source_clause);
    }
  }

  for (const m of remainder.matchAll(CLAUSE_MATCH_ALL())) {
    add(m[0]);
  }

  return [...seen];
}

// ── lookup source_text(s) for a clause ref ───────────────────────────────────

function lookupRef(ref: string, selfId: string, allRows: CatalogRow[]): string[] {
  const exact = allRows.filter(
    (r) => r.item_id !== selfId && normClause(r.source_clause) === normClause(ref)
  );
  const pool =
    exact.length > 0
      ? exact
      : allRows.filter(
          (r) => r.item_id !== selfId && clauseMatchesRef(r.source_clause, ref)
        );

  const seen = new Set<string>();
  return pool
    .sort((a, b) => cmpClause(a.source_clause, b.source_clause))
    .reduce<string[]>((acc, r) => {
      const t = r.source_text.trim();
      if (t && !seen.has(t)) {
        seen.add(t);
        // at most 6 unique texts per referenced clause
        if (seen.size <= 6) acc.push(t);
      }
      return acc;
    }, []);
}

// ── strip previous enrichment so re-runs are idempotent ──────────────────────

function stripEnrichment(s: string): string {
  const idx = s.indexOf(ENRICH_MARKER);
  return (idx >= 0 ? s.slice(0, idx) : s)
    .replace(LOCAL_HEADER, "")
    .trim();
}

// ── build enriched source_text for one item ───────────────────────────────────

function buildEnriched(
  baseSource: string,
  displayText: string,
  itemId: string,
  allRows: CatalogRow[]
): string | null {
  // test() on non-global regexes — no lastIndex drift
  if (!CROSS_REF_TEST.test(displayText) || !CLAUSE_TEST.test(displayText)) return null;

  const refs = parseRefs(displayText, allRows);
  if (refs.length === 0) return null;

  const base = stripEnrichment(baseSource);
  const blocks: string[] = [];

  if (base) blocks.push(LOCAL_HEADER, base);

  const cited = new Set<string>();
  let added = 0;

  for (const ref of refs) {
    // strip parenthesised sub-clause suffix for lookup root (e.g. 3.1.4(1) → 3.1.4)
    const root = normClause(ref).replace(/\(.*$/, "");
    if (cited.has(root)) continue;
    cited.add(root);

    const texts = lookupRef(root, itemId, allRows);
    if (texts.length === 0) continue;

    blocks.push("", `${ENRICH_MARKER} ${root}]`, texts.join("\n\n"));
    added++;
  }

  if (added === 0) return null;
  return blocks.join("\n").trim();
}

// ── walk JSON tree to collect CatalogRows ────────────────────────────────────

function collectRows(value: unknown, rows: CatalogRow[]) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) { value.forEach((v) => collectRows(v, rows)); return; }
  const n = value as Record<string, unknown>;
  if (typeof n.display_text === "string" && typeof n.source_text === "string") {
    rows.push({
      item_id: String(n.item_id ?? n.id ?? "?"),
      source_clause: String(n.source_clause ?? ""),
      source_text: n.source_text.trim(),
    });
  }
  for (const child of Object.values(n)) {
    if (child && typeof child === "object") collectRows(child, rows);
  }
}

// ── walk JSON tree and mutate source_text in place ───────────────────────────

function applyEnrichment(value: unknown, allRows: CatalogRow[]): number {
  if (!value || typeof value !== "object") return 0;
  if (Array.isArray(value)) {
    return value.reduce((sum, v) => sum + applyEnrichment(v, allRows), 0);
  }
  const n = value as Record<string, unknown>;
  let count = 0;
  if (typeof n.display_text === "string" && typeof n.source_text === "string") {
    const id = String(n.item_id ?? n.id ?? "");
    const next = buildEnriched(n.source_text, n.display_text.trim(), id, allRows);
    if (next && next !== (n.source_text as string).trim()) {
      n.source_text = next;
      count++;
    }
  }
  for (const child of Object.values(n)) {
    if (child && typeof child === "object") count += applyEnrichment(child, allRows);
  }
  return count;
}

// ── main ──────────────────────────────────────────────────────────────────────

function main() {
  const dryRun = process.argv.includes("--dry-run");

  // 1. Load all catalog rows for lookup
  const allRows: CatalogRow[] = [];
  for (const file of CATALOG_FILES) {
    collectRows(JSON.parse(fs.readFileSync(path.join(STANDARDS_DIR, file), "utf8")), allRows);
  }
  console.log(`Loaded ${allRows.length} catalog items for lookup.\n`);

  // 2. Process each file
  let totalUpdated = 0;

  for (const file of CATALOG_FILES) {
    const full = path.join(STANDARDS_DIR, file);
    const data = JSON.parse(fs.readFileSync(full, "utf8"));
    const n = applyEnrichment(data, allRows);
    totalUpdated += n;

    if (!dryRun && n > 0) {
      fs.writeFileSync(full, JSON.stringify(data, null, 2) + "\n", "utf8");
    }

    const tag = n > 0 ? `✓ ${n} items` : "  (no changes)";
    console.log(`${tag.padEnd(20)} ${file}`);
  }

  console.log(`\nTotal items enriched : ${totalUpdated}`);
  if (dryRun) {
    console.log("DRY RUN — no files written.");
    console.log("Re-run without --dry-run to apply.");
  }
}

main();
