import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Government Schemes Database',
  description: 'Manage and view government schemes data',
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

