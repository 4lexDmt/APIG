import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0f172a] px-6 py-24 md:py-36">
      {/* Animated grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59,130,246,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59,130,246,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-400">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
          Now in beta — free for design partners
        </div>

        {/* Headline */}
        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
          Your AI agents.{' '}
          <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Half the cost.
          </span>
          <br />
          Zero code changes.
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-400 md:text-xl">
          RouteIQ routes your LLM calls to the cheapest qualified provider automatically.
          Drop in one line. Start saving.
        </p>

        {/* The Code Diff — hero element */}
        <div className="mx-auto mb-12 max-w-xl overflow-hidden rounded-xl border border-white/10 bg-slate-900 text-left shadow-2xl">
          <div className="flex items-center gap-2 border-b border-white/10 bg-slate-800/50 px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-red-500/70" />
            <div className="h-3 w-3 rounded-full bg-amber-500/70" />
            <div className="h-3 w-3 rounded-full bg-green-500/70" />
            <span className="ml-2 font-mono text-xs text-slate-400">agent.py</span>
          </div>
          <div className="p-4 font-mono text-sm">
            <div className="flex items-center gap-3 rounded bg-red-500/10 px-3 py-1.5">
              <span className="select-none text-red-400">-</span>
              <span className="text-red-300">
                base_url=<span className="text-red-400">&quot;https://api.openai.com/v1&quot;</span>
              </span>
            </div>
            <div className="mt-1 flex items-center gap-3 rounded bg-emerald-500/10 px-3 py-1.5">
              <span className="select-none text-emerald-400">+</span>
              <span className="text-emerald-300">
                base_url=<span className="text-emerald-400">&quot;https://api.routeiq.com/v1&quot;</span>
              </span>
            </div>
            <div className="mt-3 text-center text-xs text-slate-500">
              That&apos;s the entire migration. One line.
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="https://app.routeiq.com/sign-up"
            className="rounded-lg bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500 hover:shadow-blue-500/40"
          >
            Start Free
          </Link>
          <Link
            href="/docs"
            className="rounded-lg border border-white/20 bg-white/5 px-8 py-3.5 text-base font-semibold text-white transition-all hover:border-white/40 hover:bg-white/10"
          >
            Read the Docs →
          </Link>
        </div>

        {/* Social proof stats */}
        <div className="mt-16 flex flex-wrap justify-center gap-10 border-t border-white/10 pt-10">
          {[
            { label: 'Tokens processed/month', value: '100M+' },
            { label: 'Average cost savings', value: '30%+' },
            { label: 'Routing overhead P95', value: '<50ms' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="mt-1 text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
