# Preflight report

Generated: 2026-06-01T08:50:37.851Z
Git commit: `9d60128`

## Summary

**Automated checks: PASS** (ensure two test emails and single dev server before sessions)

## Environment

| Variable | Status |
|----------|--------|
| MONGO_URI | OK |
| AUTH_SECRET | OK |
| UPLOADTHING_TOKEN | OK |
| EMAIL_USER | OK |
| EMAIL_PASS | OK |

> OTP field tests need EMAIL_USER + EMAIL_PASS (Gmail app password).

## Commands

| Step | Result |
|------|--------|
| .env file exists | PASS |
| env: MONGO_URI | PASS |
| env: AUTH_SECRET | PASS |
| env: UPLOADTHING_TOKEN | PASS |
| env: EMAIL_USER | PASS |
| env: EMAIL_PASS | PASS |
| npm test | PASS |
| npm run validate | PASS |
| npm run build | PASS |

## Details

### .env file exists

```
.env found
```

### env: MONGO_URI

```
set
```

### env: AUTH_SECRET

```
set
```

### env: UPLOADTHING_TOKEN

```
set
```

### env: EMAIL_USER

```
set
```

### env: EMAIL_PASS

```
set
```

### npm test

```
 'test'
      ...
    # Subtest: rejects invalid status
    ok 3 - rejects invalid status
      ---
      duration_ms: 0.4388
      type: 'test'
      ...
    # Subtest: rejects invalid buildingType
    ok 4 - rejects invalid buildingType
      ---
      duration_ms: 0.4787
      type: 'test'
      ...
    # Subtest: allows coverImg-only patch body
    ok 5 - allows coverImg-only patch body
      ---
      duration_ms: 0.3397
      type: 'test'
      ...
    # Subtest: allows valid metadata patch
    ok 6 - allows valid metadata patch
      ---
      duration_ms: 0.3574
      type: 'test'
      ...
    1..6
ok 5 - validateProjectPatchBody
  ---
  duration_ms: 9.5427
  type: 'suite'
  ...
1..5
# tests 17
# suites 5
# pass 17
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 790.4262
```

### npm run validate

```
ollaboration rules
  PASS  ProjectCard checks editor role
  PASS  search filter exists
  PASS  gridMessage style exists
  PASS  project page gates add criteria

[6] Email uses environment variables
  PASS  email reads EMAIL_USER
  PASS  email has no hardcoded gmail pass

[7] Production hygiene (no test hardcodes)
  PASS  profile has no test user id
  PASS  uploadthing profileImg uses session
  PASS  users GET enforces session
  PASS  project PATCH blocks sections replace
  PASS  allproject page has no debug project log

[8] API middleware + collaboration lifecycle
  PASS  middleware guards non-auth API
  PASS  uploadthing exempt from JWT middleware
  PASS  collaboration supports disable
  PASS  invite revoke helper exists
  PASS  project patch validation module

Result: 41 passed, 0 failed
```

### npm run build

```
/[projectId]/criteria/[criteriaGroupId]
├ ƒ /allproject/[projectId]/report
├ ƒ /api/auth/check-email
├ ƒ /api/auth/[...nextauth]
├ ƒ /api/auth/register
├ ƒ /api/auth/verify-otp
├ ƒ /api/auth/verify-otp/resend
├ ƒ /api/join/[token]
├ ƒ /api/ml/predict
├ ƒ /api/project
├ ƒ /api/project/[projectId]
├ ƒ /api/project/[projectId]/add-groups
├ ƒ /api/project/[projectId]/collaboration
├ ƒ /api/project/[projectId]/critiria/[critiriaId]
├ ƒ /api/project/[projectId]/invite
├ ƒ /api/project/[projectId]/section
├ ƒ /api/project/[projectId]/section/[sectionCode]
├ ƒ /api/uploadthing
├ ƒ /api/users/[id]
├ ƒ /join/[token]
├ ○ /login
├ ○ /ml-test
├ ○ /_not-found
├ ○ /profile
├ ○ /register
└ ○ /verify


ƒ Proxy (Middleware)

○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```


## Manual before sessions

- [ ] Two test accounts (owner + editor emails)
- [ ] Single `npm run dev` on port 3000
- [ ] `AUTH_URL` matches URL testers open (ngrok/LAN if on phone)
- [ ] Import spreadsheets from `docs/field-testing/spreadsheets/`
