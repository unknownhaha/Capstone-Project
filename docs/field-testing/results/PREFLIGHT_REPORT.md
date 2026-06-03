# Preflight report

Generated: 2026-06-03T05:31:35.836Z
Git commit: `78a169b`

## Summary

**Automated checks: NEEDS ATTENTION** — fix failures before field sessions

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
| npm run build | FAIL |

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
test'
      ...
    # Subtest: rejects invalid status
    ok 3 - rejects invalid status
      ---
      duration_ms: 1.0912
      type: 'test'
      ...
    # Subtest: rejects invalid buildingType
    ok 4 - rejects invalid buildingType
      ---
      duration_ms: 0.4831
      type: 'test'
      ...
    # Subtest: allows coverImg-only patch body
    ok 5 - allows coverImg-only patch body
      ---
      duration_ms: 0.3861
      type: 'test'
      ...
    # Subtest: allows valid metadata patch
    ok 6 - allows valid metadata patch
      ---
      duration_ms: 0.4921
      type: 'test'
      ...
    1..6
ok 5 - validateProjectPatchBody
  ---
  duration_ms: 11.4732
  type: 'suite'
  ...
1..5
# tests 18
# suites 5
# pass 18
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 1782.5926
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

Command failed: npm run build
npm warn Unknown env config "devdir". This will stop working in the next major version of npm. See `npm help npmrc` for supported config options.
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
Failed to type check.

./app/api/project/[projectId]/leave/route.ts:36:8
Type error: Parameter 'm' implicitly has an 'any' type.

  [90m34 |[0m
  [90m35 |[0m     project.members = (project.members ?? []).filter(
[31m[1m>[0m [90m36 |[0m       (m) => [33mString[0m(m.userId) !== userId
  [90m   |[0m        [31m[1m^[0m
  [90m37 |[0m     );
  [90m38 |[0m     [36mawait[0m project.save();
  [90m39 |[0m
Next.js build worker exited with code: 1 and signal: null
```


## Manual before sessions

- [ ] Two test accounts (owner + editor emails)
- [ ] Single `npm run dev` on port 3000
- [ ] `AUTH_URL` matches URL testers open (ngrok/LAN if on phone)
- [ ] Import spreadsheets from `docs/field-testing/spreadsheets/`
