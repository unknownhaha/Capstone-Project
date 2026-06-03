/**
 * Field-test preflight (plan section A technical checklist + prep-env).
 * Run: npm run field-test:preflight
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const root = process.cwd();
const reportPath = path.join(root, "docs/field-testing/results/PREFLIGHT_REPORT.md");

function run(cmd: string): { ok: boolean; output: string } {
  try {
    const output = execSync(cmd, {
      cwd: root,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { ok: true, output: output.trim() };
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string; message?: string };
    const output = [e.stdout, e.stderr, e.message].filter(Boolean).join("\n");
    return { ok: false, output: output.trim() };
  }
}

function gitCommit(): string {
  const r = run("git rev-parse --short HEAD");
  return r.ok ? r.output : "unknown";
}

function checkEnv(): { key: string; present: boolean }[] {
  const keys = [
    "MONGO_URI",
    "AUTH_SECRET",
    "UPLOADTHING_TOKEN",
    "EMAIL_USER",
    "EMAIL_PASS",
  ];
  const envPath = path.join(root, ".env");
  let content = "";
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, "utf8");
  }
  return keys.map((key) => ({
    key,
    present: Boolean(process.env[key]) || new RegExp(`^${key}=.+`, "m").test(content),
  }));
}

const envChecks = checkEnv();
const hasEnvFile = fs.existsSync(path.join(root, ".env"));

const steps: { name: string; ok: boolean; detail: string }[] = [];

steps.push({
  name: ".env file exists",
  ok: hasEnvFile,
  detail: hasEnvFile ? ".env found" : "Copy .env.example to .env",
});

for (const { key, present } of envChecks) {
  steps.push({
    name: `env: ${key}`,
    ok: present,
    detail: present ? "set" : "missing (required for full field test)",
  });
}

const test = run("npm test");
steps.push({ name: "npm test", ok: test.ok, detail: test.output.slice(-800) });

const validate = run("npm run validate");
steps.push({ name: "npm run validate", ok: validate.ok, detail: validate.output.slice(-800) });

const build = run("npm run build");
steps.push({ name: "npm run build", ok: build.ok, detail: build.output.slice(-800) });

const commit = gitCommit();
const coreEnvOk = ["MONGO_URI", "AUTH_SECRET", "UPLOADTHING_TOKEN"].every((key) =>
  envChecks.find((e) => e.key === key)?.present
);
const buildOk = test.ok && validate.ok && build.ok;

const lines = [
  "# Preflight report",
  "",
  `Generated: ${new Date().toISOString()}`,
  `Git commit: \`${commit}\``,
  "",
  "## Summary",
  "",
  buildOk && coreEnvOk
    ? "**Automated checks: PASS** (ensure two test emails and single dev server before sessions)"
    : "**Automated checks: NEEDS ATTENTION** — fix failures before field sessions",
  "",
  "## Environment",
  "",
  "| Variable | Status |",
  "|----------|--------|",
  ...envChecks.map((e) => `| ${e.key} | ${e.present ? "OK" : "MISSING"} |`),
  "",
  "> OTP field tests need EMAIL_USER + EMAIL_PASS (Gmail app password).",
  "",
  "## Commands",
  "",
  "| Step | Result |",
  "|------|--------|",
  ...steps.map((s) => `| ${s.name} | ${s.ok ? "PASS" : "FAIL"} |`),
  "",
  "## Details",
  "",
  ...steps.map((s) => `### ${s.name}\n\n\`\`\`\n${s.detail}\n\`\`\`\n`),
  "",
  "## Manual before sessions",
  "",
  "- [ ] Two test accounts (owner + editor emails)",
  "- [ ] Single `npm run dev` on port 3000",
  "- [ ] `AUTH_URL` matches URL testers open (ngrok/LAN if on phone)",
  "- [ ] Import spreadsheets from `docs/field-testing/spreadsheets/`",
  "",
];

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, lines.join("\n"), "utf8");

console.log(lines.join("\n"));
process.exit(buildOk ? 0 : 1);
