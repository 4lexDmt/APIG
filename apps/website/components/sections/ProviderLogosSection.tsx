const PROVIDERS = [
  { name: 'OpenAI', color: '#10a37f' },
  { name: 'Anthropic', color: '#d97706' },
  { name: 'Google', color: '#4285f4' },
  { name: 'Mistral', color: '#7c3aed' },
  { name: 'Groq', color: '#f97316' },
]

export default function ProviderLogosSection() {
  return (
    <section className="bg-[#0f172a] px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <p className="mb-10 text-center text-sm font-medium uppercase tracking-widest text-slate-500">
          Powered by the best providers
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {PROVIDERS.map((provider) => (
            <div
              key={provider.name}
              className="group flex h-14 w-36 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 transition-all hover:border-white/20 hover:bg-white/10"
            >
              <span
                className="text-base font-semibold text-slate-500 transition-colors group-hover:text-white"
                style={{ '--provider-color': provider.color } as React.CSSProperties}
              >
                {provider.name}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-slate-600">
          More providers added every sprint — Cohere, Together AI, Fireworks coming in Q3 2026
        </p>
      </div>
    </section>
  )
}
