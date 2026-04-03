'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, type TooltipProps } from 'recharts'
import { formatCurrency } from '@/lib/utils/formatCurrency'

interface ProviderData {
  name: string
  value: number
  requests: number
  costPer1M: number
  avgLatency: number
  color: string
}

const PROVIDER_DATA: ProviderData[] = [
  {
    name: 'OpenAI',
    value: 45,
    requests: 45_230,
    costPer1M: 5.00,
    avgLatency: 312,
    color: '#10b981',
  },
  {
    name: 'Anthropic',
    value: 25,
    requests: 25_120,
    costPer1M: 3.00,
    avgLatency: 428,
    color: '#3b82f6',
  },
  {
    name: 'Gemini',
    value: 20,
    requests: 20_100,
    costPer1M: 3.50,
    avgLatency: 298,
    color: '#f59e0b',
  },
  {
    name: 'Mistral',
    value: 10,
    requests: 10_050,
    costPer1M: 4.00,
    avgLatency: 356,
    color: '#a78bfa',
  },
]

const totalRequests = PROVIDER_DATA.reduce((sum, d) => sum + d.requests, 0)

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload as ProviderData

  return (
    <div className="bg-slate-800 border border-white/20 rounded-xl p-3 shadow-xl text-xs space-y-1.5">
      <p className="text-white font-semibold">{data.name}</p>
      <p className="text-slate-300">Share: <span className="text-white">{data.value}%</span></p>
      <p className="text-slate-300">Requests: <span className="text-white">{data.requests.toLocaleString()}</span></p>
      <p className="text-slate-300">Cost/1M tokens: <span className="text-white">{formatCurrency(data.costPer1M)}</span></p>
      <p className="text-slate-300">Avg latency: <span className="text-white">{data.avgLatency}ms</span></p>
    </div>
  )
}

export function ProviderDonutChart() {
  // Calculate savings vs GPT-4 only
  const gpt4OnlyCost = totalRequests * (5.00 / 1_000_000) * 500 // avg 500 tokens/request
  const actualCost = PROVIDER_DATA.reduce(
    (sum, d) => sum + (d.requests * (d.costPer1M / 1_000_000) * 500),
    0
  )
  const savings = gpt4OnlyCost - actualCost
  const savingsPct = Math.round((savings / gpt4OnlyCost) * 100)

  return (
    <div className="bg-slate-900 border border-white/10 rounded-xl p-6 h-full">
      <h3 className="text-slate-300 text-sm font-medium mb-4">Provider Distribution</h3>

      <div className="relative h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={PROVIDER_DATA}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              isAnimationActive={true}
              animationDuration={800}
            >
              {PROVIDER_DATA.map((entry, index) => (
                <Cell key={index} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-white font-bold text-lg">{(totalRequests / 1000).toFixed(0)}K</p>
          <p className="text-slate-500 text-xs">requests</p>
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {PROVIDER_DATA.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
            <span className="text-slate-400 text-xs">{d.name}</span>
            <span className="text-slate-300 text-xs ml-auto">{d.value}%</span>
          </div>
        ))}
      </div>

      {/* Savings vs GPT-4 */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-xs">Savings vs. GPT-4 only</span>
          <span className="text-routeiq-green text-xs font-semibold">
            +{savingsPct}% / {formatCurrency(savings)}
          </span>
        </div>
      </div>
    </div>
  )
}
