const COMPANIES = [
  {
    name: 'Nexus Labs',
    description: 'AI research & automation platform',
    quote: 'RouteIQ cut our monthly LLM bill by 34% in the first week. The integration took 5 minutes.',
    role: 'Head of AI Infrastructure',
  },
  {
    name: 'Orbital AI',
    description: 'Enterprise AI workflow automation',
    quote: "The per-agent budget enforcement alone is worth it. We've eliminated surprise bills completely.",
    role: 'CTO',
  },
  {
    name: 'Vertex Systems',
    description: 'Multi-agent research platform',
    quote: 'Running 200+ agents concurrently. RouteIQ handles the routing complexity so we don\'t have to.',
    role: 'Engineering Lead',
  },
]

export default function SocialProofSection() {
  return (
    <section className="bg-slate-900/30 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-slate-500">
            Design Partners
          </p>
          <h2 className="text-4xl font-bold text-white">
            Trusted by forward-thinking AI teams
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {COMPANIES.map((company) => (
            <div
              key={company.name}
              className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20 text-lg font-bold text-blue-400">
                  {company.name[0]}
                </div>
                <div>
                  <div className="font-semibold text-white">{company.name}</div>
                  <div className="text-xs text-slate-500">{company.description}</div>
                </div>
              </div>
              <blockquote className="flex-1 text-sm leading-relaxed text-slate-300">
                &ldquo;{company.quote}&rdquo;
              </blockquote>
              <div className="mt-4 text-xs text-slate-500">— {company.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
