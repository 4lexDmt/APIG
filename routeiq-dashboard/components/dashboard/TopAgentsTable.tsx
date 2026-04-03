import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatCurrency'

interface AgentRow {
  id: string
  name: string
  requests: number
  totalCost: number
  avgLatencyMs: number
  budgetUsedPct: number
  qualityTier: string
}

const TOP_AGENTS: AgentRow[] = [
  {
    id: 'agt_01h9x2k3m4n5p6q7',
    name: 'Customer Support Bot',
    requests: 1843,
    totalCost: 23.45,
    avgLatencyMs: 321,
    budgetUsedPct: 47,
    qualityTier: 'standard',
  },
  {
    id: 'agt_02h9x2k3m4n5p6q8',
    name: 'Research Assistant',
    requests: 312,
    totalCost: 87.12,
    avgLatencyMs: 612,
    budgetUsedPct: 44,
    qualityTier: 'premium',
  },
  {
    id: 'agt_03h9x2k3m4n5p6q9',
    name: 'Code Review Agent',
    requests: 567,
    totalCost: 45.67,
    avgLatencyMs: 489,
    budgetUsedPct: 46,
    qualityTier: 'premium',
  },
  {
    id: 'agt_05h9x2k3m4n5p6r1',
    name: 'Document Summarizer',
    requests: 2901,
    totalCost: 18.32,
    avgLatencyMs: 198,
    budgetUsedPct: 73,
    qualityTier: 'economy',
  },
  {
    id: 'agt_06h9x2k3m4n5p6r2',
    name: 'SQL Query Generator',
    requests: 421,
    totalCost: 11.78,
    avgLatencyMs: 287,
    budgetUsedPct: 24,
    qualityTier: 'standard',
  },
]

const TIER_COLORS: Record<string, string> = {
  economy: 'text-routeiq-green bg-routeiq-green/20',
  standard: 'text-routeiq-blue bg-routeiq-blue/20',
  premium: 'text-purple-400 bg-purple-500/20',
}

function BudgetBar({ percent }: { percent: number }) {
  const color =
    percent < 60 ? 'bg-routeiq-green' : percent < 85 ? 'bg-routeiq-amber' : 'bg-routeiq-red'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-slate-400 text-xs w-8 text-right">{percent}%</span>
    </div>
  )
}

export function TopAgentsTable() {
  return (
    <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-white font-semibold">Top Agents by Spend</h3>
        <Link
          href="/agents"
          className="flex items-center gap-1 text-routeiq-blue hover:text-blue-400 text-xs transition-colors"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-slate-400 font-medium px-6 py-3">Agent Name</th>
              <th className="text-right text-slate-400 font-medium px-4 py-3">Requests</th>
              <th className="text-right text-slate-400 font-medium px-4 py-3">Total Cost</th>
              <th className="text-right text-slate-400 font-medium px-4 py-3">Avg Latency</th>
              <th className="text-slate-400 font-medium px-4 py-3 w-32">Budget Used</th>
              <th className="text-center text-slate-400 font-medium px-4 py-3">Tier</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {TOP_AGENTS.map((agent) => (
              <tr key={agent.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-white font-medium">{agent.name}</span>
                </td>
                <td className="px-4 py-4 text-right text-slate-300">
                  {agent.requests.toLocaleString()}
                </td>
                <td className="px-4 py-4 text-right text-white font-medium">
                  {formatCurrency(agent.totalCost)}
                </td>
                <td className="px-4 py-4 text-right text-slate-300">{agent.avgLatencyMs}ms</td>
                <td className="px-4 py-4 w-32">
                  <BudgetBar percent={agent.budgetUsedPct} />
                </td>
                <td className="px-4 py-4 text-center">
                  <span className={`px-2 py-0.5 rounded text-xs ${TIER_COLORS[agent.qualityTier]}`}>
                    {agent.qualityTier}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/agents/${agent.id}`}
                    className="text-slate-500 hover:text-routeiq-blue transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
