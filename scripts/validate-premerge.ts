/**
 * Pre-merge validation (no database required).
 * Run: npx tsx scripts/validate-premerge.ts
 */
import fs from "fs";
import path from "path";
import {
  canEditProject,
  canShareProject,
  canViewProject,
  getProjectRole,
} from "../lib/project-access";

let passed = 0;
let failed = 0;

function assert(name: string, condition: boolean) {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    console.error(`  FAIL  ${name}`);
  }
}

function fileExists(rel: string) {
  return fs.existsSync(path.join(process.cwd(), rel));
}

function fileIncludes(rel: string, needle: string) {
  const content = fs.readFileSync(path.join(process.cwd(), rel), "utf8");
  return content.includes(needle);
}

console.log("\n[1] Required files exist");
const requiredFiles = [
  "lib/project-access.ts",
  "lib/project-serialize.ts",
  "lib/model/project-invite.ts",
  "app/api/join/[token]/route.ts",
  "app/api/project/[projectId]/collaboration/route.ts",
  "app/api/project/[projectId]/invite/route.ts",
  "app/allproject/_components/ShareProjectDialog.tsx",
  "app/join/[token]/page.tsx",
  "app/allproject/_components/AddCriteriaModal.tsx",
  "app/api/project/[projectId]/add-groups/route.ts",
  "app/api/auth/verify-otp/route.ts",
  "lib/email.ts",
  ".env.example",
];

for (const f of requiredFiles) {
  assert(`exists: ${f}`, fileExists(f));
}

console.log("\n[2] Access control unit tests");
const ownerId = "aaaaaaaaaaaaaaaaaaaaaaaa";
const editorId = "bbbbbbbbbbbbbbbbbbbbbbbb";
const project = {
  userId: ownerId,
  members: [{ userId: editorId, role: "editor" as const }],
};

assert("owner can share", canShareProject(project, ownerId));
assert("editor cannot share", !canShareProject(project, editorId));
assert("editor can edit", canEditProject(project, editorId));
assert("outsider cannot view", !canViewProject(project, "cccccccccccccccccccccccc"));
assert("roles", getProjectRole(project, ownerId) === "owner" && getProjectRole(project, editorId) === "editor");

console.log("\n[3] API routes use shared access helpers");
assert("add-groups uses canEditProject", fileIncludes("app/api/project/[projectId]/add-groups/route.ts", "canEditProject"));
assert("project GET uses canViewProject", fileIncludes("app/api/project/[projectId]/route.ts", "canViewProject"));
assert("critiria uses canEditProject", fileIncludes("app/api/project/[projectId]/critiria/[critiriaId]/route.ts", "canEditProject"));
assert("list merges members query", fileIncludes("app/api/project/route.ts", "members.userId"));

console.log("\n[4] Login keeps callbackUrl + OTP link");
assert("login uses callbackUrl in signIn", fileIncludes("app/login/page.tsx", "callbackUrl,"));
assert("login has OTP link", fileIncludes("app/login/page.tsx", '"/verify"'));
assert("login avoids redirectTo", !fileIncludes("app/login/page.tsx", "redirectTo: callbackUrl"));

console.log("\n[5] UI collaboration rules");
assert("ProjectCard checks editor role", fileIncludes("app/allproject/_components/ProjectCard.tsx", 'project.role !== "editor"'));
assert("search filter exists", fileIncludes("app/allproject/_components/project-utils.ts", "filterProjects"));
assert("gridMessage style exists", fileIncludes("app/allproject/allproject.module.css", ".gridMessage"));
assert("project page gates add criteria", fileIncludes("app/allproject/[projectId]/page.tsx", 'project.role === "editor"'));

console.log("\n[6] Email uses environment variables");
assert("email reads EMAIL_USER", fileIncludes("lib/email.ts", "EMAIL_USER"));
assert("email has no hardcoded gmail pass", !fileIncludes("lib/email.ts", "dviz xyqt"));

console.log("\n[7] Production hygiene (no test hardcodes)");
assert(
  "profile has no test user id",
  !fileIncludes("app/profile/_components/profile.tsx", "680f1a1a")
);
assert(
  "uploadthing profileImg uses session",
  fileIncludes("app/api/uploadthing/route.ts", "session.user.id")
);
assert(
  "users GET enforces session",
  fileIncludes("app/api/users/[id]/route.ts", "session.user.id !== id")
);
assert(
  "project PATCH blocks sections replace",
  fileIncludes("lib/project-patch.ts", "Cannot replace sections") &&
    fileIncludes("app/api/project/[projectId]/route.ts", "validateProjectPatchBody")
);
assert(
  "allproject page has no debug project log",
  !fileIncludes("app/allproject/page.tsx", 'console.log("PROJECT DATA:"')
);

console.log("\n[8] API middleware + collaboration lifecycle");
assert(
  "middleware guards non-auth API",
  fileIncludes("middleware.ts", "isPublicApiPath")
);
assert(
  "uploadthing exempt from JWT middleware",
  fileIncludes("lib/api-public-paths.ts", "/api/uploadthing")
);
assert(
  "collaboration supports disable",
  fileIncludes(
    "app/api/project/[projectId]/collaboration/route.ts",
    '"disable"'
  )
);
assert(
  "invite revoke helper exists",
  fileIncludes("lib/project-invite.ts", "revokeProjectInvites")
);
assert("project patch validation module", fileExists("lib/project-patch.ts"));

console.log(`\nResult: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
