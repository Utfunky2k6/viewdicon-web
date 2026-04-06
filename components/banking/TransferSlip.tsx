'use client'

import * as React from 'react'

/* ------------------------------------------------------------------ */
/*  TransferSlip — Kowe Receipt Modal                                  */
/*                                                                     */
/*  A shareable / printable transfer receipt inspired by traditional    */
/*  African market receipts. Kowe = oral ledger entry.                 */
/*                                                                     */
/*  Pure React/JSX, zero external dependencies.                        */
/* ------------------------------------------------------------------ */

interface TransferSlipProps {
  fromAfroId: string
  toAfroId: string
  amount: number
  currency?: string
  koweHash: string
  timestamp: string
  reference?: string
  reason?: string
  status?: 'SETTLED' | 'PENDING' | 'REVERSED'
  onClose: () => void
}

/* ---- helpers ---- */

const PRINT_STYLE_ID = 'kowe-receipt-print-style'

function maskId(id: string): string {
  if (id.length <= 7) return id
  return `${id.slice(0, 3)}${'\\u2022\\u2022\\u2022'.replace(/\\u2022/g, '\u2022')}${id.slice(-4)}`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-NG', {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
}

function truncateHash(hash: string): string {
  if (hash.length <= 16) return hash
  return hash.slice(0, 16) + '...'
}

/* ---- status badge config ---- */

const STATUS_CFG: Record<string, { bg: string; fg: string; label: string }> = {
  SETTLED:  { bg: '#1B3A1B', fg: '#4CAF50', label: 'SETTLED' },
  PENDING:  { bg: '#3A2E10', fg: '#E8A030', label: 'PENDING' },
  REVERSED: { bg: '#3A1010', fg: '#E53935', label: 'REVERSED' },
}

/* ---- textile motif ---- */

function TextileMotif() {
  const count = 24
  const triangles: string[] = []
  for (let i = 0; i < count; i++) {
    triangles.push(i % 2 === 0 ? '\u25B2' : '\u25BC')
  }
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 2,
        padding: '8px 0',
        color: '#C9A84C',
        fontSize: 8,
        letterSpacing: 1,
        opacity: 0.6,
        userSelect: 'none',
      }}
      aria-hidden
    >
      {triangles.map((t, i) => (
        <span key={i} style={{ opacity: i % 3 === 0 ? 1 : 0.5 }}>
          {t}
        </span>
      ))}
    </div>
  )
}

/* ---- component ---- */

export default function TransferSlip({
  fromAfroId,
  toAfroId,
  amount,
  currency = 'CWR',
  koweHash,
  timestamp,
  reference,
  reason,
  status = 'SETTLED',
  onClose,
}: TransferSlipProps) {
  const receiptRef = React.useRef<HTMLDivElement>(null)
  const [copied, setCopied] = React.useState(false)
  const { bg: statusBg, fg: statusFg, label: statusLabel } = STATUS_CFG[status] ?? STATUS_CFG.SETTLED

  /* ---- print handler ---- */
  const handlePrint = React.useCallback(() => {
    // Inject a print-only stylesheet that hides everything except the receipt
    let style = document.getElementById(PRINT_STYLE_ID) as HTMLStyleElement | null
    if (!style) {
      style = document.createElement('style')
      style.id = PRINT_STYLE_ID
      document.head.appendChild(style)
    }
    style.textContent = `
      @media print {
        body * { visibility: hidden !important; }
        #kowe-receipt-card,
        #kowe-receipt-card * {
          visibility: visible !important;
        }
        #kowe-receipt-card {
          position: fixed !important;
          left: 50% !important;
          top: 50% !important;
          transform: translate(-50%, -50%) !important;
          width: 380px !important;
          box-shadow: none !important;
          border: 2px solid #C9A84C !important;
        }
        .kowe-no-print { display: none !important; }
      }
    `
    window.print()
  }, [])

  /* ---- share handler ---- */
  const handleShare = React.useCallback(async () => {
    const text = [
      '\uD83D\uDC1A Kowe Receipt \u2014 AFRIKONNECT',
      '',
      `Amount: ${amount.toLocaleString()} ${currency}`,
      `From: ${fromAfroId}`,
      `To: ${toAfroId}`,
      `Date: ${formatDate(timestamp)} ${formatTime(timestamp)}`,
      reference ? `Ref: ${reference}` : null,
      `Hash: ${truncateHash(koweHash)}`,
      reason ? `Reason: ${reason}` : null,
      `Status: ${statusLabel}`,
    ]
      .filter(Boolean)
      .join('\n')

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Kowe Receipt', text })
        return
      } catch {
        // user cancelled or API failed — fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2200)
      } catch {
        /* silent fail */
      }
    }
  }, [amount, currency, fromAfroId, toAfroId, timestamp, reference, koweHash, reason, statusLabel])

  /* ---- cleanup print style on unmount ---- */
  React.useEffect(() => {
    return () => {
      const el = document.getElementById(PRINT_STYLE_ID)
      if (el) el.remove()
    }
  }, [])

  /* ---- row helper ---- */
  const Row = ({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '8px 0',
        gap: 12,
      }}
    >
      <span
        style={{
          color: '#C9A84C',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          flexShrink: 0,
          paddingTop: 1,
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: '#E0D6C2',
          fontSize: mono ? 12 : 13,
          fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : 'inherit',
          textAlign: 'right',
          wordBreak: 'break-all',
          lineHeight: 1.4,
        }}
      >
        {value}
      </span>
    </div>
  )

  /* ---- dotted tear-line ---- */
  const TearLine = () => (
    <div
      style={{
        borderTop: '2px dashed #3A3220',
        margin: '0 20px',
      }}
      aria-hidden
    />
  )

  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.88)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        overflowY: 'auto',
      }}
    >
      {/* Receipt card */}
      <div
        id="kowe-receipt-card"
        ref={receiptRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#161616',
          borderRadius: 16,
          maxWidth: 400,
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 0 0 1px #C9A84C33, 0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* ---- Header ---- */}
        <div
          style={{
            padding: '18px 20px 14px',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* Watermark */}
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 16,
              color: '#C9A84C',
              opacity: 0.08,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 3,
              textTransform: 'uppercase',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
            aria-hidden
          >
            AFRIKONNECT
          </div>

          <div style={{ fontSize: 28 }}>{'\uD83D\uDC1A'}</div>
          <div
            style={{
              color: '#C9A84C',
              fontWeight: 800,
              fontSize: 16,
              letterSpacing: 2,
              marginTop: 4,
            }}
          >
            K\u00F2w\u00E8 Receipt
          </div>
          <div
            style={{
              color: '#C9A84C',
              opacity: 0.3,
              fontSize: 9,
              letterSpacing: 3,
              marginTop: 2,
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            AFRIKONNECT
          </div>
        </div>

        {/* ---- Top tear-line ---- */}
        <TearLine />

        {/* ---- Amount section ---- */}
        <div
          style={{
            padding: '24px 20px 20px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              color: '#C9A84C',
              fontWeight: 900,
              fontSize: 40,
              lineHeight: 1,
              letterSpacing: -1,
            }}
          >
            {amount.toLocaleString()}
          </div>
          <div
            style={{
              color: '#C9A84C',
              fontWeight: 700,
              fontSize: 14,
              marginTop: 4,
              opacity: 0.7,
              letterSpacing: 2,
            }}
          >
            {currency}
          </div>
        </div>

        {/* ---- Detail rows ---- */}
        <div style={{ padding: '0 20px' }}>
          <Row label="From" value={maskId(fromAfroId)} mono />
          <div style={{ borderBottom: '1px solid #222' }} />
          <Row label="To" value={maskId(toAfroId)} mono />
          <div style={{ borderBottom: '1px solid #222' }} />
          <Row label="Date" value={formatDate(timestamp)} />
          <div style={{ borderBottom: '1px solid #222' }} />
          <Row label="Time" value={formatTime(timestamp)} mono />
          <div style={{ borderBottom: '1px solid #222' }} />
          {reference && (
            <>
              <Row label="Reference" value={reference} mono />
              <div style={{ borderBottom: '1px solid #222' }} />
            </>
          )}
          <Row label="Kowe Hash" value={truncateHash(koweHash)} mono />
          <div style={{ borderBottom: '1px solid #222' }} />
          {reason && (
            <>
              <Row label="Reason" value={reason} />
              <div style={{ borderBottom: '1px solid #222' }} />
            </>
          )}
        </div>

        {/* ---- Status badge ---- */}
        <div style={{ padding: '16px 20px 8px', display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              background: statusBg,
              color: statusFg,
              fontWeight: 800,
              fontSize: 11,
              letterSpacing: 2,
              padding: '6px 20px',
              borderRadius: 20,
              textTransform: 'uppercase',
            }}
          >
            {statusLabel}
          </div>
        </div>

        {/* ---- Bottom tear-line ---- */}
        <div style={{ paddingTop: 8 }}>
          <TearLine />
        </div>

        {/* ---- Textile motif ---- */}
        <TextileMotif />

        {/* ---- Copied toast ---- */}
        {copied && (
          <div
            className="kowe-no-print"
            style={{
              textAlign: 'center',
              padding: '6px 16px',
              fontSize: 11,
              fontWeight: 700,
              color: '#4CAF50',
              letterSpacing: 1,
            }}
          >
            Receipt copied to clipboard
          </div>
        )}

        {/* ---- Footer buttons ---- */}
        <div
          className="kowe-no-print"
          style={{
            display: 'flex',
            gap: 10,
            padding: '4px 16px 16px',
          }}
        >
          <button
            onClick={handleShare}
            style={{
              flex: 1,
              background: '#1E1E1E',
              color: '#C9A84C',
              border: '1px solid #333',
              borderRadius: 10,
              padding: '12px 0',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = '#2A2A2A' }}
            onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = '#1E1E1E' }}
          >
            {'\uD83D\uDCE4'} Share
          </button>
          <button
            onClick={handlePrint}
            style={{
              flex: 1,
              background: '#1E1E1E',
              color: '#C9A84C',
              border: '1px solid #333',
              borderRadius: 10,
              padding: '12px 0',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = '#2A2A2A' }}
            onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = '#1E1E1E' }}
          >
            {'\uD83D\uDDA8'} Print
          </button>
          <button
            onClick={onClose}
            style={{
              width: 48,
              flexShrink: 0,
              background: '#1E1E1E',
              color: '#888',
              border: '1px solid #333',
              borderRadius: 10,
              padding: '12px 0',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = '#2A2A2A' }}
            onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = '#1E1E1E' }}
            aria-label="Close"
          >
            &#10005;
          </button>
        </div>
      </div>
    </div>
  )
}
