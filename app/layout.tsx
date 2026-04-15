import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RAF Field Builder',
  description: 'Coalition position mapping for Recode America Fund',
}

const navItems = [
  { href: '/library', label: 'Document Library' },
  { href: '/detect', label: 'Issue Areas' },
  { href: '/briefs', label: 'Briefs' },
  { href: '/coding', label: 'Coding' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-slate-50">
          <aside className="w-56 bg-slate-900 text-slate-100 flex flex-col">
            <div className="p-5 border-b border-slate-700">
              <h1 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">RAF Field Builder</h1>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {navItems.map(item => (
                <Link key={item.href} href={item.href}
                  className="block px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
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
