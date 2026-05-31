import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  canMarkProjectComplete,
  isProjectMarkedComplete,
} from "../lib/project-complete";

describe("project-complete", () => {
  it("only treats explicit completed status as done", () => {
    assert.equal(isProjectMarkedComplete({ status: "completed" }), true);
    assert.equal(
      isProjectMarkedComplete({ status: "draft", completionRate: 100 }),
      false
    );
  });

  it("allows marking done only when every checkpoint is scored", () => {
    assert.equal(
      canMarkProjectComplete({ status: "draft", completionRate: 100 }),
      true
    );
    assert.equal(
      canMarkProjectComplete({ status: "draft", completionRate: 99 }),
      false
    );
    assert.equal(
      canMarkProjectComplete({ status: "completed", completionRate: 100 }),
      false
    );
  });
});
