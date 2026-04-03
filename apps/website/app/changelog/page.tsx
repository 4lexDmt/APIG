import type { Metadata } from 'next'
import Footer from '@/components/sections/Footer'

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'RouteIQ product changelog — what we shipped and when.',
}

const ENTRIES = [
  {
    version: 'v0.1.0',
    date: 'April 2, 2026',
    tag: 'Launch',
    tagColor: 'bg-emerald-500/10 text-emerald-400',
    changes: [
      {
        type: 'feat',
        text: 'OpenAI-compatible /v1/chat/completions endpoint with full pass-through',
      },
      { type: 'feat', text: 'API key authentication with Redis-backed validation' },
      { type: 'feat', text: 'Sliding window rate limiting (60 req/min, 1000 req/hour per agent)' },
      { type: 'feat', text: 'SSE streaming support — chunks proxied with <5ms added latency' },
      {
        type: 'feat',
        text: 'Developer dashboard: overview, agent management, onboarding wizard',
      },
      { type: 'feat', text: 'Real-time spend meter with WebSocket feed' },
      { type: 'feat', text: 'Per-request cost logging to PostgreSQL' },
      {
        type: 'feat',
        text: 'Health and readiness endpoints (/health, /ready) for Kubernetes',
      },
      { type: 'feat', text: 'OpenTelemetry tracing with OTLP export' },
      { type: 'feat', text: 'Docker multi-stage build — final image 47MB on alpine:3.19' },
    ],
    coming: [
      'Multi-provider routing (Anthropic, Gemini, Mistral, Groq) — Sprint 2',
      'Per-agent budget enforcement — Sprint 3',
      'Circuit breakers for runaway agents — Sprint 3',
      'x402 USDC micropayments on Base L2 — Sprint 4',
    ],
  },
]

const TYPE_COLORS: Record<string, string> = {
  feat: 'bg-blue-500/10 text-blue-400',
  fix: 'bg-red-500/10 text-red-400',
  chore: 'bg-slate-500/10 text-slate-400',
}

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-[#0f172a]">
      <div className="border-b border-white/10 px-6 py-16 text-center">
        <h1 className="mb-4 text-5xl font-bold text-white">Changelog</h1>
        <p className="text-xl text-slate-400">Every change, documented.</p>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-16">
        {ENTRIES.map((entry) => (
          <div key={entry.version} className="relative pl-8">
            {/* Timeline dot */}
            <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-blue-500 bg-blue-500/30" />
            {/* Timeline line */}
            <div className="absolute bottom-0 left-[5px] top-6 w-px bg-white/10" />

            <div className="mb-12">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className="text-xl font-bold text-white">{entry.version}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${entry.tagColor}`}>
                  {entry.tag}
                </span>
                <span className="text-sm text-slate-500">{entry.date}</span>
              </div>

              <div className="mb-6 space-y-2">
                {entry.changes.map((change, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 rounded px-1.5 py-0.5 font-mono text-xs ${TYPE_COLORS[change.type] ?? TYPE_COLORS.chore}`}
                    >
                      {change.type}
                    </span>
                    <span className="text-sm text-slate-300">{change.text}</span>
                  </div>
                ))}
              </div>

              {entry.coming.length > 0 && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Coming soon
                  </p>
                  <ul className="space-y-1.5">
                    {entry.coming.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-400">
                        <span className="text-slate-600">○</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </main>
  )
}
