// TODO(production): restore ClerkProvider wrapper before deploying.
import type { Metadata } from 'next'
import { QueryProvider } from '@/components/providers/QueryProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'RouteIQ - AI Cost Optimization',
  description:
    'Intelligent LLM routing that cuts your AI costs by 30% or more. Drop-in replacement for OpenAI with zero code changes.',
  openGraph: {
    title: 'RouteIQ - AI Cost Optimization',
    description: 'Cut your AI costs by 30% with intelligent LLM routing.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased bg-[#0f172a] text-white">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
