# AfroID — Identity Seal

An AfroID is the permanent, sovereign digital identity of every Viewdicon citizen. It is generated **once** at the end of the Naming Ceremony and **never changes**.

---

## Format

```
AFR-NGA-TCH-000042
 │   │   │    │
 │   │   │    └── 6-digit sequential counter (zero-padded)
 │   │   └─────── 3-letter village code
 │   └─────────── 3-letter country code (ISO 3166-1 alpha-3)
 └─────────────── Platform prefix (always "AFR")
```

### Examples

| AfroID | Country | Village | Sequence |
|--------|---------|---------|----------|
| `AFR-NGA-TCH-000042` | Nigeria | Technology | 42 |
| `AFR-GHA-AGR-001122` | Ghana | Agriculture | 1122 |
| `AFR-ZAF-HLT-010001` | South Africa | Health | 10001 |
| `AFR-USA-MED-000007` | United States (diaspora) | Media | 7 |

---

## Required Inputs

To generate an AfroID, the following must be present at registration:

| Input | Field | Source |
|-------|-------|--------|
| Country code | `countryCode` | Detected from phone number dial code (ISO 2-letter, e.g., `NG`) |
| Village ID | `villageId` | Selected in VILLAGE step of ceremony (e.g., `technology`) |
| Heritage (unused in format) | `heritage` | Recorded but not encoded in the ID |

If `villageId` is missing or unrecognized, the village segment falls back to `AFR` (e.g., `AFR-NGA-AFR-000042`). This is a degraded state — always provide villageId.

---

## Country Code Map

The generator converts ISO 2-letter codes to 3-letter codes. All African nations are supported plus major diaspora countries:

| 2-letter | 3-letter | Country |
|----------|----------|---------|
| NG | NGA | Nigeria |
| GH | GHA | Ghana |
| KE | KEN | Kenya |
| ZA | ZAF | South Africa |
| EG | EGY | Egypt |
| ET | ETH | Ethiopia |
| TZ | TZA | Tanzania |
| UG | UGA | Uganda |
| SN | SEN | Senegal |
| CI | CIV | Côte d'Ivoire |
| CM | CMR | Cameroon |
| US | USA | United States |
| GB | GBR | United Kingdom |
| CA | CAN | Canada |
| FR | FRA | France |
| BR | BRA | Brazil |
| JM | JAM | Jamaica |
| (+ 40 more) | | See `services/auth-core/src/lib/afroId.ts` |

---

## Village Code Map

| Village slug | Code |
|-------------|------|
| agriculture | AGR |
| health | HLT |
| education | EDU |
| justice | JUS |
| finance | FIN |
| builders | BLD |
| technology | TCH |
| arts | ART |
| media | MED |
| commerce | COM |
| security | SEC |
| spirituality | SPI |
| fashion | FSH |
| family | FAM |
| transport | TRP |
| energy | ENE |
| hospitality | HSP |
| government | GOV |
| sports | SPT |
| holdings | HLD |

---

## When Is AfroID Generated

1. User completes **CONFIRM** step of Naming Ceremony
2. `handlePreCoronation()` calls `handleRegister()` → `POST /api/v1/auth/register`
3. Backend calls `generateAfroId(heritage, countryCode, 1, undefined, villageId)`
4. AfroID is atomically incremented in **Redis** (`afroid_counter_seq` key)
5. AfroID is written to the `User` table in PostgreSQL (`afroId` column)
6. Backend returns the token — AfroID is NOT in the register response
7. **CORONATION** step calls `POST /api/v1/auth/reveal-afroid` (authenticated)
8. Backend looks up `user.afroId` from DB and returns it
9. AfroID is displayed on the Coronation screen with a copy button

---

## Where AfroID Is Stored

| Location | Field | Notes |
|----------|-------|-------|
| PostgreSQL `User` table | `afroId` | Primary source of truth. `String? @unique` |
| Zustand `authStore` | `user.afroId` | In-memory, lost on refresh — refetched via `/api/v1/me` |
| `localStorage['afk-auth']` | `state.user.afroId` | Persisted by Zustand-persist middleware |

---

## How to Verify AfroID Was Generated

```sql
-- Check the most recently registered user
SELECT "firstName", "afroId", "villageId", "roleKey", "onboardingComplete"
FROM "User"
ORDER BY "createdAt" DESC
LIMIT 1;
```

Expected:
- `afroId` → `AFR-NGA-TCH-000042` (non-null, correct format)
- `villageId` → one of the 20 village IDs (non-null)
- `roleKey` → a valid role key string (non-null)
- `onboardingComplete` → `true`

---

## Sequential Counter (Redis)

The counter is stored in Redis under key `afroid_counter_seq`.

- **Initialized** to `10000` on first use (via `SETNX`)
- **Incremented** atomically via `INCR` on every registration
- **Wraps** at 1,000,000 (6-digit limit): `val % 1000000`
- **Restarts** from 0 if Redis is flushed — use Redis persistence (AOF/RDB) in production

Counter recovery:
```bash
redis-cli GET afroid_counter_seq               # Check current value
redis-cli SET afroid_counter_seq 15000         # Manual recovery if needed
```

---

## Validation

```typescript
import { isValidAfroId } from 'services/auth-core/src/lib/afroId'

isValidAfroId('AFR-NGA-TCH-000042')   // true
isValidAfroId('AFR-GHA-AGR-001122')   // true
isValidAfroId('AFR-NGA-AFR-000001')   // true (degraded — no village)
isValidAfroId('AKN-NG-G1-2026-A2Q4') // true (legacy format — still accepted)
isValidAfroId('not-an-id')            // false
```

Regex for new format: `/^AFR-[A-Z]{3}-[A-Z]{3}-\d{6}$/`

---

## Display Rules

- **Full display** (Coronation screen, Profile page): Show complete AfroID with copy button
- **Masked display** (anywhere else by default): `AFR-NGA-TCH-••••••` (last 6 digits hidden)
- Use `maskAfroId()` from `services/auth-core/src/lib/afroId.ts` for masked display

---

## API: Reveal AfroID

```
POST /api/v1/auth/reveal-afroid
Authorization: Bearer <token>
```

Response:
```json
{ "afroId": "AFR-NGA-TCH-000042" }
```

- Rate limited: **5 calls per 24 hours** per user
- Requires valid JWT access token (set after register)
- Fallback: if this fails, frontend calls `GET /api/v1/me` and reads `user.afroId`

---

## Common Failure Modes

| Symptom | Cause | Fix |
|---------|-------|-----|
| `afroId` is null in DB | `phone_verified` Redis key expired before register | OTP verification has 90 min TTL — run ceremony within 90 min of OTP |
| AfroID shows `AFR-NGA-AFR-000042` (AFR village code) | `villageId` was empty at register call | Ensure VillageStep sets village state before CONFIRM step |
| Coronation shows blank AfroID | `reveal-afroid` called without auth token | Check that `handleRegister()` sets token BEFORE `next()` advances to CORONATION |
| `503` on reveal-afroid | Redis down | Redis must be running — `redis-cli ping` must return PONG |
| AfroID counter reset to 00001 after restart | Redis has no persistence | Enable Redis AOF: `appendonly yes` in redis.conf |
| Login rejects AfroID | Format mismatch | Must match `/^AFR-[A-Z]{3}-[A-Z]{3}-\d{6}$/` — check for lowercase or spaces |
