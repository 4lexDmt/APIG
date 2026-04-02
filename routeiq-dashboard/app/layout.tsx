import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { QueryProvider } from '@/components/providers/QueryProvider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RouteIQ - AI Cost Optimization',
  description:
    'Intelligent LLM routing that cuts your AI costs by 30% or more. Drop-in replacement for OpenAI with zero code changes.',
  keywords: ['AI cost optimization', 'LLM routing', 'OpenAI alternative', 'AI agents'],
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
    <ClerkProvider>
      <html lang="en" className="dark" suppressHydrationWarning>
        <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-[#0f172a] text-white`}>
          <QueryProvider>{children}</QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
