# Naming Ceremony — How It Works

The Naming Ceremony (`/ceremony`) is the onboarding flow that every new user passes through. It is the only way to create a Viewdicon identity. It must be completed before the user can access the dashboard.

---

## Step Sequence

The sequence is determined by the user's Circle (heritage identity). It is built by `buildSequence()` in `app/(auth)/ceremony/page.tsx`.

### Circle 1 — Continental African (African SIM or phone number)
```
TERMS → PRIVACY → PHONE → OTP → DEVICE → FINGERPRINT → BIOMETRIC → VOICE
→ HERITAGE → NAMING → FAMILY → VILLAGE → ROLE → CONFIRM → CORONATION
```
15 steps total.

### Circle 2 — Diaspora African
```
TERMS → PRIVACY → PHONE → OTP → CIRCLES → HERITAGE_VERIFY → DEVICE → FINGERPRINT
→ BIOMETRIC → VOICE → HERITAGE → NAMING → FAMILY → VILLAGE → ROLE → CONFIRM → CORONATION
```
17 steps total.

### Circle 3 — Friend / Ally
```
TERMS → PRIVACY → PHONE → OTP → CIRCLES → DEVICE → ALLY_NAME → ALLY_CORONATION
```
8 steps total. No village, no role, no naming ceremony.

### Default (circle not yet detected)
```
TERMS → PRIVACY → PHONE → OTP → CIRCLES → DEVICE → FINGERPRINT → BIOMETRIC → VOICE
→ HERITAGE → NAMING → FAMILY → VILLAGE → ROLE → CONFIRM → CORONATION
```
16 steps.

---

## What Each Step Does

| Step | Purpose | Data Collected |
|------|---------|---------------|
| TERMS | Oath of entry checkbox | None (gate only) |
| PRIVACY | Privacy consent accept | None (gate only) |
| PHONE | Phone number entry | `ceremonyPhone`, `ceremonyDialCode`, `ceremonyCountryCode` |
| OTP | 6-digit phone verification | Calls `POST /api/v1/auth/verify-phone` to mark phone verified in Redis (90 min TTL) |
| CIRCLES | Heritage circle selection | Sets `circle` (1/2/3) |
| HERITAGE_VERIFY | Diaspora heritage quiz | Sets `circle=2` on pass, `circle=3` on fail |
| DEVICE | Device fingerprint + voice oath | `voicePrint` hash |
| FINGERPRINT | WebAuthn biometric enroll | Saved to browser credential store |
| BIOMETRIC | Face + fingerprint confirmation | Biometric step UI only |
| VOICE | Voice pattern capture | Saved to `voiceSignature` field |
| HERITAGE | Heritage group selection | `selectedHeritage` |
| NAMING | 5-tab identity form | `fullName`, `dateOfBirth`, `ancestralNation`, `ethnicGroup`, `motherName`, `fatherName`, `occupation`, etc. → `namingDataRef.current` |
| FAMILY | Kinship circle builder | Optional family members (no API call) |
| VILLAGE | Village selection | `village` (Village object) |
| ROLE | Role selection within village | `role` string, `occ` Occupation |
| CONFIRM | Review screen | Calls `handlePreCoronation` → `handleRegister()` → backend |
| CORONATION | AfroID reveal + celebration | Calls `POST /api/v1/auth/reveal-afroid` to display AfroID |
| ALLY_NAME | Ally display name | `allyName` |
| ALLY_CORONATION | Ally coronation | Calls `handleDone()` → `authApi.register()` |

---

## API Calls Made During Ceremony

### 1. Send OTP — `POST /api/v1/auth/send-otp`
Called at PHONE step.
```json
{ "phone": "+2348000000001", "languageCode": "en" }
```
Response: `{ "message": "OTP sent", "devCode": "123456" }` (devCode visible in dev)

### 2. Verify Phone — `POST /api/v1/auth/verify-phone`
Called at OTP step (NOT the same as verify-otp for login).
```json
{ "phone": "+2348000000001", "otp": "123456" }
```
Response: `{ "verified": true }` — marks phone as verified in Redis for 90 minutes.

### 3. Ceremony Heartbeat — `POST /api/v1/auth/ceremony-heartbeat`
Optional. Called periodically to reset the phone_verified TTL during long ceremonies.
```json
{ "phone": "+2348000000001" }
```

### 4. Register — `POST /api/v1/auth/register`
Called at CONFIRM step via `handlePreCoronation` → `handleRegister()`.

**Full request payload:**
```json
{
  "phone": "+2348000000001",
  "countryCode": "NG",
  "heritageCircle": "continental",
  "displayName": "Taiwo Adeyemi",
  "fullName": "Taiwo Adeyemi",
  "dateOfBirth": "15/03/1995",
  "gender": "male",
  "heritage": "yoruba",
  "languageCode": "en",
  "villageId": "technology",
  "roleKey": "Software Engineer",
  "ancestralNation": "Yoruba Empire",
  "ethnicGroup": "Egba",
  "motherName": "Funke",
  "fatherName": "Segun",
  "occupation": "Developer",
  "residenceCountry": "NG",
  "residenceCity": "Lagos"
}
```
Response: `{ "userId": "uuid", "accessToken": "jwt", "refreshToken": "jwt", "message": "Registration complete." }`

**After register:** Tokens are stored in authStore (Zustand) + localStorage + cookies. `afk_token` and `afk_ceremony_done` cookies are both set.

### 5. Reveal AfroID — `POST /api/v1/auth/reveal-afroid`
Called at CORONATION step (requires auth token from step 4).
Response: `{ "afroId": "AFR-NGA-TCH-000042" }`
Rate limited: 5 calls per 24 hours.
Fallback: if this fails, CORONATION fetches `/api/v1/me` instead.

---

## State Saved During Ceremony

All state lives in the main `CeremonyPage` component (React state + `namingDataRef`).

| State var | Purpose |
|-----------|---------|
| `circle` | 1=Continental, 2=Diaspora, 3=Ally |
| `ceremonyPhone` | Full phone with dial code |
| `ceremonyCountryCode` | 2-letter country code (NG, GH, etc.) |
| `village` | Selected Village object |
| `role` | Selected role name string |
| `fullName`, `dateOfBirth`, `gender` | From NAMING step |
| `namingDataRef.current` | Full naming data from NamingStep |
| `selectedHeritage` | Heritage group string |
| `devOtp` | Dev OTP for display on OTP screen |

Ceremony state is persisted to `localStorage['afk-ceremony-state']` so the user can resume after browser close.

---

## What the Database Must Contain After Completion

Run this to verify:
```sql
SELECT "firstName", "afroId", "villageId", "roleKey", "onboardingComplete"
FROM "User" ORDER BY "createdAt" DESC LIMIT 1;
```

Expected:
- `afroId` → `AFR-NGA-TCH-000042` (non-null, format: `AFR-[3-letter country]-[3-letter village]-[6 digits]`)
- `villageId` → `technology` (non-null — one of the 20 village IDs)
- `roleKey` → `Software Engineer` (non-null)
- `onboardingComplete` → `true`

If `afroId` is null, the `phone_verified` Redis key had expired before register was called. Solution: re-run the ceremony within 90 minutes of OTP verification.

---

## What the Middleware Checks

`viewdicon-web/middleware.ts` checks TWO cookies before allowing `/dashboard` access:
1. `afk_token` — JWT access token
2. `afk_ceremony_done` — must be `"true"` or `"1"`

Both are set at the end of `handleRegister()` in the ceremony page. Both are cleared on logout.

If a user has `afk_token` but NOT `afk_ceremony_done`, the middleware redirects them to `/ceremony`. This is correct — they need to complete onboarding.

---

## Common Failure Modes

| Symptom | Cause | Fix |
|---------|-------|-----|
| Blank AfroID on coronation screen | Registration failed silently — no token in localStorage | Check network tab for 500 on `/auth/register` — usually Redis down |
| Ceremony stuck on blank screen at step 2 | PRIVACY step not rendered | Check that `{step==='PRIVACY' && <PrivacyStep ...>}` is in the render block |
| AfroID null in database | `phone_verified` Redis key expired before register | Ceremony took >90 min or heartbeat stopped |
| "Village Access Denied" screen | `sovereigntyAllowed` is false | User had non-African SIM and went through CIRCLES but didn't complete HERITAGE_VERIFY |
| Redirect loop to ceremony | `afk_ceremony_done` cookie not set | Check `handleRegister` sets the cookie after successful register |
