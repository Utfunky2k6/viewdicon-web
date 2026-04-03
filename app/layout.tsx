import type { Metadata, Viewport } from 'next'
import { Providers } from './providers'
import { OfflineBanner } from '@/components/ui/OfflineBanner'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default:  'Viewdicon',
    template: '%s | Viewdicon',
  },
  description: 'Where African identity meets sovereign technology. One ID. All of Africa.',
  manifest:    '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-128.png', sizes: '128x128', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  keywords:    ['Africa', 'AfroID', 'digital identity', 'viewdicon', 'community', 'diaspora'],
}

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  // themeColor adapts to current theme — set via ThemeProvider JS
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Dark is default — ThemeProvider may add data-theme="light" on client
    <html lang="en">
      <body style={{ fontFamily: "Ubuntu, 'Noto Sans', system-ui, sans-serif" }}>
        <Providers>
          <OfflineBanner />
          {children}
        </Providers>
      </body>
    </html>
  )
}
