'use client'

import Link from 'next/link'

const LINKS = {
  Product: [
    { label: 'Dashboard', href: 'https://app.routeiq.com' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Changelog', href: '/changelog' },
    { label: 'Status', href: 'https://status.routeiq.com' },
  ],
  Docs: [
    { label: 'Quickstart', href: '/docs' },
    { label: 'API Reference', href: '/docs#api' },
    { label: 'Blog', href: '/blog' },
    { label: 'GitHub', href: 'https://github.com/routeiq' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Twitter / X', href: 'https://twitter.com/routeiq' },
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
}

export default function Footer() {
  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const input = form.querySelector('input[type="email"]') as HTMLInputElement
    console.log('Newsletter signup:', input?.value)
    input.value = ''
  }

  return (
    <footer className="border-t border-white/10 bg-[#0f172a] px-6 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xl font-bold text-white">Route</span>
              <span className="text-xl font-bold text-blue-400">IQ</span>
            </div>
            <p className="mb-6 text-sm text-slate-400">
              Drop-in LLM routing. Zero code changes. 30%+ savings.
            </p>
            {/* Newsletter */}
            <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500/50"
              />
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
              >
                →
              </button>
            </form>
            <p className="mt-2 text-xs text-slate-600">No spam. Product updates only.</p>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="mb-4 text-sm font-semibold text-white">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} RouteIQ, Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-slate-500 hover:text-slate-300">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-slate-500 hover:text-slate-300">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
