import React from 'react'

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  AFRO-ICONS — Sovereign African Symbol Library v2           ║
 * ║                                                              ║
 * ║  Every icon is a Sovereign Sigil — visual language rooted   ║
 * ║  in African civilisations:                                   ║
 * ║                                                              ║
 * ║  ADINKRA  — Akan people of Ghana & Côte d'Ivoire            ║
 * ║  NSIBIDI  — Ekpe society of SE Nigeria & Cameroon           ║
 * ║  KENTE    — Ashanti weaving geometry                         ║
 * ║  PAN-AFRICAN — shared symbols across the continent           ║
 * ║                                                              ║
 * ║  Design rules:                                               ║
 * ║  • Stroke width: 2px primary, 1.5px secondary               ║
 * ║  • ViewBox: 0 0 24 24                                        ║
 * ║  • Linecap: round. Linejoin: round.                          ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
  color?: string
}

// ─────────────────────────────────────────────────────────────────
// IDENTITY & AUTHORITY
// ─────────────────────────────────────────────────────────────────

/**
 * GYE NYAME — "Except God"
 * Adinkra. Supremacy of the divine.
 * Used for: authority, root identity, sovereign lock.
 */
export const GyeNyame = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" opacity="0.2" />
    <path d="M12 7v10M7 12h10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M9 9l6 6M15 9l-6 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
    <circle cx="12" cy="12" r="2.5" fill={color} />
  </svg>
)

/**
 * SANKOFA — "Go back and get it"
 * Adinkra. Learn from the past.
 * Used for: history, profile journey, back navigation.
 */
export const Sankofa = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M19 12a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" stroke={color} strokeWidth="2" />
    <path d="M9 9l-3 3 3 3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 12h6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="17" cy="7" r="2" fill={color} opacity="0.6" />
  </svg>
)

/**
 * NKISI SHIELD — Spiritual protection
 * Nsibidi. Sacred protective enclosure.
 * Used for: privacy, security, encryption, Nkisi state display.
 */
export const NkisiShield = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 2L4 5.5v6C4 16.5 7.6 21 12 22c4.4-1 8-5.5 8-10.5v-6L12 2Z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.07" strokeLinejoin="round" />
    <path d="M9 12l2 2 4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/**
 * MASK FACE — African ceremonial mask
 * Pan-African. Identity, persona, profile.
 * Used for: user profile, public identity display.
 */
export const MaskFace = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <ellipse cx="12" cy="12" rx="6" ry="8" stroke={color} strokeWidth="2" />
    <circle cx="9.5" cy="10" r="1" fill={color} />
    <circle cx="14.5" cy="10" r="1" fill={color} />
    <path d="M10 14.5q2 2.5 4 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10 6h4" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
  </svg>
)

// ─────────────────────────────────────────────────────────────────
// REVELATION & CONCEALMENT  (replaces Lucide Eye / EyeOff)
// ─────────────────────────────────────────────────────────────────

/**
 * OWIA EYE — "Sun Eye" / Reveal
 * Akan. The sun sees all.
 * Used for: show password, reveal AfroID, view hidden content.
 * REPLACES: Lucide <Eye />
 */
export const RevealEye = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M2 12C4.5 7 8 5 12 5s7.5 2 10 7c-2.5 5-6 7-10 7S4.5 17 2 12Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
    <circle cx="12" cy="12" r="1" fill={color} />
    <path d="M12 2v2M20 4l-1.5 1.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
  </svg>
)

/**
 * AKATAWIA — "Concealment veil"
 * Akan. That which is hidden is protected.
 * Used for: hide password, mask content, privacy mode.
 * REPLACES: Lucide <EyeOff />
 */
export const HideEye = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M17.5 17.5C15.8 18.5 14 19 12 19 8 19 4.5 17 2 12c1.3-2.6 3-4.5 5-5.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M9.5 4.8C10.3 4.6 11.1 4.5 12 4.5c4 0 7.5 2 10 7-.6 1.1-1.3 2.1-2 3" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M9.5 9.5a3 3 0 0 0 4 4.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M3 3l18 18" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

// ─────────────────────────────────────────────────────────────────
// SEARCH & EXPLORATION  (replaces Lucide Search)
// ─────────────────────────────────────────────────────────────────

/**
 * NKYINKYIM SEARCH — Adaptation / Exploration
 * Adinkra. Adaptability and resourcefulness.
 * The diamond inside the lens is the Nkyinkyim crossing — adaptive search.
 * Used for: search, explore, discover.
 * REPLACES: Lucide <Search />
 */
export const SearchSigil = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="10.5" cy="10.5" r="6.5" stroke={color} strokeWidth="2" />
    <path d="M10.5 7l3 3.5-3 3.5-3-3.5z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M15.5 15.5L21 21" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

// ─────────────────────────────────────────────────────────────────
// COMMUNICATION & CONNECTION  (replaces Lucide WifiOff / Wifi)
// ─────────────────────────────────────────────────────────────────

/**
 * DJEMBE SPEAKING — Drum broadcasting (connected / online)
 * Pan-African. The talking drum is Africa's original network.
 * Used for: online status, connected, restored connection.
 * REPLACES: Lucide <Wifi />
 */
export const DjembeIcon = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <ellipse cx="12" cy="7.5" rx="5" ry="2.5" stroke={color} strokeWidth="2" />
    <path d="M7 7.5v4.5c0 3.87 2.24 7 5 7s5-3.13 5-7V7.5" stroke={color} strokeWidth="2" />
    <path d="M12 19.5V22" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M9 22h6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M9 4.5Q12 3 15 4.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />
    <path d="M6 2.5Q12 0 18 2.5" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.35" />
  </svg>
)

/**
 * SILENT DRUM — Drum not speaking (offline / disconnected)
 * The drum falls silent when the connection is lost.
 * Used for: no connection, offline state, signal lost.
 * REPLACES: Lucide <WifiOff />
 */
export const SilentDrum = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <ellipse cx="12" cy="7.5" rx="5" ry="2.5" stroke={color} strokeWidth="2" opacity="0.35" />
    <path d="M7 7.5v4.5c0 3.87 2.24 7 5 7s5-3.13 5-7V7.5" stroke={color} strokeWidth="2" opacity="0.35" />
    <path d="M12 19.5V22" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.35" />
    <path d="M9 22h6" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.35" />
    <path d="M4 4l16 16" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

// ─────────────────────────────────────────────────────────────────
// ALERTS & STATUS  (replaces Lucide AlertCircle)
// ─────────────────────────────────────────────────────────────────

/**
 * WARNING SIGIL — Pyramid of caution
 * African pyramid geometry. The triangle is the mountain — solid, undeniable.
 * Used for: errors, alerts, warnings, validation failures.
 * REPLACES: Lucide <AlertCircle /> / <AlertTriangle />
 */
export const WarningSigil = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 2L22 20H2Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.07" />
    <path d="M12 9v5" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="17" r="0.75" fill={color} />
  </svg>
)

// ─────────────────────────────────────────────────────────────────
// ECONOMY & TRADE
// ─────────────────────────────────────────────────────────────────

/**
 * KOWRIE — Ancient Currency Shell
 * Pan-African. The cowrie was Africa's first international currency.
 * Used for: banking, wallet, payments, Cowrie balance.
 */
export const KowrieIcon = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <ellipse cx="12" cy="12" rx="8" ry="10" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.06" />
    <path d="M9 9c0 0 1 3 3 3s3-3 3-3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 15c0 0 1-3 3-3s3 3 3 3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 2v2M12 20v2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

/**
 * CALABASH — The sharing vessel
 * Pan-African. The calabash is used for offering, sharing, measuring wealth.
 * Used for: Kalabash tipping, gifts, Ajo circles, sharing.
 */
export const Calabash = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M5 12h14v2c0 4.42-3.13 8-7 8s-7-3.58-7-8v-2Z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.07" strokeLinejoin="round" />
    <path d="M5 12c0-2.21 3.13-4 7-4s7 1.79 7 4" stroke={color} strokeWidth="2" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 16h8" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.4" />
  </svg>
)

/**
 * MARKET STALL — Ọja / Kasuwa
 * Pan-African. The market is the heart of the village economy.
 * Used for: marketplace, listings, trade, shop.
 */
export const MarketStall = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.06" strokeLinejoin="round" />
    <path d="M9 22V12h6v10" stroke={color} strokeWidth="2" />
    <path d="M3 9h18" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
  </svg>
)

// ─────────────────────────────────────────────────────────────────
// VILLAGE & COMMUNITY
// ─────────────────────────────────────────────────────────────────

/**
 * BAOBAB TREE — The tree of life / Home
 * Pan-African. The baobab is the meeting place, anchor, and home.
 * Used for: home, dashboard, village hub.
 */
export const BaobabTree = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 22v-8" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    <path d="M9 22h6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M5 14c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.08" />
    <path d="M8 7L6 4.5M12 7V5M16 7l2-2.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 11q4 2 8 0" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.35" />
  </svg>
)

/**
 * COMPOUND DOOR — Entrance gate / Lock
 * Pan-African. The compound door is the boundary between private and public.
 * Used for: lock, gate, restricted access, Compound Door switcher.
 */
export const CompoundDoor = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M6 22V11a6 6 0 0 1 12 0v11" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M4 22h16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M9 15h6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="11.5" r="1.5" stroke={color} strokeWidth="1.5" />
    <path d="M12 13v2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

/**
 * FIRE CIRCLE — Community gathering fire
 * Pan-African. The fire is where the community gathers and decisions are made.
 * Used for: voice rooms, fire circles, live sessions.
 */
export const FireCircle = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" strokeDasharray="3 3" opacity="0.45" />
    <path d="M12 18c-2.21 0-4-1.79-4-4 0-1.5.5-2.5 2-4 .5 1 1 1.5 2 2 0-2 1-3.5 2-5 1 2 2 3.5 2 5 1-.5 1.5-1 2-2 1.5 1.5 2 2.5 2 4 0 2.21-1.79 4-4 4z" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1" strokeLinejoin="round" />
  </svg>
)

/**
 * ANCESTOR TREE — Kinship / Family lineage
 * Pan-African. The lineage connects the living to the ancestors.
 * Used for: family tree, genealogy, kinship.
 */
export const AncestorTree = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="12" cy="4" r="2" stroke={color} strokeWidth="2" />
    <circle cx="6" cy="14" r="2" stroke={color} strokeWidth="2" />
    <circle cx="18" cy="14" r="2" stroke={color} strokeWidth="2" />
    <circle cx="12" cy="20" r="2" stroke={color} strokeWidth="2" />
    <path d="M12 6v2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6 12V9a6 6 0 0 1 12 0v3" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M6 16v2l6 2 6-2v-2" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
)

/**
 * UBUNTU RING — Three Rings of Connection
 * Pan-African. "I am because we are."
 * Used for: connections, rings, social graph, network.
 */
export const UbuntuRing = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" />
    <circle cx="6" cy="17" r="3" stroke={color} strokeWidth="2" />
    <circle cx="18" cy="17" r="3" stroke={color} strokeWidth="2" />
    <path d="M9 11.5L6.5 14.5M15 11.5L17.5 14.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

// ─────────────────────────────────────────────────────────────────
// GOVERNANCE & WISDOM
// ─────────────────────────────────────────────────────────────────

/**
 * COUNCIL HUT — Village governance
 * Pan-African. The palaver hut where decisions are made.
 * Used for: governance, council, voting, civic.
 */
export const CouncilHut = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M3 13L12 3l9 10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="5" y="13" width="14" height="9" rx="1" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.06" />
    <path d="M9 22v-5h6v5" stroke={color} strokeWidth="1.5" />
    <path d="M9 16h6" stroke={color} strokeWidth="1" strokeLinecap="round" opacity="0.45" />
  </svg>
)

/**
 * KOWE SCROLL — Tamper-proof receipt / document
 * Viewdicon. The Kòwè is the immutable ledger seal.
 * Used for: documents, certificates, signed records, audit trail.
 */
export const KoweScroll = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M6 22h12a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2Z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.05" />
    <path d="M14 2v5h5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 13h6M9 17h4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="9" cy="10" r="1" fill={color} opacity="0.65" />
  </svg>
)

// ─────────────────────────────────────────────────────────────────
// NAVIGATION & SYSTEM
// ─────────────────────────────────────────────────────────────────

/**
 * AFRO SETTINGS — OBI NKA OBI balance wheel
 * Adinkra. "No one should wrong another." Collective harmony and order.
 * Used for: settings, preferences, configuration.
 * NOT a Western mechanical cog — a hexagonal balance form.
 */
export const AfroSettings = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 2l2.4 4.2H21l-3.3 5.8 3.3 5.8h-6.6L12 22l-2.4-4.2H3l3.3-5.8L3 6.2h6.6Z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.06" />
    <circle cx="12" cy="12" r="2.5" stroke={color} strokeWidth="2" />
  </svg>
)

/**
 * TOOL SIGIL — Nsibidi mark of making
 * Nsibidi. A mark of skilled work.
 * Used for: tools, work mode, creation, crafting.
 */
export const ToolSigil = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.07" strokeLinejoin="round" />
  </svg>
)

/**
 * DRUM ALERT — Notification drum beat
 * Pan-African. The drum calls everyone to attention.
 * Used for: notifications, badges, unread alerts.
 */
export const DrumAlert = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <ellipse cx="12" cy="8.5" rx="5" ry="2.5" stroke={color} strokeWidth="2" />
    <path d="M7 8.5v4c0 2.76 2.24 5 5 5s5-2.24 5-5v-4" stroke={color} strokeWidth="2" />
    <path d="M12 17.5V20" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M9 20h6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="17.5" cy="5" r="3" fill={color} />
  </svg>
)

/**
 * KENTE GRID — Dashboard overview
 * Ashanti. Kente weaving is the original grid system.
 * Used for: dashboard, grid view, all-sections overview.
 */
export const KenteGrid = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.07" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.07" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.07" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
    <path d="M16.5 18.5h3M18 17v3" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

/**
 * AFRO PLUS — Add / Create
 * Circle with cross — creation mark.
 * Used for: add, create, new post, new entry.
 */
export const AfroPlusIcon = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.06" />
    <path d="M12 8v8M8 12h8" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

/**
 * SANKOFA BACK — Navigate backward
 * The Sankofa direction — looking back to move forward.
 * Used for: back, previous, return.
 */
export const SankofaBack = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M15 18l-6-6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/**
 * AFRO FORWARD — Navigate forward
 * Used for: forward, next, continue, expand list.
 */
export const AfroForward = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M9 18l6-6-6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/**
 * AYA UPLOAD — Fern of endurance / Upload
 * Adinkra. The fern endures all challenges — persistence through difficulty.
 * Used for: upload, send, save to cloud.
 */
export const AyaUpload = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 22V6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M8 10l4-4 4 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 18c0-3.31 2.69-6 6-6" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    <path d="M18 18c0-3.31-2.69-6-6-6" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
  </svg>
)

/**
 * AFRO CLOSE — Dismiss / Cancel
 * Used for: close modal, dismiss, cancel action.
 */
export const AfroClose = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

/**
 * AFRO CHECK — Confirmed / Success
 * Used for: success state, confirmed, correct, completed.
 */
export const AfroCheck = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M20 6L9 17l-5-5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/**
 * HARVEST CALENDAR — Cycle and time
 * Pan-African. African seasons are harvest cycles, not Gregorian squares.
 * Used for: events, calendar, schedule, time.
 */
export const HarvestCalendar = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="2" fill={color} fillOpacity="0.05" />
    <path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="8" cy="15" r="1" fill={color} />
    <circle cx="12" cy="15" r="1" fill={color} />
    <circle cx="16" cy="15" r="1" fill={color} />
  </svg>
)

/**
 * AKOMA HEART — Love, courage, goodwill
 * Adinkra. "The heart of the matter."
 * Used for: like, love, care, community warmth.
 */
export const AkomaHeart = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.1" />
  </svg>
)

/**
 * AFRO SHARE — Spread outward / Broadcast
 * Used for: share, send, forward, broadcast to network.
 */
export const AfroShare = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="18" cy="5" r="3" stroke={color} strokeWidth="2" />
    <circle cx="6" cy="12" r="3" stroke={color} strokeWidth="2" />
    <circle cx="18" cy="19" r="3" stroke={color} strokeWidth="2" />
    <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

/**
 * UBUNTU CROWN — Rank / Achievement / Elder
 * Pan-African. The crown of communal recognition.
 * Used for: rank badge, elder status, achievement.
 */
export const UbuntuCrown = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M2 20h20" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M4 20V10l4 4 4-8 4 8 4-4v10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={color} fillOpacity="0.07" />
    <circle cx="4" cy="10" r="1.5" fill={color} />
    <circle cx="12" cy="6" r="1.5" fill={color} />
    <circle cx="20" cy="10" r="1.5" fill={color} />
  </svg>
)

/**
 * AFRO MENU — Navigation drawer
 * Three strokes with decreasing length — Adinkra rhythm.
 * Used for: menu, hamburger, navigation drawer.
 */
export const AfroMenu = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M4 6h16M4 12h16M4 18h10" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
)

/**
 * UBUNTU STAR — Honour / Featured / Rating
 * Pan-African. The star of communal recognition.
 * Used for: rating, featured content, honour badge.
 */
export const UbuntuStar = ({ size = 24, color = 'currentColor', ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke={color} strokeWidth="2" strokeLinejoin="round" fill={color} fillOpacity="0.08" />
  </svg>
)
