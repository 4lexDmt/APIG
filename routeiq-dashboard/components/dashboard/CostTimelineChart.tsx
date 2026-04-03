'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts'
import { format, subDays } from 'date-fns'
import { formatCurrency } from '@/lib/utils/formatCurrency'

interface DailyData {
  date: string
  actual: number
  withoutRouteIQ: number
  savings: number
}

function generateMockData(days: number = 30): DailyData[] {
  const data: DailyData[] = []
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i)
    // Realistic daily cost $5-50 range with some variance
    const baseActual = 8 + Math.sin(i * 0.3) * 5 + Math.random() * 20
    const actual = Math.max(5, baseActual)
    // Without RouteIQ: 30-45% more expensive
    const factor = 1.3 + Math.random() * 0.15
    const withoutRouteIQ = actual * factor
    data.push({
      date: format(date, 'MMM d'),
      actual: parseFloat(actual.toFixed(2)),
      withoutRouteIQ: parseFloat(withoutRouteIQ.toFixed(2)),
      savings: parseFloat((withoutRouteIQ - actual).toFixed(2)),
    })
  }
  return data
}

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null

  const actual = payload.find((p) => p.dataKey === 'actual')?.value as number | undefined
  const withoutRouteIQ = payload.find((p) => p.dataKey === 'withoutRouteIQ')?.value as number | undefined
  const savings = withoutRouteIQ !== undefined && actual !== undefined ? withoutRouteIQ - actual : 0

  return (
    <div className="bg-slate-800 border border-white/20 rounded-xl p-3 shadow-xl text-xs space-y-1.5">
      <p className="text-slate-400 font-medium">{label}</p>
      {actual !== undefined && (
        <p className="text-routeiq-blue">
          With RouteIQ: <span className="text-white font-semibold">{formatCurrency(actual)}</span>
        </p>
      )}
      {withoutRouteIQ !== undefined && (
        <p className="text-red-400">
          Without: <span className="text-white font-semibold">{formatCurrency(withoutRouteIQ)}</span>
        </p>
      )}
      <p className="text-routeiq-green border-t border-white/10 pt-1">
        Saved: <span className="font-semibold">{formatCurrency(savings)}</span>
      </p>
    </div>
  )
}

interface CostTimelineChartProps {
  agentId?: string
  days?: number
}

export function CostTimelineChart({ days = 30 }: CostTimelineChartProps) {
  const data = generateMockData(days)

  return (
    <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-white font-semibold">Cost Timeline</h3>
          <p className="text-slate-400 text-xs mt-0.5">Daily spend over the last {days} days</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 bg-routeiq-blue" />
            <span className="text-slate-400">Actual Cost</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 bg-red-500 opacity-70" style={{ borderTop: '2px dashed #ef4444' }} />
            <span className="text-slate-400">Without RouteIQ</span>
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={Math.floor(days / 7)}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `$${v.toFixed(0)}`}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ display: 'none' }}
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#3b82f6' }}
            name="Actual Cost"
          />
          <Line
            type="monotone"
            dataKey="withoutRouteIQ"
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={false}
            activeDot={{ r: 4, fill: '#ef4444' }}
            name="Without RouteIQ"
            opacity={0.7}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
