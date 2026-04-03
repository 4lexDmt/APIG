import { CheckCircle, Zap, DollarSign } from 'lucide-react'

interface ProviderModel {
  provider: string
  model: string
  inputPer1M: number
  outputPer1M: number
  contextWindow: string
  avgLatencyMs: number
  isAvailable: boolean
  tier: 'economy' | 'standard' | 'premium'
}

const PROVIDER_MODELS: ProviderModel[] = [
  {
    provider: 'OpenAI',
    model: 'GPT-4o',
    inputPer1M: 5.00,
    outputPer1M: 15.00,
    contextWindow: '128K',
    avgLatencyMs: 312,
    isAvailable: true,
    tier: 'premium',
  },
  {
    provider: 'OpenAI',
    model: 'GPT-4o Mini',
    inputPer1M: 0.15,
    outputPer1M: 0.60,
    contextWindow: '128K',
    avgLatencyMs: 198,
    isAvailable: true,
    tier: 'standard',
  },
  {
    provider: 'OpenAI',
    model: 'GPT-3.5 Turbo',
    inputPer1M: 0.50,
    outputPer1M: 1.50,
    contextWindow: '16K',
    avgLatencyMs: 221,
    isAvailable: true,
    tier: 'economy',
  },
  {
    provider: 'Anthropic',
    model: 'Claude 3.5 Sonnet',
    inputPer1M: 3.00,
    outputPer1M: 15.00,
    contextWindow: '200K',
    avgLatencyMs: 428,
    isAvailable: true,
    tier: 'premium',
  },
  {
    provider: 'Anthropic',
    model: 'Claude 3 Haiku',
    inputPer1M: 0.25,
    outputPer1M: 1.25,
    contextWindow: '200K',
    avgLatencyMs: 187,
    isAvailable: true,
    tier: 'economy',
  },
  {
    provider: 'Google',
    model: 'Gemini 1.5 Pro',
    inputPer1M: 3.50,
    outputPer1M: 10.50,
    contextWindow: '1M',
    avgLatencyMs: 298,
    isAvailable: true,
    tier: 'premium',
  },
  {
    provider: 'Google',
    model: 'Gemini 1.5 Flash',
    inputPer1M: 0.075,
    outputPer1M: 0.30,
    contextWindow: '1M',
    avgLatencyMs: 143,
    isAvailable: true,
    tier: 'economy',
  },
  {
    provider: 'Mistral',
    model: 'Mistral Large',
    inputPer1M: 4.00,
    outputPer1M: 12.00,
    contextWindow: '32K',
    avgLatencyMs: 356,
    isAvailable: true,
    tier: 'premium',
  },
  {
    provider: 'Mistral',
    model: 'Mistral 7B Instruct',
    inputPer1M: 0.25,
    outputPer1M: 0.25,
    contextWindow: '32K',
    avgLatencyMs: 156,
    isAvailable: true,
    tier: 'economy',
  },
  {
    provider: 'Groq',
    model: 'Llama 3.1 70B',
    inputPer1M: 0.59,
    outputPer1M: 0.79,
    contextWindow: '128K',
    avgLatencyMs: 89,
    isAvailable: true,
    tier: 'standard',
  },
]

const TIER_COLORS: Record<string, string> = {
  economy: 'bg-routeiq-green/20 text-routeiq-green',
  standard: 'bg-routeiq-blue/20 text-routeiq-blue',
  premium: 'bg-purple-500/20 text-purple-400',
}

const PROVIDER_COLORS: Record<string, string> = {
  OpenAI: 'bg-emerald-500/20 text-emerald-400',
  Anthropic: 'bg-orange-500/20 text-orange-400',
  Google: 'bg-blue-500/20 text-blue-400',
  Mistral: 'bg-violet-500/20 text-violet-400',
  Groq: 'bg-yellow-500/20 text-yellow-400',
}

export default function ProvidersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Providers & Models</h1>
        <p className="text-slate-400 text-sm mt-1">
          RouteIQ automatically selects the best provider based on your quality tier and budget
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-xs bg-routeiq-green/20 text-routeiq-green">Economy</span>
          <span className="text-slate-400">Cost-optimized, good quality</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-xs bg-routeiq-blue/20 text-routeiq-blue">Standard</span>
          <span className="text-slate-400">Balanced cost and quality</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-xs bg-purple-500/20 text-purple-400">Premium</span>
          <span className="text-slate-400">Best quality, higher cost</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-slate-400 font-medium px-6 py-4">Provider</th>
                <th className="text-left text-slate-400 font-medium px-4 py-4">Model</th>
                <th className="text-left text-slate-400 font-medium px-4 py-4">Tier</th>
                <th className="text-right text-slate-400 font-medium px-4 py-4">
                  <span className="flex items-center justify-end gap-1">
                    <DollarSign className="w-3 h-3" /> Input /1M
                  </span>
                </th>
                <th className="text-right text-slate-400 font-medium px-4 py-4">
                  <span className="flex items-center justify-end gap-1">
                    <DollarSign className="w-3 h-3" /> Output /1M
                  </span>
                </th>
                <th className="text-right text-slate-400 font-medium px-4 py-4">Context</th>
                <th className="text-right text-slate-400 font-medium px-4 py-4">
                  <span className="flex items-center justify-end gap-1">
                    <Zap className="w-3 h-3" /> Latency
                  </span>
                </th>
                <th className="text-center text-slate-400 font-medium px-4 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {PROVIDER_MODELS.map((model, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        PROVIDER_COLORS[model.provider] ?? 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {model.provider}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-white font-medium">{model.model}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-0.5 rounded text-xs ${TIER_COLORS[model.tier]}`}>
                      {model.tier}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right text-white font-mono">
                    ${model.inputPer1M.toFixed(model.inputPer1M < 1 ? 3 : 2)}
                  </td>
                  <td className="px-4 py-4 text-right text-white font-mono">
                    ${model.outputPer1M.toFixed(model.outputPer1M < 1 ? 3 : 2)}
                  </td>
                  <td className="px-4 py-4 text-right text-slate-300">{model.contextWindow}</td>
                  <td className="px-4 py-4 text-right text-slate-300">{model.avgLatencyMs}ms</td>
                  <td className="px-4 py-4 text-center">
                    {model.isAvailable ? (
                      <CheckCircle className="w-4 h-4 text-routeiq-green mx-auto" />
                    ) : (
                      <span className="text-slate-600 text-xs">Offline</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-slate-500 text-xs">
        Prices shown are approximate and may vary. RouteIQ selects the optimal provider in real-time based on
        availability, latency, and your agent&apos;s quality tier.
      </p>
    </div>
  )
}
