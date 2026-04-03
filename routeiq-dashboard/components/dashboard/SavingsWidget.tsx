import { TrendingDown, Zap } from 'lucide-react'
import { formatCurrency, formatTokens } from '@/lib/utils/formatCurrency'

interface SavingsWidgetProps {
  savedAmount: number
  totalTokensProcessed: number
  percentageSaved: number
}

export function SavingsWidget({
  savedAmount,
  totalTokensProcessed,
  percentageSaved,
}: SavingsWidgetProps) {
  return (
    <div className="bg-slate-900 border border-white/10 rounded-xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-slate-300 text-sm font-medium">Savings This Month</h3>
        <div className="w-8 h-8 rounded-lg bg-routeiq-green/20 flex items-center justify-center">
          <TrendingDown className="w-4 h-4 text-routeiq-green" />
        </div>
      </div>

      {/* Main savings number */}
      <div>
        <p className="text-routeiq-green font-bold text-3xl">
          +{formatCurrency(savedAmount)}
        </p>
        <p className="text-slate-400 text-sm mt-1">
          vs. GPT-4o only routing
        </p>
      </div>

      {/* Percentage badge */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-routeiq-green/20 text-routeiq-green text-sm font-semibold">
          <TrendingDown className="w-3.5 h-3.5" />
          {percentageSaved}% cheaper
        </span>
      </div>

      {/* Token stats */}
      <div className="pt-3 border-t border-white/10 flex items-center gap-2">
        <Zap className="w-3.5 h-3.5 text-routeiq-amber shrink-0" />
        <div>
          <span className="text-white font-semibold text-sm">{formatTokens(totalTokensProcessed)}</span>
          <span className="text-slate-400 text-sm"> tokens processed</span>
        </div>
      </div>

      {/* Mini bar comparison */}
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Without RouteIQ</span>
            <span className="text-slate-300">{formatCurrency(savedAmount + 342.18)}</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full">
            <div className="h-full bg-red-500/60 rounded-full w-full" />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>With RouteIQ</span>
            <span className="text-routeiq-green">{formatCurrency(342.18)}</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full">
            <div
              className="h-full bg-routeiq-green rounded-full transition-all"
              style={{ width: `${100 - percentageSaved}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
