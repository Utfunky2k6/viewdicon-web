# Village Registry — How It Works

The Village Registry is the authoritative source for all 20 digital villages in the Viewdicon civilization. Every user belongs to exactly one primary village. Villages determine what tools are available, what roles exist, and how XP/Cowrie is earned.

---

## Service

- **Port**: `3002`
- **Process name (PM2)**: `village-registry`
- **DB**: PostgreSQL — `village_registry` database, user `afro`, password `afro`
- **Restart**: `pm2 restart village-registry`

---

## API Endpoints

All endpoints respond with `{ ok: true, data: ... }` wrapper (NOT a flat array).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check — returns village count |
| GET | `/v1/villages` | All 20 villages with roles + member counts |
| GET | `/v1/villages/:villageId` | Single village detail (roles, sectors, member count) |
| GET | `/v1/villages/:villageId/tools` | All role-tools for a village (filter by `?roleKey=`) |
| GET | `/v1/villages/:villageId/members` | Member list + count (paginated, max 50) |
| GET | `/v1/villages/:villageId/stats` | Live stats: memberCount, toolCount, activeSessionCount |
| GET | `/v1/villages/cultural-metadata` | Lightweight map: ancientName + guardian + meaning per village |
| GET | `/v1/occupations` | All occupations (filter by `?search=&villageId=`) |
| POST | `/v1/village-memberships` | Create membership directly (used after ceremony for Circle 1/2) |
| POST | `/v1/village-applications` | Submit village application (quiz score ≥60, 200-char statement) |
| GET | `/v1/village-applications/:userId` | Get user's applications |
| POST | `/v1/village-applications/:id/endorse` | Endorse an application |
| POST | `/v1/village-applications/:id/review` | Admin approve/reject application |
| POST | `/v1/village-transfers` | Initiate a village transfer |
| POST | `/v1/village-transfers/:id/confirm` | Execute a confirmed transfer |
| GET | `/v1/village-transfers/:userAfroId` | User's transfer history |
| GET | `/v1/memberships/crest` | Get crest level: `?afroId=X&villageId=Y` |
| POST | `/v1/tool-sessions` | Start a tool session |
| GET | `/v1/tool-sessions` | Get sessions: `?userAfroId=X&villageId=Y&status=ACTIVE` |
| PATCH | `/v1/tool-sessions/:id` | Update session status (ACTIVE/PAUSED/COMPLETED/ARCHIVED) |

**Note**: Every endpoint also accepts the `/api/v1/...` prefix (dual-registered).

### Example: List All Villages

```bash
curl http://localhost:3002/v1/villages
```
Response:
```json
{
  "ok": true,
  "data": [
    {
      "id": "agriculture",
      "name": "Agriculture Village",
      "ancientName": "KEMET",
      "guardian": "Osiris",
      "memberCount": 47,
      "roles": [...]
    },
    ...
  ]
}
```

**IMPORTANT**: The response is `{ ok, data }` — NOT a plain array. Frontend must access `response.data.data` (Axios) or `json.data` (fetch) to get the array.

---

## Frontend Connection

The frontend does NOT call the village registry at runtime for the naming ceremony. The ceremony uses **static data** from:

```
viewdicon-web/lib/villages-data.ts
```

This file contains all 20 villages in TypeScript — it is the source of truth for the ceremony's VillageStep. No network call needed.

For dynamic village data (dashboard, village detail pages), the frontend calls through the Next.js proxy:

```
viewdicon-web/app/api/v1/villages/[villageId]/route.ts
```

Which rewrites to `http://localhost:3002/api/v1/villages/:villageId`.

---

## The 20 Villages — Complete ID Reference

This is the canonical list. Never hardcode village names — always use the `id` slug.

| ID | Ancient Name | English Name | Code | Guardian | Category |
|----|-------------|--------------|------|----------|----------|
| `commerce` | WANGARA | Commerce Village | COM | Anansi | economy |
| `agriculture` | KEMET | Agriculture Village | AGR | Osiris | economy |
| `health` | DESHRET | Health Village | HLT | Sekhmet | economy |
| `education` | TIMBUKTU | Education Village | EDU | Orunmila | people |
| `justice` | NUBIAN_LAW | Justice Village | JUS | Maat | civic |
| `finance` | AKSUM | Finance Village | FIN | Shango | economy |
| `builders` | GREAT_ZIMBABWE | Builders Village | BLD | Ogun | economy |
| `technology` | MEROE | Technology Village | TCH | Thoth | economy |
| `arts` | BENIN_BRONZES | Arts Village | ART | Yemoja | creative |
| `media` | GRIOTS | Media Village | MED | Oduduwa | creative |
| `security` | DAHOMEY | Security Village | SEC | Oya | civic |
| `spirituality` | IFAA | Spirituality Village | SPI | Obatala | spirit |
| `fashion` | KENTE | Fashion Village | FSH | Oshun | creative |
| `family` | UBUNTU | Family Village | FAM | Oshun | people |
| `transport` | SAHEL_ROAD | Transport Village | TRP | Eshu | economy |
| `energy` | ASWAN | Energy Village | ENE | Ra | economy |
| `hospitality` | SOFALA | Hospitality Village | HSP | Nimba | people |
| `government` | CARTHAGE | Government Village | GOV | Shango | civic |
| `sports` | MANDINKA | Sports Village | SPT | Chukwu | people |
| `holdings` | CROSSROADS | Holdings Village | HLD | Eshu | civic |

**Holdings** is the default village for users who haven't selected a primary village. It has no professional role requirements.

---

## Roles Per Village

Each village has exactly **8 canonical roles**. The full role list lives in `viewdicon-web/lib/villages-data.ts`.

The village registry service also has a `resolveCanonicalRole()` utility that maps niche role strings (e.g., "Medical Doctor") to canonical slugs (e.g., "doctor"). This runs before any tool session lookup.

---

## Crest Levels

Each membership has a `crestLevel` (1–5). Higher crests unlock more tools.

| Crest | Label | Tools Unlocked |
|-------|-------|---------------|
| I | Newcomer | Basic tools |
| II | Member | Risk / Credit / Escrow tools |
| III | Elder | Compliance / Grant / Case tools |
| IV | Chief | Territory / Bulk tools |
| V | Sovereign | All tools, auto-approve transfers |

Crest level also reduces village transfer cooldowns (V = −50 days).

---

## Village Transfer Cooldowns

Cooldown in days by reason (before crest reduction):

| Reason | Days |
|--------|------|
| CAREER_CHANGE | 90 |
| SKILL_EVOLUTION | 60 |
| LIFE_EVENT | 30 |
| EDUCATION | 30 |
| RETURNING_CITIZEN | 14 |
| GRIOT_GUIDANCE | 45 |
| MULTI_VILLAGE | 0 (adds second village, keeps primary) |
| OTHER | 180 |

---

## Common Failure Modes

| Symptom | Cause | Fix |
|---------|-------|-----|
| VillageStep shows empty grid | `ALL_VILLAGES` import broken | Check `import { ALL_VILLAGES } from '@/lib/villages-data'` |
| `Cannot read property 'data' of undefined` | Caller forgot `{ ok, data }` wrapper | Access `.data` on the API response body |
| Village tools return 404 | roleKey not resolved to canonical slug | Check `resolveCanonicalRole()` in village registry src |
| Village not found (404) | villageId slug wrong (e.g., 'tech' vs 'technology') | Use only the IDs from the table above |
| Membership creation 409 | User already a member | Safe to ignore — idempotent after ceremony |
