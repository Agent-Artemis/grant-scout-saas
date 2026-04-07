import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GrantScout - AI-Powered Grant Discovery for Healthcare & Research',
  description: 'Find the right grants and win more funding with our AI-powered grant discovery platform. 8.5% success fee, free trial available.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}