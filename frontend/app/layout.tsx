import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/components/providers/QueryProvider'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

export const metadata: Metadata = {
  title: 'Smart Dining Assistant',
  description: 'AI-first dining experience — Zara helps you order in plain language',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
