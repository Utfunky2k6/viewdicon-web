import { MobileShell } from '@/components/layout/MobileShell'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <MobileShell>{children}</MobileShell>
}
