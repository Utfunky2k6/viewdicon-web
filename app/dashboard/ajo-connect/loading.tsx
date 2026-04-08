import { Skeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div style={{ minHeight: '100dvh', background: '#060D06' }}>
      {/* nav skeleton */}
      <div style={{
        padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(34,197,94,0.1)',
      }}>
        <Skeleton style={{ width: 80, height: 16, borderRadius: 6 }} />
        <Skeleton style={{ width: 120, height: 20, borderRadius: 8 }} />
        <div style={{ width: 60 }} />
      </div>
      {/* hero */}
      <div style={{ padding: '36px 20px 32px', textAlign: 'center' }}>
        <Skeleton style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px' }} />
        <Skeleton style={{ width: 160, height: 28, borderRadius: 8, margin: '0 auto 8px' }} />
        <Skeleton style={{ width: 220, height: 14, borderRadius: 6, margin: '0 auto' }} />
      </div>
      {/* tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, padding: '0 16px 20px' }}>
        <Skeleton style={{ height: 76, borderRadius: 14 }} />
        <Skeleton style={{ height: 76, borderRadius: 14 }} />
        <Skeleton style={{ height: 76, borderRadius: 14 }} />
      </div>
      {/* profile card */}
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Skeleton style={{ height: 140, borderRadius: 16 }} />
        <Skeleton style={{ height: 100, borderRadius: 16 }} />
        <Skeleton style={{ height: 80, borderRadius: 16 }} />
      </div>
    </div>
  )
}
