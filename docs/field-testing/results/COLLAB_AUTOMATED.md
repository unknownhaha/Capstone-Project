# Collaboration — automated verification

**Session ID for human runs:** `E1-___`

## Script

```bash
npx tsx --env-file=.env scripts/test-collaboration.ts
```

Paste last run output below after each preflight.

---

## Last run

**Date:** 2026-06-01

**Unit tests (scripts/test-collaboration.ts [1]):** 15/15 PASS

**Database integration [2]:** SKIPPED — `ECONNREFUSED` MongoDB SRV (network/offline). Re-run when online:

```bash
npx tsx --env-file=.env scripts/test-collaboration.ts
```

## Human tasks still required (T13–T14)

- [ ] Owner enables collaboration and copies invite URL
- [ ] Editor opens `/join/[token]` on second device/account
- [ ] Editor sees "Shared with you" and no owner kebab on project card
- [ ] Editor can score; cannot delete/share/upload cover
- [ ] Optional: 409 when both edit same criterion

Record in `field-testing-tasks.csv` for session `E1-___`.
