'use client'
// ============================================================
// Design System Showcase — FE Prompt 1
// Visit: http://localhost:3003/design-system
// ============================================================
import * as React from 'react'
import { DrumPulse }       from '@/components/ui/DrumPulse'
import { Button }          from '@/components/ui/Button'
import { Input }           from '@/components/ui/Input'
import { Card }            from '@/components/ui/Card'
import { Avatar }          from '@/components/ui/Avatar'
import { HeatBar }         from '@/components/ui/HeatBar'
import { Badge }           from '@/components/ui/Badge'
import { SkeletonCard, SkeletonPost } from '@/components/ui/Skeleton'
import { ThemeToggle }     from '@/components/providers/ThemeProvider'
import { Search, Lock }    from 'lucide-react'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <div className="relative mb-6 px-4 py-3 rounded-xl bg-adinkra overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {/* Adinkra at 4% opacity */}
        <div className="bg-adinkra bg-adinkra-overlay" />
        <h2 className="text-lg font-bold relative z-10" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
      </div>
      <div className="px-4">{children}</div>
    </section>
  )
}

export default function DesignSystemPage() {
  const [heatScore, setHeatScore] = React.useState(45)

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 py-3"
        style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
        <div>
          <h1 className="font-bold text-base">Viewdicon Design System</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>FE Prompt 1 — All 9 components</p>
        </div>
        <ThemeToggle />
      </div>

      <div className="max-w-md mx-auto pt-6">

        {/* DrumPulse */}
        <Section title="DrumPulse — Talking Drum Loader">
          <div className="flex items-center gap-8 mb-2">
            <div className="flex flex-col items-center gap-2">
              <DrumPulse speed="fast" size={40} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>4G fast</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <DrumPulse speed="medium" size={40} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>3G medium</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <DrumPulse speed="slow" size={40} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>2G slow</span>
            </div>
          </div>
        </Section>

        {/* Buttons */}
        <Section title="Buttons — 4 variants, DrumPulse loading">
          <div className="flex flex-wrap gap-3 mb-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button loading>Loading…</Button>
            <Button disabled>Disabled</Button>
          </div>
        </Section>

        {/* Inputs */}
        <Section title="Input — label, error, icons, OTP, password">
          <div className="space-y-4">
            <Input label="Phone number" placeholder="+234 800 000 0000" leftIcon={<Search size={16} />} />
            <Input label="Password" type="password" placeholder="Enter your secret" />
            <Input label="OTP Code" type="tel" placeholder="000000" hint="Enter the 6-digit code sent to your phone" />
            <Input label="Handle" placeholder="@your_handle" error="Handle already taken" />
          </div>
        </Section>

        {/* Cards */}
        <Section title="Card — framer-motion hover spring">
          <div className="space-y-3">
            <Card hover padding="md">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Hover me — spring scale(1.01). Border not shadow.
              </p>
            </Card>
            <Card padding="lg">
              <p className="font-semibold mb-1">Non-interactive card</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Forest-dark background in dark mode (#111a12). White in light mode.
              </p>
            </Card>
          </div>
        </Section>

        {/* Avatars */}
        <Section title="Avatar — crest rings, village dot, square form">
          <div className="flex items-end gap-5 flex-wrap">
            {([0, 3, 5, 7, 8] as const).map((tier) => (
              <div key={tier} className="flex flex-col items-center gap-1.5">
                <Avatar
                  name="Amara Osei"
                  size={tier === 0 ? 'sm' : tier === 3 ? 'md' : tier === 5 ? 'lg' : 'xl'}
                  crestTier={tier}
                  villageColor={tier > 0 ? '#1a7c3e' : undefined}
                />
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Tier {tier}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* HeatBar */}
        <Section title="HeatBar — drag to test all 4 states">
          <div className="space-y-2 mb-4">
            <HeatBar score={5}  />
            <HeatBar score={25} />
            <HeatBar score={60} />
            <HeatBar score={85} />
          </div>
          <div className="mt-4">
            <label className="text-sm mb-2 block" style={{ color: 'var(--text-secondary)' }}>
              Interactive: {heatScore}°
            </label>
            <input
              type="range" min={0} max={100} value={heatScore}
              onChange={(e) => setHeatScore(Number(e.target.value))}
              className="w-full mb-2" style={{ accentColor: '#1a7c3e' }}
            />
            <HeatBar score={heatScore} />
          </div>
        </Section>

        {/* Badges */}
        <Section title="Badge — village, skin, status variants">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="green">🌿 Rooted</Badge>
            <Badge variant="gold">⭐ Elder</Badge>
            <Badge variant="purple">🔮 Sage</Badge>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="skin-ise">💼 Ise (Work)</Badge>
            <Badge variant="skin-egbe">👥 Egbe (Social)</Badge>
            <Badge variant="skin-idile">🏡 Idile (Clan)</Badge>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="village-healing">🏥 Healing Circle</Badge>
            <Badge variant="village-griot">📜 Griot Hall</Badge>
            <Badge variant="village-forge">⚙️ Code Forge</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="online" showDot>Online</Badge>
            <Badge variant="away"   showDot>Away</Badge>
            <Badge variant="offline" showDot>Offline</Badge>
          </div>
        </Section>

        {/* Skeletons */}
        <Section title="Skeleton — zero blank screens">
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonPost />
          </div>
        </Section>

      </div>
    </div>
  )
}
