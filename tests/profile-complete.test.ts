import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getMissingProfileFields,
  isProfileComplete,
} from "../lib/profile-complete";

describe("profile-complete", () => {
  it("flags all optional profile fields when empty", () => {
    const missing = getMissingProfileFields({
      firstName: "Ada",
      lastName: "Lovelace",
      contact: { email: "ada@example.com" },
    });

    assert.deepEqual(missing, [
      "Phone",
      "Address",
      "Job title",
      "Organization / Workplace",
      "Department / Team",
      "Work location",
    ]);
    assert.equal(isProfileComplete({ firstName: "Ada", lastName: "" }), false);
  });

  it("passes when all required profile fields are filled", () => {
    const user = {
      firstName: "Ada",
      lastName: "Lovelace",
      contact: {
        email: "ada@example.com",
        phone: "555-0100",
        address: "123 Main St",
      },
      organization: {
        jobTitle: "Inspector",
        workPlace: "City Hall",
        department: "Accessibility",
        workAddress: "456 Office Rd",
      },
    };

    assert.deepEqual(getMissingProfileFields(user), []);
    assert.equal(isProfileComplete(user), true);
  });
});
