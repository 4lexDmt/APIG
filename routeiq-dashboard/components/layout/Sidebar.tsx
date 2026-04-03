'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Bot,
  BarChart2,
  Server,
  CreditCard,
  Settings,
  Webhook,
  Users,
  ChevronRight,
} from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { cn } from '@/lib/utils/cn'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  children?: { href: string; label: string; icon: React.ElementType }[]
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agents', label: 'Agents', icon: Bot },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/providers', label: 'Providers', icon: Server },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    children: [
      { href: '/settings/team', label: 'Team', icon: Users },
      { href: '/settings/webhooks', label: 'Webhooks', icon: Webhook },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-60 shrink-0 h-screen bg-[#0f172a] border-r border-white/10 flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-routeiq-blue flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-xs">R</span>
          </div>
          <span className="text-white font-bold text-lg">
            Route<span className="text-routeiq-blue">IQ</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          const hasChildren = item.children && item.children.length > 0

          return (
            <div key={item.href}>
              <Link
                href={hasChildren ? item.children![0].href : item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group',
                  active
                    ? 'bg-routeiq-blue/20 text-routeiq-blue'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    active ? 'text-routeiq-blue' : 'text-slate-500 group-hover:text-slate-300'
                  )}
                />
                <span className="flex-1">{item.label}</span>
                {hasChildren && (
                  <ChevronRight
                    className={cn(
                      'w-3.5 h-3.5 transition-transform',
                      active ? 'rotate-90 text-routeiq-blue' : 'text-slate-600'
                    )}
                  />
                )}
              </Link>
              {hasChildren && active && (
                <div className="ml-10 mt-0.5 space-y-0.5">
                  {item.children!.map((child) => {
                    const ChildIcon = child.icon
                    const childActive = pathname === child.href
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                          childActive
                            ? 'text-routeiq-blue'
                            : 'text-slate-500 hover:text-slate-300'
                        )}
                      >
                        <ChildIcon className="w-3.5 h-3.5 shrink-0" />
                        {child.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8',
              },
            }}
          />
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">My Organization</p>
            <p className="text-slate-500 text-xs">Free plan</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
