import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-default flex flex-col items-center justify-center px-6 text-center gap-6">
      <div className="text-6xl">🌑</div>
      <div>
        <h1 className="text-2xl font-bold text-white">Lost in the bush</h1>
        <p className="text-gray-400 mt-2 text-sm">
          This path doesn&apos;t exist in the village.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="px-6 py-3 rounded-2xl bg-kente-gold text-bg-default font-bold hover:bg-yellow-400 transition-all"
      >
        Return to the Compound 🏘️
      </Link>
    </div>
  )
}
