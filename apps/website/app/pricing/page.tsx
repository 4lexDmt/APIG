import type { Metadata } from 'next'
import PricingSection from '@/components/sections/PricingSection'
import Footer from '@/components/sections/Footer'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, transparent pricing for RouteIQ. Start free, scale as you grow.',
  openGraph: {
    title: 'RouteIQ Pricing',
    description: 'Simple, transparent pricing. Free tier, Growth at $99/mo, Enterprise custom.',
  },
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#0f172a]">
      <div className="border-b border-white/10 px-6 py-16 text-center">
        <h1 className="mb-4 text-5xl font-bold text-white">Pricing</h1>
        <p className="text-xl text-slate-400">
          Start free. Scale when you&apos;re ready. No surprise bills — ever.
        </p>
      </div>
      <PricingSection />
      <Footer />
    </main>
  )
}
