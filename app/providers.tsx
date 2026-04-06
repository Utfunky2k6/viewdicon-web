'use client'
import * as React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { setupAutoSync } from '@/lib/offline-db'
import { ServiceWorkerRegistrar } from '@/components/ServiceWorkerRegistrar'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:    60_000,
      retry:        2,
      refetchOnWindowFocus: false,
    },
  },
})

function SyncManager() {
  React.useEffect(() => {
    const cleanup = setupAutoSync(({ banking }) => {
      if (banking.succeeded > 0) {
        // Invalidate balance/ledger queries so UI refreshes
        queryClient.invalidateQueries({ queryKey: ['cowrie-balance'] })
        queryClient.invalidateQueries({ queryKey: ['banking-ledger'] })
      }
    })
    return cleanup
  }, [])
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <SyncManager />
        <ServiceWorkerRegistrar />
        {children}
      </QueryClientProvider>
    </ThemeProvider>
  )
}
