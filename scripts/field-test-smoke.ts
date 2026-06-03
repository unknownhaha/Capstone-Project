/**
 * HTTP smoke for field-test plan section B (auth routes).
 * Run: npm run dev  then  npm run field-test:smoke
 */
import fs from "fs";
import path from "path";

const BASE = process.env.FIELD_TEST_BASE_URL ?? "http://localhost:3000";
const reportPath = path.join(
  process.cwd(),
  "docs/field-testing/results/SMOKE_RESULTS.md"
);

type Row = { name: string; ok: boolean; detail: string };

async function fetchStatus(
  url: string,
  init?: RequestInit
): Promise<{ status: number; location?: string; bodySnippet?: string }> {
  const res = await fetch(url, { ...init, redirect: "manual" });
  const location = res.headers.get("location") ?? undefined;
  let bodySnippet = "";
  try {
    const text = await res.text();
    bodySnippet = text.slice(0, 200);
  } catch {
    bodySnippet = "";
  }
  return { status: res.status, location, bodySnippet };
}

async function main() {
  const rows: Row[] = [];

  try {
    const health = await fetchStatus(`${BASE}/login`);
    rows.push({
      name: "Server reachable (GET /login)",
      ok: health.status === 200 || health.status === 307,
      detail: `status ${health.status}`,
    });
  } catch (err) {
    rows.push({
      name: "Server reachable",
      ok: false,
      detail: `Cannot connect to ${BASE}. Start: npm run dev`,
    });
    writeReport(rows);
    process.exit(1);
    return;
  }

  const allproject = await fetchStatus(`${BASE}/allproject`);
  rows.push({
    name: "GET /allproject unauthenticated → redirect login",
    ok:
      (allproject.status === 307 || allproject.status === 302) &&
      (allproject.location?.includes("/login") ?? false),
    detail: `status ${allproject.status} location ${allproject.location ?? "none"}`,
  });

  const apiProject = await fetchStatus(`${BASE}/api/project`);
  rows.push({
    name: "GET /api/project without cookie → 401",
    ok: apiProject.status === 401,
    detail: `status ${apiProject.status}`,
  });

  const register = await fetchStatus(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  rows.push({
    name: "POST /api/auth/register empty body → 400",
    ok: register.status === 400,
    detail: `status ${register.status}`,
  });

  const join = await fetchStatus(`${BASE}/join/test-token`);
  rows.push({
    name: "GET /join/[token] public page",
    ok: join.status === 200,
    detail: `status ${join.status}`,
  });

  const loginCb = await fetchStatus(
    `${BASE}/login?callbackUrl=${encodeURIComponent("/allproject")}`
  );
  rows.push({
    name: "GET /login?callbackUrl= present",
    ok: loginCb.status === 200,
    detail: `status ${loginCb.status}`,
  });

  writeReport(rows);
  const passed = rows.filter((r) => r.ok).length;
  console.log(`\nSmoke: ${passed}/${rows.length} passed. Report: ${reportPath}\n`);
  process.exit(rows.every((r) => r.ok) ? 0 : 1);
}

function writeReport(rows: Row[]) {
  const lines = [
    "# Smoke results (HTTP)",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Base URL: \`${BASE}\``,
    "",
    "## Results",
    "",
    "| Check | Result | Detail |",
    "|-------|--------|--------|",
    ...rows.map(
      (r) => `| ${r.name} | ${r.ok ? "PASS" : "FAIL"} | ${r.detail.replace(/\|/g, "\\|")} |`
    ),
    "",
    "## Facilitator mapping (section B)",
    "",
    "- Auth redirect `/allproject` → first row after server check",
    "- API 401 → `GET /api/project` row",
    "- Register validation → register POST row",
    "- Join flow entry → join page row",
    "",
    "Remaining section B items require logged-in UI (see FACILITATOR_CHECKLIST_B.md).",
    "",
  ];
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, lines.join("\n"), "utf8");
}

void main();
