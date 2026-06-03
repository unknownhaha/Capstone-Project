import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseSourceTextForDisplay } from "../lib/standards/format-source-text.ts";

describe("parseSourceTextForDisplay", () => {
  it("parses enriched sections into bullets", () => {
    const raw =
      "[ข้อกำหนดในหมวดนี้]\nปุ่มกดต้องเป็นไปตามข้อ 3.1.7.2\n\n[ข้อที่อ้างอิง 3.1.7.2]\nส่วนที่ใช้มือ ต้องทำได้ด้วยมือข้างเดียว\n\nแรงต้องไม่เกิน 22.20 นิวตัน";
    const sections = parseSourceTextForDisplay(raw);
    assert.equal(sections.length, 2);
    assert.equal(sections[0].heading, "ข้อกำหนดในหมวดนี้");
    assert.equal(sections[0].bullets.length, 1);
    assert.equal(sections[1].heading, "ข้อที่อ้างอิง 3.1.7.2");
    assert.equal(sections[1].bullets.length, 2);
  });

  it("splits plain text on paragraph breaks", () => {
    const raw = "บรรทัดแรก\n\nบรรทัดที่สอง";
    const sections = parseSourceTextForDisplay(raw);
    assert.equal(sections.length, 1);
    assert.equal(sections[0].bullets.length, 2);
  });

  it("returns empty for blank input", () => {
    assert.deepEqual(parseSourceTextForDisplay(""), []);
    assert.deepEqual(parseSourceTextForDisplay("   "), []);
  });
});
