'use client'

import { useState } from 'react'
import { CostTimelineChart } from '@/components/dashboard/CostTimelineChart'
import { ProviderDonutChart } from '@/components/dashboard/ProviderDonutChart'
import { formatCurrency } from '@/lib/utils/formatCurrency'

const DATE_RANGES = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
]

const PROVIDER_STATS = [
  { provider: 'OpenAI', requests: 45230, cost: 234.12, avgLatency: 312, savingsVsAlways: 0 },
  { provider: 'Anthropic', requests: 28450, cost: 156.78, avgLatency: 428, savingsVsAlways: 67.34 },
  { provider: 'Google Gemini', requests: 19820, cost: 89.45, avgLatency: 298, savingsVsAlways: 144.67 },
  { provider: 'Mistral', requests: 11200, cost: 34.56, avgLatency: 201, savingsVsAlways: 199.56 },
]

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState(30)

  const totalCost = PROVIDER_STATS.reduce((sum, p) => sum + p.cost, 0)
  const totalRequests = PROVIDER_STATS.reduce((sum, p) => sum + p.requests, 0)
  const totalSavings = PROVIDER_STATS.reduce((sum, p) => sum + p.savingsVsAlways, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">Deep dive into your AI cost performance</p>
        </div>
        <div className="flex gap-1 bg-slate-900 border border-white/10 rounded-lg p-1">
          {DATE_RANGES.map((range) => (
            <button
              key={range.days}
              onClick={() => setSelectedRange(range.days)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                selectedRange === range.days
                  ? 'bg-routeiq-blue text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
          <p className="text-slate-400 text-sm mb-1">Total Spend (Period)</p>
          <p className="text-white font-bold text-2xl">{formatCurrency(totalCost)}</p>
          <p className="text-slate-500 text-xs mt-1">Last {selectedRange} days</p>
        </div>
        <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
          <p className="text-slate-400 text-sm mb-1">Total Requests</p>
          <p className="text-white font-bold text-2xl">{totalRequests.toLocaleString()}</p>
          <p className="text-slate-500 text-xs mt-1">{Math.round(totalRequests / selectedRange).toLocaleString()} req/day avg</p>
        </div>
        <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
          <p className="text-slate-400 text-sm mb-1">Savings vs GPT-4 Only</p>
          <p className="text-routeiq-green font-bold text-2xl">+{formatCurrency(totalSavings)}</p>
          <p className="text-slate-500 text-xs mt-1">{Math.round((totalSavings / (totalCost + totalSavings)) * 100)}% reduction</p>
        </div>
      </div>

      {/* Cost trend chart */}
      <CostTimelineChart days={selectedRange} />

      {/* Provider breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProviderDonutChart />
        <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Provider Breakdown</h2>
          <div className="space-y-3">
            {PROVIDER_STATS.map((stat) => (
              <div key={stat.provider} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-white text-sm font-medium">{stat.provider}</p>
                  <p className="text-slate-500 text-xs">{stat.requests.toLocaleString()} requests · {stat.avgLatency}ms avg</p>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm font-medium">{formatCurrency(stat.cost)}</p>
                  {stat.savingsVsAlways > 0 && (
                    <p className="text-routeiq-green text-xs">Saved {formatCurrency(stat.savingsVsAlways)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
