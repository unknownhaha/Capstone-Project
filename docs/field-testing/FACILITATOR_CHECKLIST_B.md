# Facilitator checklist — ส่วน B (เทคนิค)

ติ๊กระหว่างเซสชัน **ไม่ถามผู้ใช้** — บันทึกใน `notes` ของเซสชันหรือบั๊ก

รันอัตโนมัติบางข้อ: `npm run field-test:smoke` (ต้องมี dev server)

---

## Auth และ middleware

- [ ] `/allproject` ไม่ล็อกอิน → `/login?callbackUrl=...`
- [ ] `/login` ล็อกอินแล้ว → `/profile`
- [ ] `GET /api/project` ไม่มีคุกกี้ → 401

## Flow ยืนยันตัวตน

- [ ] ข้อความ validate สมัครเข้าใจได้
- [ ] OTP ถึง / resend / ผิด OTP
- [ ] Login รหัสผิด / อีเมลยังไม่ verify
- [ ] Session หลัง refresh / logout

## ประตูโปรไฟล์

- [ ] ProfileRequiredModal เมื่อโปรไฟล์ไม่ครบ
- [ ] สร้างได้หลังครบ
- [ ] `POST /api/project` → 403 + `missingFields`

## แดชบอร์ด

- [ ] หัวข้อ My Projects / โครงการของฉัน (ไม่มี subtitle แดชบอร์ด)
- [ ] วงความคืบหน้า ตัวอักษรไม่ชิดขอบ
- [ ] ช่องสถานที่ modal ตัวอักษรขาวบนพื้นเข้ม
- [ ] ค้นหา / empty / no results
- [ ] พื้นที่กด ~44px

## ขั้นตอนตรวจสอบ

- [ ] หมวดตรงกลุ่มที่เลือก
- [ ] คะแนนบันทึก แถบความคืบหน้าอัปเดต
- [ ] หมายเหตุ blur อัปโหลด error ชัด
- [ ] ภาพอ้างอิง + lightbox มือถือ
- [ ] 409 สองคนแก้เกณฑ์เดียวกัน

## Collaboration

- [ ] แชร์ เปิด collaboration คัดลอกลิงก์
- [ ] Editor join + Shared badge ไม่มี kebab owner
- [ ] ปิด collaboration / หมุนลิงก์ (ถ้าทดสอบ)

## ปิดโครงการและรายงาน

- [ ] ปิด disabled จนให้คะแนนครบ
- [ ] รายงานหลังปิด

## ประสิทธิภาพ

- [ ] โหลดครั้งแรก ≤ ~3s (จดถ้าเกิน)
- [ ] อัปโหลด progress / error
- [ ] visibility refresh แดชบอร์ด

---

## อ้างอิง smoke อัตโนมัติ

ดู [`results/SMOKE_RESULTS.md`](results/SMOKE_RESULTS.md)
