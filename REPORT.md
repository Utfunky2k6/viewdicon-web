# Viewdicon · Frontend Engineering Report
**Project:** MOTHERLAND OS · Afrikonnect / Viewdicon
**Version:** 1.0 · March 2026 · CONFIDENTIAL

---

## ⚠️ ENGINEERING PROTECTION NOTICE
**READ THIS BEFORE TOUCHING ANY FILE.**

This codebase has been broken by automated agents. Every rule below exists because something was destroyed. Follow them or the platform breaks.

---

## 1. Protected Files — DO NOT OVERWRITE

| File | What It Is | Rule |
|---|---|---|
| `app/dashboard/social/page.tsx` | Soro Soke 3-layer feed | Design approval required |
| `app/dashboard/page.tsx` | Home dashboard v2 (9 zones + Ubuntu Ring) | Design approval required |
| `app/(auth)/ceremony/page.tsx` | 11-step Naming Ceremony | Design approval required |
| `app/dashboard/family-tree/page.tsx` | Ancestor Tree | Design approval required |
| `app/dashboard/villages/page.tsx` | 20-village grid | Design approval required |
| `stores/villageStore.ts` | Village + MasqueradeSkin state | Additive changes only |
| `components/ui/Button.tsx` | 5 variants incl. kente | Add only, never remove variants |
| `components/home/NationFires.tsx` | Self-contained, mock data | Never add required props |
| `components/home/AjoCard.tsx` | Self-contained, mock data | Never add required props |
| `components/home/WorkLedger.tsx` | Self-contained, mock data | Never add required props |

---

## 2. Design System Rules — Non-Negotiable

### Colours — CSS variables only, never hardcode
```
--green-primary:  #1a7c3e   sovereign green
--gold:           #d4a017   royalty / harvest
--amber:          #e07b00   commerce
--crimson:        #b22222   courage / sacrifice
--bg-card (dark): #111a12   forest dark — NOT pure black
--bg     (dark):  #0d1117
--text   (dark):  #f0f7f0
--border (dark):  #2d4a2e
```

### Typography
- Font: **Ubuntu** primary + Noto Sans fallback. Never swap to Inter or Roboto.
- Min readable size: 10px. Base: 13–15px.

### Components
- Min tap target: 44×44px always (Africa = mobile in motion)
- Loading: **DrumPulse** only — never a spinner
- Skeletons on every data-dependent component — zero blank screens
- Cards: `border: 1px solid var(--border)` — no box-shadow (low-DPI screens)
- Animation: Framer Motion spring physics — stiffness: 300, damping: 20

---

## 3. Soro Soke Feed Architecture

**File:** `app/dashboard/social/page.tsx`
**Design source:** `viewdicon-prototype.html` Soro Soke section

### Three layers
1. **Village Drum** — community voice, skin-masked, heat score driven
   - Voice story strip (horizontal scroll)
   - Compose bar (skin-colored avatar + Drum button)
   - Sort bar: Hottest Pots / Fresh Pots / Ready Dishes
   - Post cards: square avatar, heat bar, Stir + Kíla + Drum actions
   - FIRE posts: `borderLeft: 3px solid #ef4444` — non-negotiable
2. **Discover** — Nation Square, AI Griot card first, discovery cards below
3. **Motion** — full-screen African video, right-side actions, bottom-left content

### Masquerade Skin System
| Skin | Context | Color |
|---|---|---|
| `ise` | Work / Professional | `#1a7c3e` green |
| `egbe` | Social / Community | `#e07b00` amber |
| `idile` | Clan / Family | `#7c3aed` purple |

Stored in `villageStore.ts` → `activeSkin: MasqueradeSkin`

### Heat Score Formula
```
heatScore = (kila × 2.5) + (stir × 1.0) + (comments × 4.0)
          + (drumScope × 10) + (crestTier × 1.5) − (hoursSincePost × 0.8)
```
- Cold < 10 · Simmering 10–40 · Boiling 40–78 · FIRE 78+
- At 78+: emit `post.fire` god-bus event, notify author for drum consent

---

## 4. Backend API Contract (soro-soke-feed · port 3003)

| Method | Endpoint | Use |
|---|---|---|
| GET | `/feed?skin=ise&villageId=X&sort=hot&cursor=Y` | Village Drum |
| GET | `/feed/nation?cursor=Y` | Discover tab |
| POST | `/posts/:id/stir` | Stir Pot |
| POST | `/posts/:id/kila` | Kíla (5/user/24h Redis) |
| POST | `/posts/:id/drum` | Scope +1 level only |
| GET | `/voice-stories?villageId=X&skin=Y` | Story strip |
| WS | `/ws/feed` | `post.new`, `post.heat_update`, `post.fire` |

---

## 5. Current Page Status

| Page | Route | Status |
|---|---|---|
| Home Dashboard | `/dashboard` | ✅ **Home v2** — 9 zones: Ubuntu Ring, Griot Blessing, Nation's Fires, Blood-Call SOS, Memory of Hands, Ajo Circle, Quick Actions, Village Tools, Daily Proverb |
| Soro Soke | `/dashboard/social` | ✅ 3-layer: Village Drum + Discover + Motion |
| Naming Ceremony | `/ceremony` | ✅ 419 lines — 11-step AfroID |
| Villages | `/dashboard/villages` | ✅ 12 archetypes, join/leave |
| Ancestor Tree | `/dashboard/family-tree` | ✅ Tree/List/Invite |
| Banking/Wallet | `/dashboard/banking` | ✅ AfriCoin + Cowrie |
| AI Griot | `/dashboard/ai` | ✅ 5-agent system |
| Chat | `/dashboard/chat` | ✅ Consent-gated |
| Jollof TV | `/dashboard/tv` | ✅ Village-gated streaming |
| Connections | `/dashboard/connections` | ✅ Whisper request flow |

---

## 6. Services Running

| Service | Port | Start Command | Log |
|---|---|---|---|
| viewdicon-web | 3001 | `cd viewdicon-web && nohup npm run dev > /tmp/nextjs-dev.log 2>&1 &` | `/tmp/nextjs-dev.log` |
| soro-soke-feed | 3003 | `cd services/soro-soke-feed && nohup npm run dev > /tmp/sorosoke.log 2>&1 &` | `/tmp/sorosoke.log` |
| jollof-tv | 3046 | `cd services/jollof-tv-service-ts && nohup npm run dev > /tmp/jollof-tv.log 2>&1 &` | `/tmp/jollof-tv.log` |
| seso-chat | 3050 | `cd services/seso-chat-service && nohup npm run dev > /tmp/seso-chat.log 2>&1 &` | `/tmp/seso-chat.log` |

**Public tunnel:** `https://woodless-lamar-photoelectrically.ngrok-free.dev` → port 3001

```bash
# Restart tunnel:
nohup ngrok http --url=woodless-lamar-photoelectrically.ngrok-free.dev 3001 > /tmp/ngrok.log 2>&1 &
```

---

## 7. What Was Destroyed + How It Was Fixed

### Incident — Copilot agent (`copilot/vscode-mmy6yzs3-f9mc`)

| File | What Agent Did | Fixed |
|---|---|---|
| `dashboard/page.tsx` | Gutted 233→76 lines | ✅ Restored |
| `social/page.tsx` | Rewrote 182→928 lines + CSS module | ✅ Restored + rebuilt to HTML spec |
| `ceremony/page.tsx` | Rewrote 419→1421 lines | ✅ Restored |
| `family-tree/page.tsx` | Rewrote 169→404 lines | ✅ Restored |
| `NationFires.tsx` | Added required `posts` prop | ✅ Restored self-contained |
| `AjoCard.tsx` | Added required `circle` prop | ✅ Restored self-contained |
| `WorkLedger.tsx` | Added required `entries` prop | ✅ Restored self-contained |
| `villageStore.ts` | Bloated 21→105 lines | ✅ Restored + `activeSkin` added cleanly |

**8 orphaned files created and deleted:**
`useHomeData.ts` · `BiometricScreen.tsx` · `DeviceBindingScreen.tsx` · `FamilyTreeScreen.tsx` · `VillageRouter.tsx` · `ceremony.ts` · `social.module.css` · `family.ts`

### Root Cause
Agents extracted self-contained pages into separate hooks/components/CSS modules. This looks like "better engineering" but breaks the design system and creates brittle dependencies.

### Prevention Rules
1. Files in Section 1 are protected. No agent touches them without instruction.
2. `npx next build` must pass (0 errors) before every commit.
3. Self-contained components stay self-contained. Mock data stays in the component.
4. Screenshots required for every UI change: `[FE-DONE] ComponentName`.

---

## 8. Build Verification

```bash
cd /home/vysshiy/AFRO/viewdicon-web && npx next build
# Expected: ✓ Compiled, 27+ pages, 0 TypeScript errors
```

---

## 9. African Vocabulary — Use These Always

| Platform Term | Western equivalent (NEVER use) |
|---|---|
| Sòrò Sókè | Feed / Timeline |
| Stir Pot | Like / React |
| Kíla | Super Like |
| Drum | Boost / Retweet / Amplify |
| AfroID | Username / Account ID |
| Naming Ceremony | Sign up / Register / Onboarding |
| Village | Group / Community |
| Ancestor Tree | Family Tree |
| Ubuntu Score | Karma / Reputation |
| Crest | Level / Badge tier |
| DrumPulse | Spinner / Loader |
| Nation Square | Public feed / Explore |
| Ise / Egbe / Idile | Work mode / Social mode / Family mode |

---

*MOTHERLAND OS · Afrikonnect / Viewdicon · Confidential · March 2026*
