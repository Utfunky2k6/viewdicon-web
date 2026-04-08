/**
 * LOVE WORLD — UI Primitives
 * Shared component library. Every component adheres to the design system.
 * No decoration without function. No element without purpose.
 */
'use client'

import * as React from 'react'
import Link from 'next/link'
import { COLOR, TYPE, SPACE, RADIUS, DURATION, EASE, Z, type RealmId, REALM } from './tokens'

/* ═══════════════════════════════════════════════════════════
   RealmProvider — sets CSS custom properties for active realm
   ═══════════════════════════════════════════════════════════ */

interface RealmCtx { realm: RealmId; theme: typeof REALM.ufe }
const RealmContext = React.createContext<RealmCtx>({ realm: 'ufe', theme: REALM.ufe })
export const useRealm = () => React.useContext(RealmContext)

export function RealmProvider({ realm, children }: { realm: RealmId; children: React.ReactNode }) {
  const theme = REALM[realm]
  return (
    <RealmContext.Provider value={{ realm, theme }}>
      <div
        style={{
          '--r-accent': theme.accent,
          '--r-accent-muted': theme.accentMuted,
          '--r-surface': theme.surface,
          '--r-card': theme.card,
          '--r-gradient': theme.gradient,
          minHeight: '100dvh',
          background: theme.surface,
          color: COLOR.textPrimary,
        } as React.CSSProperties}
      >
        {children}
      </div>
    </RealmContext.Provider>
  )
}

/* ═══════════════════════════════════════════════════════════
   LWText — Typography primitive
   ═══════════════════════════════════════════════════════════ */

type TypeScale = keyof typeof TYPE
type TextColor = 'primary' | 'secondary' | 'muted' | 'inverse' | 'accent' | 'danger' | 'success'

const TEXT_COLOR_MAP: Record<TextColor, string> = {
  primary: COLOR.textPrimary,
  secondary: COLOR.textSecondary,
  muted: COLOR.textMuted,
  inverse: COLOR.textInverse,
  accent: 'var(--r-accent)',
  danger: COLOR.danger,
  success: COLOR.success,
}

interface LWTextProps {
  scale?: TypeScale
  color?: TextColor
  align?: 'left' | 'center' | 'right'
  transform?: 'uppercase' | 'capitalize' | 'none'
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'div' | 'label'
  className?: string
  style?: React.CSSProperties
  children: React.ReactNode
}

export function LWText({
  scale = 'body',
  color = 'primary',
  align,
  transform,
  as: Tag = 'p',
  className,
  style,
  children,
}: LWTextProps) {
  const t = TYPE[scale]
  return (
    <Tag
      className={className}
      style={{
        fontSize: t.fontSize,
        lineHeight: t.lineHeight,
        fontWeight: t.fontWeight,
        letterSpacing: t.letterSpacing || undefined,
        color: TEXT_COLOR_MAP[color],
        textAlign: align,
        textTransform: transform,
        margin: 0,
        ...style,
      }}
    >
      {children}
    </Tag>
  )
}

/* ═══════════════════════════════════════════════════════════
   LWButton — Action primitive
   ═══════════════════════════════════════════════════════════ */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface LWButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  className?: string
}

const BTN_SIZE: Record<ButtonSize, React.CSSProperties> = {
  sm: { height: 36, padding: `0 ${SPACE[3]}px`, fontSize: TYPE.caption.fontSize, fontWeight: 500 },
  md: { height: 44, padding: `0 ${SPACE[5]}px`, fontSize: TYPE.body.fontSize,    fontWeight: 500 },
  lg: { height: 52, padding: `0 ${SPACE[6]}px`, fontSize: TYPE.h3.fontSize,      fontWeight: 600 },
}

export function LWButton({
  variant = 'primary',
  size = 'md',
  loading,
  fullWidth,
  disabled,
  className,
  style,
  children,
  ...rest
}: LWButtonProps) {
  const isDisabled = disabled || loading
  const base: React.CSSProperties = {
    ...BTN_SIZE[size],
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACE[2],
    borderRadius: RADIUS.lg,
    border: 'none',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.45 : 1,
    transition: `all ${DURATION.fast} ${EASE.default}`,
    fontFamily: 'inherit',
    width: fullWidth ? '100%' : undefined,
    ...style,
  }

  const variants: Record<ButtonVariant, React.CSSProperties> = {
    primary:   { background: 'var(--r-accent, #fafafa)', color: COLOR.textInverse },
    secondary: { background: 'var(--r-accent-muted, rgba(255,255,255,0.08))', color: 'var(--r-accent, #fafafa)', border: `1px solid var(--r-accent, ${COLOR.border})` },
    ghost:     { background: 'transparent', color: COLOR.textSecondary },
    danger:    { background: COLOR.danger, color: '#fff' },
  }

  return (
    <button disabled={isDisabled} className={className} style={{ ...base, ...variants[variant] }} {...rest}>
      {loading ? <Spinner size={16} /> : children}
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════
   LWCard — Container primitive
   ═══════════════════════════════════════════════════════════ */

interface LWCardProps {
  padding?: number
  radius?: string
  border?: boolean
  hoverable?: boolean
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  children: React.ReactNode
}

export function LWCard({
  padding = SPACE[4],
  radius = RADIUS.xl,
  border = true,
  hoverable = false,
  className,
  style,
  onClick,
  children,
}: LWCardProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter') onClick() } : undefined}
      style={{
        background: 'var(--r-card, ' + COLOR.card + ')',
        borderRadius: radius,
        padding,
        border: border ? `1px solid ${COLOR.border}` : 'none',
        transition: `all ${DURATION.fast} ${EASE.default}`,
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
      className={hoverable ? `lw-card-hover${className ? ' ' + className : ''}` : className || undefined}
    >
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   LWInput — Form primitive
   ═══════════════════════════════════════════════════════════ */

interface LWInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const LWInput = React.forwardRef<HTMLInputElement, LWInputProps>(
  ({ label, error, hint, style, ...rest }, ref) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[1] }}>
      {label && (
        <LWText scale="caption" color="secondary" as="label">
          {label}
        </LWText>
      )}
      <input
        ref={ref}
        style={{
          height: 44,
          padding: `0 ${SPACE[4]}px`,
          background: COLOR.elevated,
          border: `1px solid ${error ? COLOR.danger : COLOR.border}`,
          borderRadius: RADIUS.lg,
          color: COLOR.textPrimary,
          fontSize: TYPE.body.fontSize,
          fontFamily: 'inherit',
          outline: 'none',
          transition: `border-color ${DURATION.fast} ${EASE.default}`,
          ...style,
        }}
        {...rest}
      />
      {error && <LWText scale="caption" color="danger">{error}</LWText>}
      {hint && !error && <LWText scale="caption" color="muted">{hint}</LWText>}
    </div>
  )
)
LWInput.displayName = 'LWInput'

/* ═══════════════════════════════════════════════════════════
   LWBadge — Status indicator
   ═══════════════════════════════════════════════════════════ */

type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger'

const BADGE_COLORS: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: 'rgba(255,255,255,0.06)', text: COLOR.textSecondary },
  accent:  { bg: 'var(--r-accent-muted, rgba(255,255,255,0.06))', text: 'var(--r-accent, #fafafa)' },
  success: { bg: 'rgba(34,197,94,0.12)', text: COLOR.success },
  warning: { bg: 'rgba(234,179,8,0.12)', text: COLOR.warning },
  danger:  { bg: 'rgba(239,68,68,0.12)', text: COLOR.danger },
}

export function LWBadge({
  variant = 'default',
  children,
  style,
}: {
  variant?: BadgeVariant
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  const c = BADGE_COLORS[variant]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 24,
        padding: `0 ${SPACE[2]}px`,
        borderRadius: RADIUS.full,
        background: c.bg,
        color: c.text,
        ...TYPE.micro,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </span>
  )
}

/* ═══════════════════════════════════════════════════════════
   LWAvatar — Profile image with verification
   ═══════════════════════════════════════════════════════════ */

export function LWAvatar({
  src,
  name,
  size = 48,
  verified = false,
  style,
}: {
  src?: string | null
  name?: string
  size?: number
  verified?: boolean
  style?: React.CSSProperties
}) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0, ...style }}>
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          style={{
            width: size,
            height: size,
            borderRadius: RADIUS.full,
            objectFit: 'cover',
            border: `2px solid ${COLOR.border}`,
          }}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: RADIUS.full,
            background: 'var(--r-accent-muted, rgba(255,255,255,0.06))',
            border: `2px solid ${COLOR.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--r-accent, ' + COLOR.textSecondary + ')',
            fontSize: size * 0.36,
            fontWeight: 600,
          }}
        >
          {initials}
        </div>
      )}
      {verified && (
        <div
          style={{
            position: 'absolute',
            bottom: -1,
            right: -1,
            width: size * 0.35,
            height: size * 0.35,
            borderRadius: RADIUS.full,
            background: COLOR.success,
            border: `2px solid var(--r-surface, ${COLOR.bg})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width={size * 0.18} height={size * 0.18} viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   LWProgress — Linear progress bar
   ═══════════════════════════════════════════════════════════ */

export function LWProgress({
  value,
  max = 100,
  height = 6,
  color,
  label,
  showValue,
  style,
}: {
  value: number
  max?: number
  height?: number
  color?: string
  label?: string
  showValue?: boolean
  style?: React.CSSProperties
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div style={style}>
      {(label || showValue) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: SPACE[1] }}>
          {label && <LWText scale="caption" color="secondary">{label}</LWText>}
          {showValue && <LWText scale="caption" color="muted">{Math.round(pct)}%</LWText>}
        </div>
      )}
      <div
        style={{
          height,
          borderRadius: RADIUS.full,
          background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: RADIUS.full,
            background: color || 'var(--r-accent, #fafafa)',
            transition: `width ${DURATION.slow} ${EASE.default}`,
          }}
        />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   LWNav — Realm navigation header
   ═══════════════════════════════════════════════════════════ */

export function LWNav({
  title,
  backHref,
  backLabel = 'Back',
  right,
}: {
  title: string
  backHref?: string
  backLabel?: string
  right?: React.ReactNode
}) {
  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: Z.sticky,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        padding: `0 ${SPACE[4]}px`,
        background: 'var(--r-surface, ' + COLOR.bg + ')',
        borderBottom: `1px solid ${COLOR.border}`,
        backdropFilter: 'blur(16px)',
      }}
    >
      {backHref ? (
        <Link
          href={backHref}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: SPACE[1],
            color: COLOR.textSecondary,
            textDecoration: 'none',
            fontSize: TYPE.caption.fontSize,
            fontWeight: 500,
            minWidth: 60,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {backLabel}
        </Link>
      ) : (
        <div style={{ minWidth: 60 }} />
      )}
      <LWText scale="caption" color="primary" as="span" style={{ fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        {title}
      </LWText>
      <div style={{ minWidth: 60, display: 'flex', justifyContent: 'flex-end' }}>
        {right}
      </div>
    </nav>
  )
}

/* ═══════════════════════════════════════════════════════════
   LWDivider — Horizontal separator
   ═══════════════════════════════════════════════════════════ */

export function LWDivider({ spacing = SPACE[6] }: { spacing?: number }) {
  return (
    <hr
      style={{
        border: 'none',
        borderTop: `1px solid ${COLOR.border}`,
        margin: `${spacing}px 0`,
      }}
    />
  )
}

/* ═══════════════════════════════════════════════════════════
   LWSkeleton — Loading placeholder
   ═══════════════════════════════════════════════════════════ */

export function LWSkeleton({
  width,
  height = 16,
  radius = RADIUS.md,
  style,
}: {
  width?: number | string
  height?: number | string
  radius?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        width: width || '100%',
        height,
        borderRadius: radius,
        background: `linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)`,
        backgroundSize: '400px 100%',
        animation: 'lw-shimmer 1.4s ease-in-out infinite',
        ...style,
      }}
    />
  )
}

/* ═══════════════════════════════════════════════════════════
   Spinner — Inline loading indicator
   ═══════════════════════════════════════════════════════════ */

export function Spinner({ size = 20, color }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: 'lw-spin 0.8s linear infinite' }}>
      <circle cx="12" cy="12" r="10" stroke={color || 'currentColor'} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="32 32" />
    </svg>
  )
}

/* ═══════════════════════════════════════════════════════════
   LWEmpty — Empty state
   ═══════════════════════════════════════════════════════════ */

export function LWEmpty({ title, message, action }: { title: string; message?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: `${SPACE[16]}px ${SPACE[6]}px`, textAlign: 'center', gap: SPACE[3] }}>
      <div style={{ width: 64, height: 64, borderRadius: RADIUS.full, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: SPACE[2] }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke={COLOR.textMuted} strokeWidth="1.5" />
          <path d="M8 12h8" stroke={COLOR.textMuted} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <LWText scale="h3" color="secondary">{title}</LWText>
      {message && <LWText scale="caption" color="muted" style={{ maxWidth: 260 }}>{message}</LWText>}
      {action && <div style={{ marginTop: SPACE[2] }}>{action}</div>}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   LWSheet — Bottom sheet
   ═══════════════════════════════════════════════════════════ */

export function LWSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}) {
  React.useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: Z.modal,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: COLOR.overlay,
          animation: `lw-fade-in ${DURATION.fast} ${EASE.default}`,
        }}
      />
      <div
        style={{
          position: 'relative',
          background: COLOR.elevated,
          borderRadius: `${RADIUS.xl} ${RADIUS.xl} 0 0`,
          padding: `${SPACE[5]}px ${SPACE[4]}px ${SPACE[8]}px`,
          maxHeight: '85dvh',
          overflowY: 'auto',
          animation: `lw-slide-up ${DURATION.enter} ${EASE.default}`,
        }}
      >
        <div style={{ width: 36, height: 4, borderRadius: RADIUS.full, background: COLOR.borderStrong, margin: `0 auto ${SPACE[4]}px` }} />
        {title && <LWText scale="h2" style={{ marginBottom: SPACE[4] }}>{title}</LWText>}
        {children}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   LWTextarea — Multi-line form primitive
   ═══════════════════════════════════════════════════════════ */

interface LWTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  maxChars?: number
}

export const LWTextarea = React.forwardRef<HTMLTextAreaElement, LWTextareaProps>(
  ({ label, error, hint, maxChars, value, style, ...rest }, ref) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: SPACE[1] }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <LWText scale="caption" color="secondary" as="label">{label}</LWText>
          {maxChars && (
            <LWText scale="micro" color="muted" as="span">
              {String(value || '').length}/{maxChars}
            </LWText>
          )}
        </div>
      )}
      <textarea
        ref={ref}
        value={value}
        maxLength={maxChars}
        style={{
          minHeight: 88,
          padding: `${SPACE[3]}px ${SPACE[4]}px`,
          background: COLOR.elevated,
          border: `1px solid ${error ? COLOR.danger : COLOR.border}`,
          borderRadius: RADIUS.lg,
          color: COLOR.textPrimary,
          fontSize: TYPE.body.fontSize,
          lineHeight: TYPE.body.lineHeight,
          fontFamily: 'inherit',
          outline: 'none',
          resize: 'vertical',
          transition: `border-color ${DURATION.fast} ${EASE.default}`,
          ...style,
        }}
        {...rest}
      />
      {error && <LWText scale="caption" color="danger">{error}</LWText>}
      {hint && !error && <LWText scale="caption" color="muted">{hint}</LWText>}
    </div>
  )
)
LWTextarea.displayName = 'LWTextarea'

/* ═══════════════════════════════════════════════════════════
   LWIcon — Minimal icon wrapper (uses Lucide-compatible paths)
   ═══════════════════════════════════════════════════════════ */

export function LWIcon({
  d,
  size = 20,
  color,
  strokeWidth = 1.5,
}: {
  d: string
  size?: number
  color?: string
  strokeWidth?: number
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

/* ─── Common icon paths ─── */
export const ICONS = {
  chevronRight: 'M9 18l6-6-6-6',
  chevronLeft: 'M15 18l-6-6 6-6',
  heart: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 1 0 0-8z',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 1 0 0-8z',
  check: 'M20 6L9 17l-5-5',
  lock: 'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  message: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  camera: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z',
} as const
