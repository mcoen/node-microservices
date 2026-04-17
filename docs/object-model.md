# Node Microservices Object Model

## Overview
This service models legal matters and proceedings, with shared person data reused across users and participants.

## Core Objects

### Person
Shared identity data.

| Field | Type | Notes |
|---|---|---|
| id | string | Primary identifier (`person-*`) |
| createdDate | datetime string | ISO-8601 |
| firstName | string | Required |
| lastName | string | Required |
| email | string | Required |
| phone | string | Optional |

---

### User
Application identity tied to a `Person`.

| Field | Type | Notes |
|---|---|---|
| id | string | Primary identifier (`user-*`) |
| createdDate | datetime string | ISO-8601 |
| personId | string | FK → `Person.id` |
| username | string | Login/display name |
| role | string | e.g., Attorney, User |
| active | boolean | Active status |

---

### Participant
Legal-proceeding participant tied to a `Person` and optionally to a `User`.

| Field | Type | Notes |
|---|---|---|
| id | string | Primary identifier (`participant-*`) |
| createdDate | datetime string | ISO-8601 |
| personId | string | FK → `Person.id` |
| userId | string/null | Optional FK → `User.id` |
| participantType | string | e.g., Attorney, Witness |

Derived/read model commonly includes:
- `displayName` (from Person first/last name)
- `email` (from Person)

---

### Matter
Container for legal work; has 0..* proceedings.

| Field | Type | Notes |
|---|---|---|
| id | string | Primary identifier (`m-*`) |
| createdDate | datetime string | ISO-8601 |
| name | string | Required |
| description | string | Required |
| client | string | Required |
| status | string | Open / Pending / Closed |

Derived/read model may include:
- `proceedingCount`

---

### Proceeding
Scheduled legal event attached to one `Matter` and one-or-more `Participants`.

| Field | Type | Notes |
|---|---|---|
| id | string | Primary identifier (`p-*`) |
| matterId | string | FK → `Matter.id` |
| createdDate | datetime string | ISO-8601 |
| scheduledDate | datetime string | ISO-8601 |
| proceedingType | string | Deposition, Hearing, etc. |
| client | string | Required |
| participantIds | string[] | FK set → `Participant.id` |
| participants | string[] | Denormalized participant names |
| location | string | Required |

Derived/read model may include:
- `participantNames`

---

## Relationships

- `Person` 1 — 0..1 `User` (in current seed model, one user references one person)
- `Person` 1 — 0..* `Participant`
- `User` 0..1 — 0..* `Participant` (participant may reference user)
- `Matter` 1 — 0..* `Proceeding`
- `Proceeding` * — * `Participant` (via `participantIds`)

## Diagram
See `docs/object-model.svg`.
