'use client'

import { useRef, useState, useMemo } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ChevronDown, ChevronRight, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils/formatCurrency'

interface RoutingDecision {
  id: string
  timestamp: Date
  agentId: string
  provider: string
  model: string
  inputTokens: number
  outputTokens: number
  cost: number
  latencyMs: number
  cached: boolean
  reasonCode: string
  alternatives: Array<{
    provider: string
    model: string
    estimatedCost: number
    reason: string
  }>
}

const PROVIDERS = ['OpenAI', 'Anthropic', 'Google', 'Mistral', 'Groq']
const MODELS: Record<string, string[]> = {
  OpenAI: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
  Anthropic: ['claude-3-5-sonnet', 'claude-3-haiku'],
  Google: ['gemini-1.5-pro', 'gemini-1.5-flash'],
  Mistral: ['mistral-large', 'mistral-7b'],
  Groq: ['llama-3.1-70b'],
}
const REASON_CODES = [
  'COST_OPTIMIZED',
  'LATENCY_OPTIMIZED',
  'QUALITY_TIER_MATCH',
  'CACHE_HIT',
  'FALLBACK_PROVIDER',
  'BUDGET_CONSTRAINT',
]

function generateMockDecisions(count: number): RoutingDecision[] {
  return Array.from({ length: count }, (_, i) => {
    const provider = PROVIDERS[Math.floor(Math.random() * PROVIDERS.length)]
    const models = MODELS[provider] ?? ['unknown']
    const model = models[Math.floor(Math.random() * models.length)]
    const inputTokens = Math.floor(100 + Math.random() * 2000)
    const outputTokens = Math.floor(50 + Math.random() * 800)
    const cost = (inputTokens * 0.000003 + outputTokens * 0.000012) * (1 + Math.random())
    const cached = Math.random() < 0.25

    const altProviders = PROVIDERS.filter((p) => p !== provider).slice(0, 2)

    return {
      id: `req_${i.toString().padStart(4, '0')}`,
      timestamp: new Date(Date.now() - i * 12000 - Math.random() * 5000),
      agentId: 'agt_01h9x2k3m4n5p6q7',
      provider,
      model,
      inputTokens,
      outputTokens,
      cost,
      latencyMs: Math.floor(80 + Math.random() * 700),
      cached,
      reasonCode: REASON_CODES[Math.floor(Math.random() * REASON_CODES.length)],
      alternatives: altProviders.map((p) => ({
        provider: p,
        model: (MODELS[p] ?? ['unknown'])[0],
        estimatedCost: cost * (1.2 + Math.random() * 0.8),
        reason: 'Higher cost for equivalent quality',
      })),
    }
  })
}

const PROVIDER_BADGE_COLORS: Record<string, string> = {
  OpenAI: 'bg-emerald-500/20 text-emerald-400',
  Anthropic: 'bg-orange-500/20 text-orange-400',
  Google: 'bg-blue-500/20 text-blue-400',
  Mistral: 'bg-violet-500/20 text-violet-400',
  Groq: 'bg-yellow-500/20 text-yellow-400',
}

interface RoutingDecisionLogProps {
  agentId?: string
}

export function RoutingDecisionLog({ agentId: _agentId }: RoutingDecisionLogProps) {
  const allDecisions = useMemo(() => generateMockDecisions(50), [])
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [filterProvider, setFilterProvider] = useState<string>('all')
  const [showFilter, setShowFilter] = useState(false)

  const filtered = useMemo(
    () =>
      filterProvider === 'all'
        ? allDecisions
        : allDecisions.filter((d) => d.provider === filterProvider),
    [allDecisions, filterProvider]
  )

  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const row = filtered[index]
      return expandedRow === row.id ? 160 : 48
    },
    overscan: 5,
  })

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs px-3 py-1.5 bg-slate-800 rounded-lg transition-colors"
        >
          <Filter className="w-3.5 h-3.5" />
          Filter
        </button>
        {showFilter && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {['all', ...PROVIDERS].map((p) => (
              <button
                key={p}
                onClick={() => setFilterProvider(p)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  filterProvider === p
                    ? 'bg-routeiq-blue text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {p === 'all' ? 'All Providers' : p}
              </button>
            ))}
          </div>
        )}
        <span className="ml-auto text-slate-500 text-xs">{filtered.length} decisions</span>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[24px_120px_80px_120px_80px_70px_70px_70px_50px] gap-2 px-3 py-2 bg-slate-800 rounded-lg text-xs text-slate-400 font-medium">
        <div />
        <div>Timestamp</div>
        <div>Provider</div>
        <div>Model</div>
        <div className="text-right">In Tokens</div>
        <div className="text-right">Out</div>
        <div className="text-right">Cost</div>
        <div className="text-right">Latency</div>
        <div className="text-center">Cache</div>
      </div>

      {/* Virtualized rows */}
      <div
        ref={parentRef}
        className="overflow-y-auto rounded-lg border border-white/10"
        style={{ height: '400px' }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const decision = filtered[virtualItem.index]
            const isExpanded = expandedRow === decision.id

            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualItem.start}px)`,
                }}
                className="border-b border-white/5 last:border-0"
              >
                <div
                  className="grid grid-cols-[24px_120px_80px_120px_80px_70px_70px_70px_50px] gap-2 px-3 py-2.5 items-center hover:bg-white/5 cursor-pointer transition-colors text-xs"
                  onClick={() => setExpandedRow(isExpanded ? null : decision.id)}
                >
                  <div className="text-slate-500">
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="text-slate-400 truncate">
                    {format(decision.timestamp, 'HH:mm:ss')}
                  </div>
                  <div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs ${
                        PROVIDER_BADGE_COLORS[decision.provider] ?? 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {decision.provider}
                    </span>
                  </div>
                  <div className="text-slate-300 truncate font-mono">{decision.model}</div>
                  <div className="text-right text-slate-300">{decision.inputTokens.toLocaleString()}</div>
                  <div className="text-right text-slate-300">{decision.outputTokens.toLocaleString()}</div>
                  <div className="text-right text-white font-mono">{formatCurrency(decision.cost)}</div>
                  <div className="text-right text-slate-300">{decision.latencyMs}ms</div>
                  <div className="text-center">
                    {decision.cached ? (
                      <span className="text-routeiq-green text-xs">HIT</span>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-10 pb-3 space-y-2">
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-500">Reason:</span>
                      <span className="px-2 py-0.5 bg-slate-800 text-routeiq-blue rounded font-mono">
                        {decision.reasonCode}
                      </span>
                      <span className="text-slate-500">Request ID:</span>
                      <span className="font-mono text-slate-400">{decision.id}</span>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs mb-1">Alternatives considered:</p>
                      <div className="space-y-1">
                        {decision.alternatives.map((alt, i) => (
                          <div key={i} className="flex items-center gap-3 text-xs text-slate-400">
                            <span
                              className={`px-1.5 py-0.5 rounded ${
                                PROVIDER_BADGE_COLORS[alt.provider] ?? 'bg-slate-700 text-slate-300'
                              }`}
                            >
                              {alt.provider}
                            </span>
                            <span className="font-mono">{alt.model}</span>
                            <span className="text-slate-500">est. {formatCurrency(alt.estimatedCost)}</span>
                            <span className="text-slate-600">{alt.reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
