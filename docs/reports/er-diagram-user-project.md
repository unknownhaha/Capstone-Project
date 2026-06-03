# ER Diagram — User & Project (MongoDB / Mongoose)

Logical entity-relationship view of `lib/model/user.ts` and `lib/model/project.ts`.  
In MongoDB, **ProjectSection**, **ProjectCriterion**, and **ProjectMember** are **embedded subdocuments** inside a `Project` document, not separate collections.

---

## Diagram (Mermaid)

Paste into GitHub, Notion, or [mermaid.live](https://mermaid.live) to export PNG/SVG for your report.

```mermaid
erDiagram
  USER {
    ObjectId _id
    string firstName
    string lastName
    string password "select false"
    string profileImg
    boolean isEmailVerified
    string contact_email "contact.email, unique"
    string contact_phone "contact.phone"
    string contact_address "contact.address"
    string org_jobTitle "organization.jobTitle"
    string org_department "organization.department"
    string org_workPlace "organization.workPlace"
    string org_workAddress "organization.workAddress"
    ObjectId[] projects "ref Project, optional"
    datetime createdAt
    datetime updatedAt
  }

  PROJECT {
    ObjectId _id
    ObjectId userId "owner, ref User"
    string standardKey "default inclusive-education-v1"
    string projectName "max 30"
    string coverImg
    string description
    datetime surveyDate
    string institution_address "institution.address, site location"
    enum buildingType "single_floor | multi_floor"
    enum status "draft | completed"
    datetime completedAt
    boolean collaborationEnabled
    number totalScore "computed on save"
    number maxScore
    number scorePercent
    number answeredCriteria
    number totalCriteria
    number completionRate
    datetime createdAt
    datetime updatedAt
  }

  PROJECT_MEMBER {
    ObjectId userId "ref User"
    enum role "editor"
    datetime joinedAt
  }

  PROJECT_SECTION {
    string code "within project"
    string[] selectedGroups
    number totalScore "computed"
    number maxScore
    number scorePercent
    number answeredCriteria
    number totalCriteria
    number completionRate
  }

  PROJECT_CRITERION {
    string criteriaId "มยผ catalog id"
    enum score "0 | 1 | 2 | null"
    string note
    string img "deprecated"
    string[] imgs "inspection photos"
    datetime updatedAt "concurrency"
  }

  USER ||--o{ PROJECT : "owns (userId)"
  USER }o--o{ PROJECT : "listed in user.projects"
  USER ||--o{ PROJECT_MEMBER : "joins as editor"
  PROJECT ||--|{ PROJECT_MEMBER : "embeds members[]"
  PROJECT ||--|{ PROJECT_SECTION : "embeds sections[]"
  PROJECT_SECTION ||--|{ PROJECT_CRITERION : "embeds criteria[]"
```

---

## Relationship summary

| Relationship | Cardinality | Implementation |
|--------------|-------------|----------------|
| User **owns** Project | 1 : N | `Project.userId` → `User._id` |
| User **references** Project | 1 : N (optional) | `User.projects[]` → `Project._id` |
| User **member of** Project | M : N | `Project.members[].userId` → `User._id`, role `editor` |
| Project **contains** Section | 1 : N | Embedded `sections[]` |
| Section **contains** Criterion | 1 : N | Embedded `sections[].criteria[]` |

---

## Related collections (optional appendix)

Not part of the core User/Project inspection model, but used by the app:

| Collection | Links to |
|------------|----------|
| `ProjectInvite` | `projectId` → Project, `createdBy` → User |
| `OTP` | `email` matches `User.contact.email` (no ObjectId link) |

---

## Notes for your report

1. **Owner vs editor:** The project **owner** is always `Project.userId`. **Editors** appear only in `members[]` when collaboration is enabled.
2. **Computed fields:** `totalScore`, `completionRate`, etc. are recalculated in a Mongoose `pre("save")` hook from criterion scores (0 / 1 / 2).
3. **Standards data:** Criterion definitions live in static JSON (`lib/standards/`); only scores and notes are stored in `ProjectCriterion`.
4. **Diagram style:** This is a **logical ER** view. Physically, MongoDB stores one `Project` document with nested arrays, not separate tables for sections or criteria.
