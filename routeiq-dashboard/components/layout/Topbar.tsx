'use client'

import { usePathname } from 'next/navigation'
import { Search, Bell } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Overview',
  '/agents': 'Agents',
  '/analytics': 'Analytics',
  '/providers': 'Providers & Models',
  '/payments': 'Payments',
  '/settings/team': 'Team Settings',
  '/settings/webhooks': 'Webhook Settings',
  '/docs': 'API Documentation',
}

function getPageTitle(pathname: string): string {
  // Check for dynamic routes first
  if (pathname.match(/^\/agents\/[^/]+$/)) return 'Agent Details'
  return PAGE_TITLES[pathname] ?? 'Dashboard'
}

export function Topbar() {
  const pathname = usePathname()
  const title = getPageTitle(pathname)

  return (
    <header className="h-16 bg-slate-950 border-b border-white/10 flex items-center justify-between px-6 shrink-0">
      <h2 className="text-white font-semibold text-lg">{title}</h2>
      <div className="flex items-center gap-3">
        {/* Search (decorative for Sprint 1) */}
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-slate-900 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-400 placeholder-slate-600 focus:outline-none focus:border-routeiq-blue w-48 transition-all focus:w-64"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-routeiq-red" />
        </button>

        {/* User */}
        <UserButton
          appearance={{
            elements: {
              avatarBox: 'w-8 h-8',
            },
          }}
        />
      </div>
    </header>
  )
}
