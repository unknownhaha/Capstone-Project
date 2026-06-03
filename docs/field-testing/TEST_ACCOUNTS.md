# Test accounts (prep-env)

ใช้ **อีเมลจริงที่เข้าถึงได้** — ไม่ commit รหัสผ่านลง git

| Role | Email (fill in) | Password (local only) | Notes |
|------|-----------------|------------------------|-------|
| Owner | owner+fieldtest@___ | ___ | สมัครใหม่ใน T1 หรือใช้บัญชีทดสอบเฉพาะ |
| Editor | editor+fieldtest@___ | ___ | สมัครแยกก่อน T13 |

## Checklist

- [ ] Owner email ไม่เคยใช้ใน MongoDB ของเซสชันนี้ (หรือลบ user เก่าใน DB dev)
- [ ] Editor email แยกจาก owner
- [ ] OTP ถึงทั้งสองกล่อง (ทดสอบ T2 ก่อนเซสชันจริง)
- [ ] `AUTH_URL` = URL ที่ผู้ทดสอบเปิดบนมือถือ

## ngrok / phone

ถ้าใช้ ngrok ใส่โดเมนใน `next.config.ts` → `allowedDevOrigins` และตั้ง `AUTH_URL` เป็น URL ngrok เดียวกัน
