import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://routeiq.com'),
  title: {
    default: 'RouteIQ — AI Agent Cost Optimization',
    template: '%s | RouteIQ',
  },
  description:
    'RouteIQ routes your LLM calls to the cheapest qualified provider automatically. Drop in one line. Start saving 30%+ on AI costs.',
  keywords: ['LLM routing', 'AI cost optimization', 'OpenAI alternative', 'API gateway', 'AI agents'],
  authors: [{ name: 'RouteIQ' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://routeiq.com',
    siteName: 'RouteIQ',
    title: 'RouteIQ — AI Agent Cost Optimization',
    description:
      'Drop-in reverse proxy that routes LLM calls to the cheapest qualified provider. Zero code changes. 30%+ savings.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RouteIQ — AI Agent Cost Optimization',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RouteIQ — AI Agent Cost Optimization',
    description: 'Drop-in LLM routing. Zero code changes. 30%+ savings.',
    images: ['/og-image.png'],
    creator: '@routeiq',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0f172a] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  )
}
