'use client'
import * as React from 'react'
import { logApiFailure } from '@/lib/flags'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatCowries } from '@/lib/utils'

type MarketCategory = 'ALL' | 'DIGITAL' | 'PHYSICAL' | 'SERVICES' | 'BARTER'

interface MockListing {
  id: string
  title: string
  seller: string
  sellerCountry: string
  price: number
  currency: 'COWRIES' | 'NGN' | 'GHS'
  category: Exclude<MarketCategory, 'ALL'>
  emoji: string
  isNFT?: boolean
  condition?: string
  tags: string[]
}

const CATEGORIES: { id: MarketCategory; emoji: string; label: string }[] = [
  { id:'ALL',      emoji:'🛒', label:'All'      },
  { id:'DIGITAL',  emoji:'💾', label:'Digital'  },
  { id:'PHYSICAL', emoji:'📦', label:'Physical' },
  { id:'SERVICES', emoji:'⚙️', label:'Services' },
  { id:'BARTER',   emoji:'🔄', label:'Barter'   },
]

export default function MarketplacePage() {
  const [category, setCategory] = React.useState<MarketCategory>('ALL')
  const [search, setSearch] = React.useState('')
  const [listings, setListings] = React.useState<MockListing[]>([])

  React.useEffect(() => {
    fetch('/api/feed/posts?type=MARKET_LISTING')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setListings(Array.isArray(data) ? data : []))
      .catch((e) => logApiFailure('marketplace/listings', e))
  }, [])

  const filtered = listings.filter((l) => {
    if (category !== 'ALL' && l.category !== category) return false
    if (search) {
      const q = search.toLowerCase()
      return l.title.toLowerCase().includes(q) || l.tags.some((t) => t.toLowerCase().includes(q))
    }
    return true
  })

  const formatPrice = (listing: MockListing) => {
    if (listing.category === 'BARTER') return 'Trade/Swap'
    if (listing.currency === 'COWRIES') return formatCowries(listing.price)
    return `₦${listing.price.toLocaleString()}`
  }

  return (
    <div className="space-y-0 animate-fade-in">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Ọja / Kasuwa</h1>
          <p className="text-xs text-gray-400 mt-0.5">African Trade Exchange</p>
        </div>
        <Button variant="primary" size="sm">+ List</Button>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-border">
        <Input
          placeholder="Search the market…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<span className="text-sm">🔍</span>}
        />
      </div>

      {/* Category tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        {CATEGORIES.map(({ id, emoji, label }) => (
          <button
            key={id}
            onClick={() => setCategory(id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium flex-shrink-0 border-b-2 transition-all ${
              category === id
                ? 'border-kente-gold text-kente-gold'
                : 'border-transparent text-gray-500'
            }`}
          >
            {emoji} {label}
          </button>
        ))}
      </div>

      {/* Listings */}
      <div className="divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center px-6">
            <span className="text-3xl">🛒</span>
            <p className="text-sm text-gray-400">No listings found</p>
          </div>
        ) : (
          filtered.map((listing) => (
            <div key={listing.id} className="px-4 py-4">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-xl bg-bg-elevated border border-border flex items-center justify-center text-3xl flex-shrink-0">
                  {listing.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-white">{listing.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        @{listing.seller} · {listing.sellerCountry}
                        {listing.condition && ` · ${listing.condition}`}
                      </p>
                    </div>
                    <p className={`text-sm font-bold flex-shrink-0 ${
                      listing.currency === 'COWRIES' ? 'text-kente-gold' : 'text-green-400'
                    }`}>
                      {formatPrice(listing)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {listing.isNFT && <Badge variant="purple" size="sm">NFT</Badge>}
                    {listing.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" size="sm">{tag}</Badge>
                    ))}
                    <Button variant="secondary" size="sm" className="ml-auto">
                      {listing.category === 'BARTER' ? '🔄 Propose Trade' : '🛒 Buy'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Zero-rating notice */}
      <div className="px-4 py-3 border-t border-border">
        <div className="bg-bg-elevated border border-kente-forest/30 rounded-xl p-3 flex items-start gap-2">
          <span className="text-lg">⚡</span>
          <div>
            <p className="text-xs font-medium text-kente-forest">Zero-Rating Active</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Browsing the market is free on partner networks. Buy freely.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
