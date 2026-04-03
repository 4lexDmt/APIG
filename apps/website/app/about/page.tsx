import type { Metadata } from 'next'
import Footer from '@/components/sections/Footer'

export const metadata: Metadata = {
  title: 'About',
  description: 'RouteIQ is on a mission to make AI infrastructure costs predictable and fair.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0f172a]">
      <div className="border-b border-white/10 px-6 py-16 text-center">
        <h1 className="mb-4 text-5xl font-bold text-white">About RouteIQ</h1>
        <p className="mx-auto max-w-2xl text-xl text-slate-400">
          We&apos;re building the infrastructure layer that makes AI agent economics work.
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="mb-16 space-y-6 text-slate-300">
          <h2 className="text-2xl font-bold text-white">Our Mission</h2>
          <p className="leading-relaxed">
            AI agent frameworks are getting dramatically more capable — LangChain, CrewAI, AutoGen
            — but the economics haven&apos;t caught up. Developers building multi-agent systems
            routinely overpay by 30–50% because they default to GPT-4 for every call, regardless
            of whether the task requires it.
          </p>
          <p className="leading-relaxed">
            RouteIQ fixes this with a single line of code. We sit between your agents and the
            providers, route each request to the cheapest qualified model, and enforce hard budget
            limits so runaway agents don&apos;t bankrupt your team.
          </p>
          <p className="leading-relaxed">
            We believe AI infrastructure should be predictable, affordable, and transparent.
            Every token should cost what it&apos;s worth — no more, no less.
          </p>
        </div>

        <div className="mb-16">
          <h2 className="mb-8 text-2xl font-bold text-white">The Team</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              {
                name: 'Team Member',
                role: 'CEO & Co-founder',
                bio: 'Previously infrastructure engineering at a major AI lab. Built high-throughput API systems at scale.',
              },
              {
                name: 'Team Member',
                role: 'CTO & Co-founder',
                bio: 'Systems engineer focused on distributed systems and developer tooling. Go and Rust specialist.',
              },
            ].map((member, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className="mb-3 h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
                <div className="font-semibold text-white">{member.name}</div>
                <div className="mb-3 text-sm text-blue-400">{member.role}</div>
                <p className="text-sm text-slate-400">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-8 text-center">
          <h3 className="mb-3 text-xl font-bold text-white">We&apos;re hiring</h3>
          <p className="mb-4 text-slate-400">
            Looking for engineers who care deeply about developer experience and distributed systems.
          </p>
          <a
            href="mailto:jobs@routeiq.com"
            className="inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
          >
            jobs@routeiq.com
          </a>
        </div>
      </div>
      <Footer />
    </main>
  )
}
