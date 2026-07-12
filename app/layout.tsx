import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { PostHogPageView } from '@/components/posthog-page-view'
import { PostHogProvider } from '@/components/posthog-provider'

import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Product Discovery Intelligence',
  description:
    'Organizational memory for product teams — connect research, assumptions, and decisions.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <PostHogProvider>
          <PostHogPageView />
          {children}
        </PostHogProvider>
      </body>
    </html>
  )
}
