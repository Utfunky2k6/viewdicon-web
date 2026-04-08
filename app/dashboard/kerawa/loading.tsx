import { Skeleton } from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div style={{ minHeight: '100dvh', background: '#0f0500' }}>
      {/* nav skeleton */}
      <div style={{
        padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(239,68,68,0.1)',
      }}>
        <Skeleton style={{ width: 80, height: 16, borderRadius: 6 }} />
        <Skeleton style={{ width: 80, height: 20, borderRadius: 8 }} />
        <Skeleton style={{ width: 60, height: 28, borderRadius: 14 }} />
      </div>
      {/* hero */}
      <div style={{ padding: '32px 20px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
          <Skeleton style={{ width: 48, height: 48, borderRadius: '50%' }} />
          <div>
            <Skeleton style={{ width: 180, height: 22, borderRadius: 6, marginBottom: 6 }} />
            <Skeleton style={{ width: 240, height: 13, borderRadius: 4 }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Skeleton style={{ flex: 1, height: 64, borderRadius: 14 }} />
          <Skeleton style={{ flex: 1, height: 64, borderRadius: 14 }} />
          <Skeleton style={{ flex: 1, height: 64, borderRadius: 14 }} />
        </div>
      </div>
      {/* zones grid */}
      <div style={{ padding: '0 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Skeleton style={{ height: 120, borderRadius: 16 }} />
        <Skeleton style={{ height: 120, borderRadius: 16 }} />
        <Skeleton style={{ height: 120, borderRadius: 16 }} />
        <Skeleton style={{ height: 120, borderRadius: 16 }} />
      </div>
    </div>
  )
}
