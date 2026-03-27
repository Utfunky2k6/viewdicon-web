'use client'
import Link from 'next/link'

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-bg-default flex flex-col items-center justify-center px-6 text-center gap-6">
      <div className="text-6xl">⚡</div>
      <div>
        <h1 className="text-2xl font-bold text-white">The fire flickered</h1>
        <p className="text-gray-400 mt-2 text-sm">
          Something went wrong. The elders have been notified.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <p className="text-xs text-red-400 mt-2 font-mono">{error.message}</p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-xl border border-border text-white hover:border-border-strong transition-all text-sm"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 rounded-xl bg-kente-gold text-bg-default font-bold hover:bg-yellow-400 transition-all text-sm"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
