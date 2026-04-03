const FEATURES = [
  {
    icon: '⚡',
    title: 'Zero Code Changes',
    description:
      'Drop-in OpenAI compatibility. Same request format, same response format. Your agent code stays exactly as-is.',
  },
  {
    icon: '💰',
    title: 'Per-Agent Budgets',
    description:
      'Hard spend limits enforced in Redis with atomic operations. No surprise bills from runaway agent loops.',
  },
  {
    icon: '🔌',
    title: 'Circuit Breakers',
    description:
      'Automatic runaway loop protection. RouteIQ tracks request velocity per agent and trips the breaker before your bill explodes.',
  },
  {
    icon: '📊',
    title: 'Real-Time Dashboard',
    description:
      'See exactly where every dollar goes. Per-agent cost breakdown, provider distribution, latency histograms — all live.',
  },
  {
    icon: '🔗',
    title: 'Stablecoin Settlement',
    description:
      'USDC micropayments on Base L2 via x402 protocol. Pay per token, settle atomically — no monthly invoices.',
  },
  {
    icon: '📉',
    title: '30%+ Cost Savings',
    description:
      'Verified against identical workloads across our design partner cohort. The routing algorithm optimizes for quality-adjusted cost.',
  },
]

export default function FeaturesGridSection() {
  return (
    <section className="bg-[#0f172a] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-white">
            Everything your AI infrastructure needs
          </h2>
          <p className="text-lg text-slate-400">
            Built for teams running production AI agents at scale
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-blue-500/30 hover:bg-blue-500/5"
            >
              <div className="mb-4 text-3xl">{feature.icon}</div>
              <h3 className="mb-2 text-lg font-semibold text-white">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
