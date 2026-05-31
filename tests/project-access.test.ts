import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  canEditProject,
  canShareProject,
  canViewProject,
  getProjectRole,
} from "../lib/project-access";

const ownerId = "aaaaaaaaaaaaaaaaaaaaaaaa";
const editorId = "bbbbbbbbbbbbbbbbbbbbbbbb";

const project = {
  userId: ownerId,
  members: [{ userId: editorId, role: "editor" as const }],
};

describe("project access", () => {
  it("owner can share, editor cannot", () => {
    assert.equal(canShareProject(project, ownerId), true);
    assert.equal(canShareProject(project, editorId), false);
  });

  it("editor can edit and view", () => {
    assert.equal(canEditProject(project, editorId), true);
    assert.equal(canViewProject(project, editorId), true);
  });

  it("outsider has no role", () => {
    assert.equal(getProjectRole(project, "cccccccccccccccccccccccc"), null);
    assert.equal(canViewProject(project, "cccccccccccccccccccccccc"), false);
  });
});
