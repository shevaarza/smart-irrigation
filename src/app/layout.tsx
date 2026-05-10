import './globals.css'
import type { Metadata } from 'next'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'Smart Plant Monitor',
  description: 'IoT monitoring system for smart agriculture',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>
        <Sidebar />
        <div className="ml-60 min-h-screen">
          <Navbar />
          <main className="p-6">{children}</main>
        </div>
      </body>
    </html>
  )
}