import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RAF Field Builder',
  description: 'Coalition position mapping for Recode America Fund',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && (
          <div className="bg-amber-400 text-amber-900 text-xs text-center py-1 font-medium">
            Demo Mode — synthetic data only. Connect Supabase + API keys to go live.
          </div>
        )}
        <div className="flex h-screen bg-slate-50">
          <Sidebar />
          <main className="flex-1 overflow-auto">
            <div className="max-w-6xl mx-auto p-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
