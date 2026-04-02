import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { OktaProvider } from '@/components/providers/okta-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Terminal Pro | Financial Data Platform',
  description: 'Real-time market data, news, and AI-powered insights',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#f7f5ef',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-background text-foreground">
        <OktaProvider>
          {children}
        </OktaProvider>
        <Analytics />
      </body>
    </html>
  )
}
