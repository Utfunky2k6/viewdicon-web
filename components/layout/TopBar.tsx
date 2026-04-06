'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SkinSwitcher } from '@/components/ui/SkinSwitcher'
import { ViewdiconIcon } from '@/components/ui/ViewdiconLogo'
import { useNotifStore } from '@/stores/notifStore'
import { useSkinStore, SKIN_META } from '@/stores/skinStore'
import { useVillageStore } from '@/stores/villageStore'
import { UbuntuRing, DrumAlert } from '@/components/ui/afro-icons'

const ROUTE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  '/dashboard':               { title: 'Compound',       subtitle: 'Your digital homestead' },
  '/dashboard/social':        { title: 'Sòrò Sókè',     subtitle: 'Raise your voice' },
  '/dashboard/feed':          { title: 'Sòrò Sókè',     subtitle: 'Speak up · the village is listening' },
  '/dashboard/connections':   { title: 'Circles',        subtitle: 'Your three rings' },
  '/dashboard/jollof':        { title: 'Jollof TV',      subtitle: 'The fire at night' },
  '/dashboard/jollof-tv':     { title: 'Jollof TV',      subtitle: 'The fire at night' },
  '/dashboard/tv':            { title: 'UMOJA-FIRE',     subtitle: 'Live from the Motherland' },
  '/dashboard/tv/schedule':   { title: 'Village Airwaves', subtitle: '40 daily slots · Cowrie booking' },
  '/dashboard/tv/apply':      { title: 'Apply to Broadcast', subtitle: 'Pitch your show to the village' },
  '/dashboard/cowrie-flow':   { title: 'Cowrie Flow',    subtitle: 'Your creator earnings' },
  '/dashboard/baobab':        { title: 'Baobab',         subtitle: 'The Tree of Life · All Apps' },
  '/dashboard/profile':       { title: 'My Face',        subtitle: 'How the village sees you' },
  '/dashboard/banking':       { title: 'Treasury',       subtitle: 'Cowries & trade' },
  '/dashboard/marketplace':   { title: 'Ọja / Kasuwa',  subtitle: 'African trade exchange' },
  '/dashboard/villages':      { title: 'Villages',       subtitle: '20 living guilds' },
  '/dashboard/ai':            { title: 'Orisha Counsel', subtitle: '5 AI advisors' },
  '/dashboard/family-tree':   { title: 'Ancestor Tree',  subtitle: 'Your lineage' },
  '/dashboard/rooms':         { title: 'Fire Circles',   subtitle: 'Live voice & co-creation' },
  '/dashboard/chat':          { title: 'AfriChat',       subtitle: 'Consent-gated DMs' },
  '/dashboard/notifications': { title: 'Notifications',  subtitle: 'Your village drumbeats' },
  '/dashboard/calendar':      { title: 'Ìṣẹ̀lẹ̀ · Calendar', subtitle: 'Moon cycles, ancestors & market days' },
  '/dashboard/settings':      { title: 'Settings',       subtitle: 'Account, privacy & security' },
  '/dashboard/sessions':      { title: 'Trade Sessions',  subtitle: 'Your tool runs & business history' },
  '/dashboard/events':        { title: 'Village Events',  subtitle: 'Concerts · Ceremonies · Markets' },
  '/dashboard/events/create': { title: 'Create Event',    subtitle: 'Drum your event to the village' },
}

const SKIN_HEADER: Record<string, { icon: string; iconBg: string; title: string; subtitle: string }> = {
  WORK:   { icon: '🧺', iconBg: '#1a7c3e', title: 'Market Vendor',       subtitle: 'Commerce · Ìlú Oníṣòwò' },
  SOCIAL: { icon: '🪬', iconBg: 'linear-gradient(135deg,#d97706,#92400e)', title: '@LionHeart247', subtitle: 'Social Face · Public' },
  CLAN:   { icon: '🏺', iconBg: 'linear-gradient(135deg,#7c3aed,#4c1d95)', title: 'Clan · Sacred Space', subtitle: 'Private · Family Circle only' },
}

function getRouteInfo(pathname: string) {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname]
  for (const [key, val] of Object.entries(ROUTE_TITLES)) {
    if (pathname.startsWith(key + '/')) return val
  }
  return { title: 'Viewdicon' }
}

function IconButton({ href, label, children, badge }: { href: string; label: string; children: React.ReactNode; badge?: number }) {
  return (
    <Link
      href={href}
      className="relative flex items-center justify-center rounded-xl transition-all duration-200 active:scale-90"
      style={{
        width: 36,
        height: 36,
        background: 'var(--bg-raised)',
        border: '1px solid var(--border)',
        color: 'var(--text-muted)',
        fontSize: 15,
      }}
      aria-label={label}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span
          className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-white font-bold"
          style={{
            minWidth: 16,
            height: 16,
            fontSize: 9,
            padding: '0 4px',
            background: '#E85D04',
            border: '2px solid var(--bg)',
          }}
        >
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </Link>
  )
}

export function TopBar() {
  const pathname = usePathname()
  const { unreadCount, unreadChat } = useNotifStore()
  const { activeSkin, skinColors } = useSkinStore()
  const skinMeta = SKIN_META[activeSkin]
  const skinHeader = SKIN_HEADER[activeSkin]
  const { title: routeTitle, subtitle: routeSubtitle } = getRouteInfo(pathname)

  if (pathname.startsWith('/rooms/') || !!pathname.match(/\/dashboard\/chat\/.+/)) return null

  const isProfilePage = pathname === '/dashboard/profile'
  const displayTitle = isProfilePage ? skinHeader.title : routeTitle
  const displaySubtitle = isProfilePage ? skinHeader.subtitle : routeSubtitle

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        background: isProfilePage
          ? `color-mix(in srgb, ${skinColors.bg} 88%, transparent)`
          : 'color-mix(in srgb, var(--bg) 88%, transparent)',
        borderBottom: '1px solid color-mix(in srgb, var(--border) 60%, transparent)',
        transition: 'background 0.4s ease',
      }}
    >
      <div className="flex items-center justify-between px-4 py-2.5 max-w-md mx-auto">
        {/* Left — Logo + Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          {isProfilePage ? (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 transition-colors duration-400"
              style={{ background: skinHeader.iconBg }}
            >
              {skinHeader.icon}
            </div>
          ) : (
            <Link href="/dashboard" className="leading-none select-none shrink-0 active:scale-90 transition-transform">
              <ViewdiconIcon size={30} />
            </Link>
          )}
          <div className="min-w-0">
            <h1
              className="text-[14px] font-bold leading-tight truncate transition-colors duration-400"
              style={{ color: 'var(--text-primary)' }}
            >
              {displayTitle}
            </h1>
            {displaySubtitle && (
              <p
                className="text-[10px] leading-tight truncate transition-colors duration-400"
                style={{ color: 'var(--text-muted)' }}
              >
                {displaySubtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <SkinSwitcher variant="compact" />

          <Link
            href="/dashboard/banking"
            className="flex items-center justify-center rounded-xl text-xs font-bold transition-all duration-200 active:scale-90"
            style={{
              width: 36,
              height: 36,
              background: 'rgba(212,160,23,0.12)',
              border: '1px solid rgba(212,160,23,0.3)',
              color: 'var(--gold)',
            }}
          >
            ₵
          </Link>

          <IconButton href="/dashboard/chat" label="AfriChat" badge={unreadChat}>
            <UbuntuRing size={18} color="var(--text-muted)" />
          </IconButton>

          <IconButton href="/dashboard/notifications" label="Notifications" badge={unreadCount}>
            <DrumAlert size={18} color="var(--text-muted)" />
          </IconButton>
        </div>
      </div>
    </header>
  )
}
