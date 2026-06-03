# Real-world field testing (ภาคสนาม)

ชุดเครื่องมือสำหรับแผนเก็บข้อมูลการทดสอบภาคสนาม — แอปตรวจ **มยผ. 6301**

**อย่าแก้ไฟล์แผนใน `.cursor/plans/`** — ใช้โฟลเดอร์นี้เป็นที่ทำงานจริง

## ไฟล์สำคัญ

| ไฟล์ | ใช้เมื่อ |
|------|---------|
| [`spreadsheets/field-testing-sessions.csv`](spreadsheets/field-testing-sessions.csv) | 1 แถวต่อ 1 เซสชัน (ส่วน A — เมตา) |
| [`spreadsheets/field-testing-tasks.csv`](spreadsheets/field-testing-tasks.csv) | 1 แถวต่อ 1 งาน T1–T15 ต่อเซสชัน |
| [`spreadsheets/field-testing-bugs.csv`](spreadsheets/field-testing-bugs.csv) | รายงานบั๊ก (ส่วน E) |
| [`spreadsheets/field-testing-ratings.csv`](spreadsheets/field-testing-ratings.csv) | คะแนน 1–5 + สรุปสัมภาษณ์ (ส่วน C) |
| [`OWNER_RUNBOOK.md`](OWNER_RUNBOOK.md) | สคริปต์ผู้ตรวจหลัก T1–T12 |
| [`EDITOR_RUNBOOK.md`](EDITOR_RUNBOOK.md) | สคริปต์ editor T13–T14 |
| [`INTERVIEW_GUIDE.md`](INTERVIEW_GUIDE.md) | คำถามสัมภาษณ์ 10–15 นาที |
| [`FACILITATOR_CHECKLIST_B.md`](FACILITATOR_CHECKLIST_B.md) | เช็กลิสต์เทคนิค (ผู้ดูแลเซสชัน) |
| [`results/PREFLIGHT_REPORT.md`](results/PREFLIGHT_REPORT.md) | ผลก่อนเริ่มเซสชัน |
| [`results/SMOKE_RESULTS.md`](results/SMOKE_RESULTS.md) | smoke HTTP อัตโนมัติ |
| [`results/SYNTHESIS.md`](results/SYNTHESIS.md) | สรุป UX + บล็อกเกอร์เทคนิค |

## คำสั่ง

```bash
# ก่อนเซสชัน (ไม่ต้องมี DB สำหรับ test/validate บางส่วน)
npm run field-test:preflight

# smoke HTTP — ต้องรัน dev server ก่อน: npm run dev
npm run field-test:smoke

# ทดสอบ collaboration ใน DB (ต้องมี .env)
npx tsx --env-file=.env scripts/test-collaboration.ts
```

## ลำดับเซสชัน (ส่วน D)

1. อธิบายผู้ทดสอบ 5 นาที  
2. Owner T1–T12 ตาม [`OWNER_RUNBOOK.md`](OWNER_RUNBOOK.md)  
3. Editor T13–T14 ตาม [`EDITOR_RUNBOOK.md`](EDITOR_RUNBOOK.md)  
4. สัมภาษณ์ตาม [`INTERVIEW_GUIDE.md`](INTERVIEW_GUIDE.md)  
5. กรอก CSV + บั๊ก → อัปเดต [`results/SYNTHESIS.md`](results/SYNTHESIS.md)

## นำเข้า Google Sheets

1. สร้างสเปรดชีตใหม่  
2. File → Import → Upload → เลือกไฟล์ใน `spreadsheets/`  
3. แยกแท็บ: Sessions | Tasks | Bugs | Ratings  
4. แชร์ลิงก์ “Anyone with link can edit” สำหรับทีมเก็บข้อมูลระหว่างภาคสนาม
