'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

interface ApprovedBrief {
  id: string
  approved_at: string | null
  issue_areas: { name: string } | null
}

const mainNavItems = [
  { href: '/library', label: 'Document Library' },
  { href: '/detect', label: 'Write Brief' },
]

// Routes where "Write Brief" should be highlighted
const WRITE_BRIEF_ROUTES = ['/detect', '/briefs']

function getActiveNav(pathname: string, briefIds: string[]): string {
  // Check if we're on a specific brief page — those are highlighted individually
  for (const id of briefIds) {
    if (pathname === `/briefs/${id}` || pathname.startsWith(`/briefs/${id}/`)) {
      return `/briefs/${id}`
    }
  }
  // Write Brief highlights for /detect and /briefs (non-approved create flow)
  if (WRITE_BRIEF_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))) {
    return '/detect'
  }
  for (const item of mainNavItems) {
    if (pathname === item.href || pathname.startsWith(item.href + '/')) {
      return item.href
    }
  }
  return ''
}

export function Sidebar() {
  const pathname = usePathname()
  const [approvedBriefs, setApprovedBriefs] = useState<ApprovedBrief[]>([])
  const [briefsOpen, setBriefsOpen] = useState(true)

  useEffect(() => {
    const fetchApproved = async () => {
      try {
        const res = await fetch('/api/briefs')
        const data = await res.json()
        const approved = (Array.isArray(data) ? data : []).filter(
          (b: ApprovedBrief) => b.approved_at !== null
        )
        setApprovedBriefs(approved)
      } catch {
        // silently fail
      }
    }
    fetchApproved()
  }, [pathname]) // re-fetch when route changes so finalized briefs appear

  const briefIds = approvedBriefs.map(b => b.id)
  const activeHref = getActiveNav(pathname, briefIds)

  return (
    <aside className="w-56 bg-slate-900 text-slate-100 flex flex-col shrink-0">
      <div className="p-5 border-b border-slate-700">
        <h1 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          RAF Field Builder
        </h1>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {/* Main nav items */}
        {mainNavItems.map(item => {
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

        {/* Briefs expandable section */}
        <div className="pt-2">
          <button
            onClick={() => setBriefsOpen(prev => !prev)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <span>Briefs</span>
            <span className="text-xs">{briefsOpen ? '▾' : '▸'}</span>
          </button>

          {briefsOpen && (
            <div className="mt-1 ml-3 space-y-0.5">
              {approvedBriefs.length === 0 ? (
                <p className="px-3 py-2 text-xs text-slate-600 italic">No finalized briefs yet</p>
              ) : (
                approvedBriefs.map(brief => {
                  const href = `/briefs/${brief.id}`
                  const isActive = activeHref === href
                  return (
                    <Link
                      key={brief.id}
                      href={href}
                      className={`flex items-center px-3 py-1.5 rounded-md text-xs transition-colors ${
                        isActive
                          ? 'bg-slate-700 text-white font-medium'
                          : 'text-slate-500 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <span className="w-1 h-3 bg-blue-400 rounded-full mr-2 shrink-0" />
                      )}
                      <span className="truncate">{brief.issue_areas?.name ?? 'Untitled'}</span>
                    </Link>
                  )
                })
              )}
            </div>
          )}
        </div>
      </nav>
    </aside>
  )
}
