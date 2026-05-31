import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { validateProjectPatchBody } from "../lib/project-patch";

describe("validateProjectPatchBody", () => {
  it("rejects full sections replacement", () => {
    const err = validateProjectPatchBody({ sections: [] });
    assert.equal(err?.status, 400);
    assert.match(err?.error ?? "", /sections/i);
  });

  it("rejects empty projectName", () => {
    const err = validateProjectPatchBody({ projectName: "   " });
    assert.equal(err?.status, 400);
  });

  it("rejects invalid status", () => {
    const err = validateProjectPatchBody({ status: "archived" });
    assert.equal(err?.error, "Invalid status");
  });

  it("rejects invalid buildingType", () => {
    const err = validateProjectPatchBody({ buildingType: "tower" });
    assert.equal(err?.error, "Invalid buildingType");
  });

  it("allows coverImg-only patch body", () => {
    assert.equal(validateProjectPatchBody({ coverImg: "https://x.test/a.png" }), null);
  });

  it("allows valid metadata patch", () => {
    assert.equal(
      validateProjectPatchBody({
        projectName: "Site A",
        status: "draft",
        buildingType: "single_floor",
        institution: { address: "Bangkok" },
      }),
      null
    );
  });
});
