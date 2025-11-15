import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Market Watcher - Stock Market News',
  description: 'Stay updated with the latest stock market news',
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

