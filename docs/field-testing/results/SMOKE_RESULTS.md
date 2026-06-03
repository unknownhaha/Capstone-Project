# Smoke results (HTTP)

Generated: 2026-06-01T08:52:26.459Z
Base URL: `http://localhost:3000`

## Results

| Check | Result | Detail |
|-------|--------|--------|
| Server reachable (GET /login) | PASS | status 200 |
| GET /allproject unauthenticated → redirect login | PASS | status 307 location /login?callbackUrl=%2Fallproject |
| GET /api/project without cookie → 401 | PASS | status 401 |
| POST /api/auth/register empty body → 400 | PASS | status 400 |
| GET /join/[token] public page | PASS | status 200 |
| GET /login?callbackUrl= present | PASS | status 200 |

## Facilitator mapping (section B)

- Auth redirect `/allproject` → first row after server check
- API 401 → `GET /api/project` row
- Register validation → register POST row
- Join flow entry → join page row

Remaining section B items require logged-in UI (see FACILITATOR_CHECKLIST_B.md).
