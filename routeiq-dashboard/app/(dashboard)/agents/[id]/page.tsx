import { BudgetProgressBar } from '@/components/agents/BudgetProgressBar'
import { RoutingDecisionLog } from '@/components/agents/RoutingDecisionLog'
import { CostTimelineChart } from '@/components/dashboard/CostTimelineChart'
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const MOCK_AGENT = {
  id: 'agt_01h9x2k3m4n5p6q7',
  name: 'Customer Support Bot',
  api_key_prefix: 'riq_cs',
  daily_budget_usd: 50,
  quality_tier: 'standard',
  is_active: true,
  spend_today_usd: 23.45,
  requests_today: 1843,
  total_spend_usd: 1_234.56,
  total_requests: 45_231,
  avg_latency_ms: 342,
  cache_hit_rate: 0.28,
}

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  const agent = { ...MOCK_AGENT, id: params.id }
  const budgetPercent = (agent.spend_today_usd / agent.daily_budget_usd) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/agents"
          className="inline-flex items-center gap-1 text-slate-400 hover:text-white text-sm mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Agents
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
          {agent.is_active ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-routeiq-green/20 text-routeiq-green text-xs font-medium">
              <CheckCircle className="w-3 h-3" />
              Active
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-routeiq-red/20 text-routeiq-red text-xs font-medium">
              <XCircle className="w-3 h-3" />
              Inactive
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-mono">
            {agent.api_key_prefix}_••••••••
          </span>
        </div>
        <p className="text-slate-400 text-sm mt-1">Agent ID: {agent.id}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-white/10 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">Total Spend</p>
          <p className="text-white font-bold text-xl">${agent.total_spend_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-slate-900 border border-white/10 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">Total Requests</p>
          <p className="text-white font-bold text-xl">{agent.total_requests.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900 border border-white/10 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">Avg Latency</p>
          <p className="text-white font-bold text-xl">{agent.avg_latency_ms}ms</p>
        </div>
        <div className="bg-slate-900 border border-white/10 rounded-xl p-4">
          <p className="text-slate-400 text-xs mb-1">Cache Hit Rate</p>
          <p className="text-white font-bold text-xl">{Math.round(agent.cache_hit_rate * 100)}%</p>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Daily Budget</h2>
          <span className="text-slate-400 text-sm">
            ${agent.spend_today_usd.toFixed(2)} / ${agent.daily_budget_usd.toFixed(2)}
          </span>
        </div>
        <BudgetProgressBar percent={budgetPercent} />
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>{Math.round(budgetPercent)}% used today</span>
          <span>${(agent.daily_budget_usd - agent.spend_today_usd).toFixed(2)} remaining</span>
        </div>
      </div>

      {/* Cost Timeline */}
      <CostTimelineChart agentId={agent.id} />

      {/* Routing Decision Log */}
      <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Routing Decision Log</h2>
        <RoutingDecisionLog agentId={agent.id} />
      </div>
    </div>
  )
}
