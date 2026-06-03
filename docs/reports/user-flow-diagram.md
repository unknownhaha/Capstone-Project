# User Flow Diagrams — Accessibility Inspection App

Based on the **Main User Flow** and feature slides in [`capstone-project-slides.html`](../presentation/capstone-project-slides.html) (Capstone presentation — มยผ. 6301).

Use [mermaid.live](https://mermaid.live) to export PNG/SVG for your report.

---

## 1. Main inspector flow (from presentation slide *Main User Flow*)

This matches the slide text:

> Login / Register → All Projects → Create project → Section picker → Criteria checklist → Score, notes, photos + reference image  
> Share: owner enables collaboration → copy `/join/[token]`

```mermaid
%%{init: {'theme': 'dark'}}%%
flowchart TD
  Start([Open app]) --> Auth{Logged in?}
  Auth -->|No| AuthFlow[[Login / Register]]
  Auth -->|Yes| Dashboard["All Projects<br/>/allproject"]

  AuthFlow --> Dashboard

  Dashboard --> Create["Create project<br/>Select criteria groups"]
  Create --> APICreate["POST /api/project"]
  APICreate --> Dashboard

  Dashboard --> OpenProject["Open project"]
  OpenProject --> Sections["Section picker<br/>/allproject/projectId"]
  Sections --> Criteria["Criteria checklist<br/>/allproject/projectId/criteria/groupId"]

  Criteria --> Inspect["Score 0 / 1 / 2<br/>Notes + inspection photos<br/>View reference figures ภาพอ้างอิง"]
  Inspect --> Criteria
  Inspect --> Dashboard

  Dashboard --> Share["Owner: enable collaboration"]
  Share --> Invite["Copy invite link<br/>/join/token"]
  Invite --> Join["Editor opens link<br/>POST /api/join/token"]
  Join --> Dashboard
```

---

## 2. Authentication & onboarding flow

Derived from slides *What Inspectors Can Do*, *API Endpoints — Collaboration & Auth*, and app routes (`login/`, `register/`, `verify/`).

```mermaid
%%{init: {'theme': 'dark'}}%%
flowchart LR
  subgraph register [Register path]
    R1["/register"] --> R2["POST /api/auth/register"]
    R2 --> R3["/verify<br/>OTP email"]
    R3 --> R4["POST /api/auth/verify-otp"]
    R4 --> R5["Account verified"]
  end

  subgraph login [Login path]
    L1["/login"] --> L2["NextAuth Credentials<br/>POST /api/auth/...nextauth"]
    L2 --> L3{Session OK?}
    L3 -->|Yes| L4["Redirect e.g. /allproject"]
    L3 -->|No| L1
  end

  R5 --> L1
  L4 --> Profile["/profile<br/>Optional: avatar, org info"]
  Profile --> Dashboard["/allproject"]
```

---

## 3. Inspection workflow (detail)

Expands the middle of the main flow using *Domain Model — Project* and *Standards Catalog* slides.

```mermaid
%%{init: {'theme': 'dark'}}%%
flowchart TD
  A["Project dashboard<br/>completion % on card"] --> B["Pick section<br/>from มยผ. catalog"]
  B --> C["Pick criteria group"]
  C --> D["For each criterion"]

  D --> E["Read display_text<br/>from STANDARDS_CATALOG"]
  E --> F["Optional: open reference figure<br/>figure-map.json / public/standards/figures"]
  F --> G["Set score 0, 1, or 2"]
  G --> H["Add note"]
  H --> I["Upload inspection photo<br/>UploadThing inspectionImg"]
  I --> J["PATCH /api/project/.../critiria/criteriaId"]
  J --> K["Pre-save hook updates<br/>completionRate, scorePercent"]
  K --> D
  K --> A

  J --> Conflict{409 conflict?}
  Conflict -->|Yes| L["Show error, refresh criterion"]
  Conflict -->|No| K
  L --> D
```

---

## 4. Collaboration flow (from *Share* slide + API table)

```mermaid
%%{init: {'theme': 'dark'}}%%
sequenceDiagram
  actor Owner
  actor Editor
  participant App
  participant API

  Owner->>App: Open project share dialog
  Owner->>API: Enable collaboration
  Owner->>API: POST /api/project/projectId/invite
  API-->>Owner: Invite URL /join/token

  Owner->>Editor: Send link

  Editor->>App: Open /join/token
  alt Not logged in
    Editor->>App: Login / Register first
  end
  Editor->>API: POST /api/join/token
  API-->>Editor: Added as member editor

  Editor->>App: /allproject shows shared project
  Editor->>API: PATCH criterion scores
  Note over Owner,Editor: Owner retains delete, share, cover upload
```

---

## 5. Route & API map (presentation reference)

| Step | UI route | API (from slides) |
|------|----------|-------------------|
| Register | `/register` | `POST /api/auth/register` |
| Verify email | `/verify` | `POST /api/auth/verify-otp`, resend |
| Login | `/login` | NextAuth `/api/auth/[...nextauth]` |
| Profile | `/profile` | `GET/PATCH /api/users/[id]` |
| Project list | `/allproject` | `GET /api/project` |
| Create project | modal on dashboard | `POST /api/project` |
| Project detail | `/allproject/[projectId]` | `GET /api/project/[projectId]` |
| Criteria | `/allproject/.../criteria/[groupId]` | `PATCH .../critiria/[critiriaId]` |
| Invite | share dialog | `POST .../invite`, `POST /api/join/[token]` |
| Uploads | in forms | `POST /api/uploadthing` |

---

## 6. Actors (for report caption)

| Actor | Can do (from slides + app) |
|-------|----------------------------|
| **Inspector (owner)** | Register, create projects, select criteria groups, score, upload photos, view reference figures, track completion %, share invites |
| **Editor (member)** | Join via `/join/[token]`, score criteria on shared project (limited permissions) |
| **System** | Load มยผ. 6301 from JSON catalog; recalculate completion on save; store data in MongoDB |

---

## Source slide reference

Primary flow text is on slide **"Main User Flow"** in `docs/presentation/capstone-project-slides.html`:

```
Login / Register → All Projects (/allproject)
↓ Create project (select criteria groups) → POST /api/project
↓ Section picker → Criteria checklist
↓ Score, notes, photos + reference image (ภาพอ้างอิง)
Share: owner enables collaboration → copy /join/[token]
```

Supporting slides: **What Inspectors Can Do**, **Domain Model — Project**, **Standards Catalog**, **API Endpoints — Projects**, **API Endpoints — Collaboration & Auth**, **UploadThing**.
