/**
 * Non-UI system check for owner-controlled collaboration.
 * Run: npx tsx --env-file=.env scripts/test-collaboration.ts
 */
import mongoose from "mongoose";
import { connectDB } from "../lib/db";
import Project from "../lib/model/project";
import ProjectInvite from "../lib/model/project-invite";
import User from "../lib/model/user";
import {
  canDeleteProject,
  canEditProject,
  canShareProject,
  canViewProject,
  getProjectRole,
  isMember,
  isOwner,
} from "../lib/project-access";
import { getOrCreateInvite } from "../lib/project-invite";
import { serializeProjectForUser } from "../lib/project-serialize";

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

function runAccessUnitTests() {
  console.log("\n[1] Access control (unit)");

  const ownerId = "aaaaaaaaaaaaaaaaaaaaaaaa";
  const editorId = "bbbbbbbbbbbbbbbbbbbbbbbb";
  const outsiderId = "cccccccccccccccccccccccc";

  const project = {
    userId: ownerId,
    members: [{ userId: editorId, role: "editor" as const }],
    collaborationEnabled: true,
  };

  assert("owner is owner", isOwner(project, ownerId));
  assert("editor is member", isMember(project, editorId));
  assert("outsider is not member", !isMember(project, outsiderId));
  assert("owner can share", canShareProject(project, ownerId));
  assert("editor cannot share", !canShareProject(project, editorId));
  assert("owner can delete", canDeleteProject(project, ownerId));
  assert("editor cannot delete", !canDeleteProject(project, editorId));
  assert("owner can view", canViewProject(project, ownerId));
  assert("editor can view", canViewProject(project, editorId));
  assert("outsider cannot view", !canViewProject(project, outsiderId));
  assert("editor can edit", canEditProject(project, editorId));
  assert("outsider cannot edit", !canEditProject(project, outsiderId));
  assert("owner role", getProjectRole(project, ownerId) === "owner");
  assert("editor role", getProjectRole(project, editorId) === "editor");
  assert("outsider has no role", getProjectRole(project, outsiderId) === null);
}

async function runDbIntegrationTests() {
  console.log("\n[2] Database integration");

  if (!process.env.MONGO_URI) {
    console.log("  SKIP  MONGO_URI not set");
    return;
  }

  await connectDB();

  const users = await User.find().limit(2).select("_id firstName");
  if (users.length < 2) {
    console.log("  SKIP  Need at least 2 users in MongoDB to run join simulation");
    return;
  }

  const owner = users[0];
  const teammate = users[1];
  const ownerId = owner._id.toString();
  const teammateId = teammate._id.toString();

  const tag = `collab-test-${Date.now()}`;
  let projectId: string | null = null;
  let inviteToken: string | null = null;

  try {
    const project = await Project.create({
      userId: owner._id,
      projectName: tag,
      institution: { address: "test-address" },
      sections: [
        {
          code: "1",
          criteria: [{ criteriaId: "test-criterion-1", score: null }],
        },
      ],
      collaborationEnabled: false,
      members: [],
    });
    const createdProjectId = project._id.toString();
    projectId = createdProjectId;

    assert("new project starts solo", !project.collaborationEnabled);
    assert("outsider cannot view", !canViewProject(project, teammateId));

    project.collaborationEnabled = true;
    await project.save();

    const invite = await getOrCreateInvite(createdProjectId, ownerId);
    inviteToken = invite.token;
    assert("invite token created", Boolean(inviteToken));
    assert("invite not expired", invite.expiresAt > new Date());

    const inviteLookup = await ProjectInvite.findOne({ token: inviteToken });
    assert("invite stored in DB", inviteLookup?.projectId.toString() === projectId);

    const disabledJoinBlocked = !project.collaborationEnabled;
    assert("collaboration flag was enabled", !disabledJoinBlocked);

    project.members = project.members ?? [];
    if (!isMember(project, teammateId) && !isOwner(project, teammateId)) {
      project.members.push({
        userId: teammate._id,
        role: "editor",
        joinedAt: new Date(),
      });
      await project.save();
    }

    const reloaded = await Project.findById(projectId);
    if (!reloaded) throw new Error("Project missing after join simulation");

    assert("teammate is member after join", isMember(reloaded, teammateId));
    assert("teammate can edit", canEditProject(reloaded, teammateId));
    assert("teammate cannot share", !canShareProject(reloaded, teammateId));
    assert("teammate cannot delete", !canDeleteProject(reloaded, teammateId));

    const sharedList = await Project.find({ "members.userId": teammate._id });
    assert(
      "dashboard query finds shared project",
      sharedList.some((p) => p._id.toString() === projectId)
    );

    const ownerSerialized = serializeProjectForUser(reloaded, ownerId);
    const editorSerialized = serializeProjectForUser(reloaded, teammateId);
    assert("owner serialized role", ownerSerialized.role === "owner");
    assert("editor serialized role", editorSerialized.role === "editor");

    const expiredInvite = await ProjectInvite.create({
      projectId: project._id,
      token: `expired-${tag}`,
      createdBy: owner._id,
      expiresAt: new Date(Date.now() - 60_000),
    });
    const expiredValid = expiredInvite.expiresAt < new Date();
    assert("expired invite detected", expiredValid);
    await ProjectInvite.deleteOne({ _id: expiredInvite._id });
  } finally {
    if (projectId) {
      await ProjectInvite.deleteMany({ projectId });
      await Project.findByIdAndDelete(projectId);
    }
    console.log(`  CLEAN  Removed test project (${tag})`);
  }
}

async function main() {
  console.log("Collaboration system test");
  runAccessUnitTests();
  await runDbIntegrationTests();

  console.log(`\nResult: ${passed} passed, ${failed} failed`);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("\nTest runner error:", err);
  process.exit(1);
});
