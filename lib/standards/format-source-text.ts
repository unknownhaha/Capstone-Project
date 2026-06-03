/**
 * Turns catalog source_text (including enriched cross-refs) into
 * section headings + bullet lines for mobile-friendly display.
 * Does not mutate stored JSON — display only.
 */

export type SourceTextSection = {
  heading: string | null;
  bullets: string[];
};

const SECTION_HEADER_RE = /^\[([^\]]+)\]\s*/;

/** Normalize whitespace; keep meaning intact. */
function normalizeLine(line: string): string {
  return line.replace(/\s+/g, " ").trim();
}

/** Split body into bullet lines (paragraphs). */
function bodyToBullets(body: string): string[] {
  const trimmed = body.trim();
  if (!trimmed) return [];

  const parts = trimmed.split(/\n\n+/).map(normalizeLine).filter(Boolean);
  if (parts.length > 0) return parts;

  const single = normalizeLine(trimmed.replace(/\n/g, " "));
  return single ? [single] : [];
}

/** Drop duplicate bullets (common when refs repeat). */
function dedupeBullets(bullets: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const b of bullets) {
    if (seen.has(b)) continue;
    seen.add(b);
    out.push(b);
  }
  return out;
}

/**
 * Shorten bullets that repeat the section heading clause number.
 * e.g. under [ข้อที่อ้างอิง 3.1.7.2], trim leading "ต้องเป็นไปตามข้อ 3.1.7.2"
 */
function tightenBullet(bullet: string, heading: string | null): string {
  if (!heading?.startsWith("ข้อที่อ้างอิง ")) return bullet;
  const clause = heading.replace("ข้อที่อ้างอิง ", "").trim();
  if (!clause) return bullet;

  const patterns = [
    new RegExp(`^ต้องเป็นไปตามข้อ\\s*${escapeRegExp(clause)}\\s*`),
    new RegExp(`^เป็นไปตามข้อ\\s*${escapeRegExp(clause)}\\s*`),
    new RegExp(`^ตามข้อ\\s*${escapeRegExp(clause)}\\s*`),
  ];
  let out = bullet;
  for (const re of patterns) {
    out = out.replace(re, "").trim();
  }
  return out || bullet;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseChunk(chunk: string): SourceTextSection | null {
  const trimmed = chunk.trim();
  if (!trimmed) return null;

  const headerMatch = trimmed.match(SECTION_HEADER_RE);
  if (headerMatch) {
    const heading = headerMatch[1].trim();
    const body = trimmed.slice(headerMatch[0].length);
    const bullets = dedupeBullets(
      bodyToBullets(body).map((b) => tightenBullet(b, heading))
    );
    return { heading, bullets };
  }

  const bullets = dedupeBullets(bodyToBullets(trimmed));
  return { heading: null, bullets };
}

/**
 * Parse source_text into display sections.
 * Supports enriched format with [ข้อกำหนดในหมวดนี้] and [ข้อที่อ้างอิง …] blocks.
 */
export function parseSourceTextForDisplay(raw: string): SourceTextSection[] {
  const text = raw.trim();
  if (!text) return [];

  const hasMarkers = /\[(?:ข้อกำหนดในหมวดนี้|ข้อที่อ้างอิง)/.test(text);
  if (!hasMarkers) {
    const section = parseChunk(text);
    return section && section.bullets.length > 0 ? [section] : [];
  }

  const chunks = text.split(/(?=\[(?:ข้อกำหนดในหมวดนี้|ข้อที่อ้างอิง)[^\]]*\])/g);
  const sections: SourceTextSection[] = [];

  for (const chunk of chunks) {
    const section = parseChunk(chunk);
    if (section && section.bullets.length > 0) sections.push(section);
  }

  return sections;
}
