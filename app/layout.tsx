import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'PDI — Product Discovery Intelligence',
  description: 'AI-native organizational memory platform. Capture, connect, and surface the insights, assumptions, and decisions your product team generates. Turn discovery into organizational knowledge.',
  keywords: ['product discovery', 'organizational memory', 'product management', 'research', 'knowledge graph', 'AI'],
  openGraph: {
    title: 'PDI — Product Discovery Intelligence',
    description: 'Stop losing discovery knowledge. Capture insights, assumptions, and decisions. Let AI connect them.',
    type: 'website',
    url: 'https://pdi.app',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: true,
  themeColor: '#2563eb',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth bg-background">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-primary`}>
        {children}
      </body>
    </html>
  )
}
