'use client'
// ============================================================
// Input — label, helper text, error state, icon slots
// Password show/hide toggle. OTP mode (large digits).
// Focus ring: 2px green. Adapts to dark/light via CSS vars.
// ============================================================
import * as React from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  className,
  id,
  type,
  ...props
}: InputProps) {
  const inputId = id ?? React.useId()
  const [showPwd, setShowPwd] = React.useState(false)

  const isPassword = type === 'password'
  const isOtp      = type === 'tel' || props['aria-label']?.toLowerCase().includes('otp')
  const inputType  = isPassword ? (showPwd ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}>
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          type={inputType}
          inputMode={isOtp ? 'numeric' : undefined}
          className={cn(
            'w-full rounded-xl px-4 py-3 transition-all duration-150',
            'placeholder:opacity-40',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            // Green focus ring — not gold
            'focus:outline-none focus:ring-2 focus:ring-[#1a7c3e] focus:border-transparent',
            // OTP: large, monospace, center-aligned digits
            isOtp && 'text-center text-2xl font-mono tracking-[0.5em]',
            leftIcon  ? 'pl-10' : '',
            rightIcon || isPassword ? 'pr-11' : '',
            error ? 'border-[#b22222]' : '',
            className
          )}
          style={{
            background:   'var(--bg-raised)',
            border:       `1px solid ${error ? '#b22222' : 'var(--border)'}`,
            color:        'var(--text-primary)',
          }}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          {...props}
        />

        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-3 min-h-[44px] min-w-[44px] flex items-center justify-center"
            style={{ color: 'var(--text-muted)' }}
            aria-label={showPwd ? 'Hide password' : 'Show password'}
          >
            {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {/* Right icon (non-password) */}
        {rightIcon && !isPassword && (
          <span className="absolute right-3" style={{ color: 'var(--text-muted)' }}>
            {rightIcon}
          </span>
        )}

        {/* Error icon */}
        {error && !isPassword && !rightIcon && (
          <span className="absolute right-3 text-[#b22222]">
            <AlertCircle size={18} />
          </span>
        )}
      </div>

      {error && (
        <p id={`${inputId}-error`} className="text-xs text-[#b22222] flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {hint}
        </p>
      )}
    </div>
  )
}
