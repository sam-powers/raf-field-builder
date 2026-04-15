'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/library', label: 'Document Library' },
  { href: '/detect', label: 'Topics' },
  { href: '/coding', label: 'Coding' },
]

// Routes that belong to the Topics nav section
const TOPICS_ROUTES = ['/detect', '/briefs', '/alignment', '/codebook']

function getActiveNav(pathname: string): string {
  if (TOPICS_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))) {
    return '/detect'
  }
  for (const item of navItems) {
    if (pathname === item.href || pathname.startsWith(item.href + '/')) {
      return item.href
    }
  }
  return ''
}

export function Sidebar() {
  const pathname = usePathname()
  const activeHref = getActiveNav(pathname)

  return (
    <aside className="w-56 bg-slate-900 text-slate-100 flex flex-col shrink-0">
      <div className="p-5 border-b border-slate-700">
        <h1 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          RAF Field Builder
        </h1>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => {
          const isActive = activeHref === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-slate-700 text-white font-medium'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {isActive && (
                <span className="w-1 h-4 bg-blue-400 rounded-full mr-2 shrink-0" />
              )}
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
