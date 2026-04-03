import Link from 'next/link'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'For developers exploring RouteIQ',
    features: [
      '5M tokens/month',
      '1 agent',
      'Basic dashboard',
      'Email support',
      'Community Slack access',
    ],
    cta: 'Start Free',
    href: 'https://app.routeiq.com/sign-up',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '$99',
    period: '/month',
    description: 'For teams running production AI agents',
    features: [
      '100M tokens/month',
      '20 agents',
      'Full analytics & export',
      'Slack support',
      'Webhook integrations',
      'Priority routing',
    ],
    cta: 'Start Growth Trial',
    href: 'https://app.routeiq.com/sign-up?plan=growth',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large teams with custom requirements',
    features: [
      'Unlimited tokens',
      'Unlimited agents',
      'Custom reporting & SLAs',
      'Dedicated CSM',
      'On-prem option',
      'Custom provider agreements',
    ],
    cta: 'Contact Sales',
    href: 'mailto:sales@routeiq.com',
    highlight: false,
  },
]

export default function PricingSection() {
  return (
    <section className="bg-[#0f172a] px-6 py-24" id="pricing">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-white">Simple, transparent pricing</h2>
          <p className="text-lg text-slate-400">
            All plans include: 30%+ average savings, circuit breakers, x402 payments, &lt;50ms overhead
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                plan.highlight
                  ? 'border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/10'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-0 right-0 flex justify-center">
                  <span className="rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="mb-1 text-xl font-bold text-white">{plan.name}</h3>
                <p className="mb-4 text-sm text-slate-400">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period && (
                    <span className="text-slate-400">{plan.period}</span>
                  )}
                </div>
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <span className="text-emerald-400">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block rounded-lg py-3 text-center text-sm font-semibold transition-all ${
                  plan.highlight
                    ? 'bg-blue-600 text-white hover:bg-blue-500'
                    : 'border border-white/20 bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
