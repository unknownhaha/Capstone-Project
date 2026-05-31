import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { datesConflict, toIsoString } from "../lib/criterion-concurrency";

describe("criterion concurrency", () => {
  it("toIsoString normalizes Date", () => {
    const iso = toIsoString(new Date("2024-06-01T12:00:00.000Z"));
    assert.equal(iso, "2024-06-01T12:00:00.000Z");
  });

  it("datesConflict returns false when actual is missing", () => {
    assert.equal(datesConflict("2024-06-01T12:00:00.000Z", null), false);
  });

  it("datesConflict detects mismatch", () => {
    const actual = new Date("2024-06-01T12:00:00.000Z");
    assert.equal(
      datesConflict("2024-06-01T12:00:01.000Z", actual),
      true
    );
  });

  it("datesConflict allows match", () => {
    const actual = new Date("2024-06-01T12:00:00.000Z");
    assert.equal(
      datesConflict("2024-06-01T12:00:00.000Z", actual),
      false
    );
  });
});
