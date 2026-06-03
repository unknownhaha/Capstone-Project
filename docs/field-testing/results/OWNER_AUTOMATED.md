# Owner flow — automated / facilitator verification

**Session ID for human runs:** `U1-___` (replace in CSV)

Tasks T1–T12 require a **real participant** on a phone or narrow browser. This file records what was verified without a live user during plan implementation.

## Automated coverage

| Task | Automated? | How |
|------|------------|-----|
| T1 Register | Partial | `POST /api/auth/register` → 400 on empty (smoke) |
| T2 OTP | No | Needs EMAIL_* + real inbox |
| T3 Login callback | Partial | `/login?callbackUrl=` loads (smoke) |
| T4 Profile gate | Unit | `tests/profile-complete.test.ts` |
| T5 Dashboard | No | UI / visual |
| T6 Search | No | UI — `filterProjects` covered indirectly |
| T7 Create project | Partial | API 403 profile in tests |
| T8 Sections | No | UI |
| T9 Score/upload | Partial | `tests/project-patch.test.ts`, concurrency test |
| T10 Figures | No | UI + catalog |
| T11 Progress | Partial | `lib/model/project.ts` pre-save aggregation |
| T12 Complete/report | Partial | `tests/project-complete.test.ts` |

## Facilitator dry-run checklist

When running a real session, copy statuses into `field-testing-tasks.csv`:

- [ ] T1
- [ ] T2
- [ ] T3
- [ ] T4
- [ ] T5
- [ ] T6
- [ ] T7
- [ ] T8
- [ ] T9
- [ ] T10
- [ ] T11
- [ ] T12

## Evidence folder (create per session)

`docs/field-testing/results/evidence/U1-___/`

- screenshots/
- network-har-notes.txt
- server-log-snippet.txt
