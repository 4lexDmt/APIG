import Link from 'next/link'
import { ArrowRight, CheckCircle, XCircle } from 'lucide-react'
import { BudgetProgressBar } from './BudgetProgressBar'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import type { Agent } from '@/types/api'

interface AgentCardProps {
  agent: Agent
}

export function AgentCard({ agent }: AgentCardProps) {
  const budgetPercent =
    agent.today_spend_usd !== undefined &&
    agent.daily_budget_usd != null &&
    agent.daily_budget_usd > 0
      ? Math.min((agent.today_spend_usd / agent.daily_budget_usd) * 100, 100)
      : 0

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-4 hover:border-white/20 transition-colors group">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-white font-semibold text-sm truncate">{agent.name}</h3>
          <p className="text-slate-500 text-xs font-mono mt-0.5">{agent.api_key_prefix}_••••••••</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {agent.is_active ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-routeiq-green/20 text-routeiq-green text-xs font-medium">
              <CheckCircle className="w-3 h-3" />
              Active
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-medium">
              <XCircle className="w-3 h-3" />
              Inactive
            </span>
          )}
        </div>
      </div>

      {/* Budget */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Daily Budget</span>
          <span className="text-white font-medium">{formatCurrency(agent.daily_budget_usd ?? 0)}</span>
        </div>
        <BudgetProgressBar percent={budgetPercent} />
        <div className="flex justify-between text-xs text-slate-500">
          <span>{Math.round(budgetPercent)}% used today</span>
          <span>{formatCurrency(agent.today_spend_usd ?? 0)} spent</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/50 rounded-lg p-2.5 text-center">
          <p className="text-white font-semibold text-sm">
            {(agent.today_request_count ?? 0).toLocaleString()}
          </p>
          <p className="text-slate-500 text-xs">Requests today</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2.5 text-center">
          <span className="px-1.5 py-0.5 rounded text-xs text-routeiq-blue bg-routeiq-blue/20">
            standard
          </span>
          <p className="text-slate-500 text-xs mt-0.5">Quality tier</p>
        </div>
      </div>

      {/* Footer */}
      <Link
        href={`/agents/${agent.id}`}
        className="flex items-center justify-center gap-2 text-routeiq-blue hover:text-blue-400 text-xs font-medium transition-colors group-hover:gap-3 pt-1 border-t border-white/5"
      >
        View Details
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  )
}
