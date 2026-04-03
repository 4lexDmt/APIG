export default function HowItWorksSection() {
  return (
    <section className="bg-slate-900/50 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-white">How it works</h2>
          <p className="text-lg text-slate-400">Three steps from integration to savings</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {/* Step 1 */}
          <div className="relative rounded-2xl border border-white/10 bg-white/5 p-8">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              1
            </div>
            <h3 className="mb-3 text-xl font-semibold text-white">
              Point your agent at RouteIQ
            </h3>
            <p className="mb-6 text-sm text-slate-400">
              Replace the OpenAI base URL with RouteIQ. Your existing API key stays as-is.
            </p>
            <div className="overflow-hidden rounded-lg bg-slate-900 p-4 font-mono text-xs">
              <div className="text-slate-500"># Before</div>
              <div className="text-red-300/70">
                base_url=&quot;api.openai.com/v1&quot;
              </div>
              <div className="mt-3 text-slate-500"># After</div>
              <div className="text-emerald-300">
                base_url=&quot;api.routeiq.com/v1&quot;
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative rounded-2xl border border-white/10 bg-white/5 p-8">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              2
            </div>
            <h3 className="mb-3 text-xl font-semibold text-white">
              We find the cheapest qualified provider
            </h3>
            <p className="mb-6 text-sm text-slate-400">
              RouteIQ evaluates quality, latency, and cost across all providers in real time.
            </p>
            {/* Routing diagram */}
            <div className="flex items-center justify-center gap-2">
              <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-center text-xs text-blue-300">
                Your<br />Agent
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="h-px w-8 bg-blue-500/50" />
                <div className="text-xs text-slate-500">routes</div>
              </div>
              <div className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-center text-xs text-white font-semibold">
                RouteIQ
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="h-px w-8 bg-emerald-500/50" />
                <div className="text-xs text-slate-500">cheapest</div>
              </div>
              <div className="flex flex-col gap-1">
                {['OpenAI', 'Anthropic', 'Gemini'].map((p) => (
                  <div
                    key={p}
                    className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-center text-xs text-slate-300"
                  >
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative rounded-2xl border border-white/10 bg-white/5 p-8">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              3
            </div>
            <h3 className="mb-3 text-xl font-semibold text-white">You keep the savings</h3>
            <p className="mb-6 text-sm text-slate-400">
              See exactly where every dollar goes. Savings flow directly to your account.
            </p>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
              <div className="text-3xl font-bold text-emerald-400">$1,247.50</div>
              <div className="mt-1 text-sm text-emerald-300/70">saved this month</div>
              <div className="mt-2 text-xs text-slate-500">vs. GPT-4o direct</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
