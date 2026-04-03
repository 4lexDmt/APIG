'use client'

import { cn } from '@/lib/utils/cn'

interface BudgetProgressBarProps {
  percent: number
  showLabel?: boolean
  height?: 'sm' | 'md' | 'lg'
}

function getBarColor(percent: number): string {
  if (percent < 60) return 'bg-routeiq-green'
  if (percent < 85) return 'bg-routeiq-amber'
  return 'bg-routeiq-red'
}

function getGlowColor(percent: number): string {
  if (percent < 60) return 'shadow-[0_0_8px_rgba(16,185,129,0.4)]'
  if (percent < 85) return 'shadow-[0_0_8px_rgba(245,158,11,0.4)]'
  return 'shadow-[0_0_8px_rgba(239,68,68,0.4)]'
}

const HEIGHT_CLASSES = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
}

export function BudgetProgressBar({
  percent,
  showLabel = false,
  height = 'md',
}: BudgetProgressBarProps) {
  const clampedPercent = Math.min(Math.max(percent, 0), 100)
  const barColor = getBarColor(clampedPercent)
  const glow = getGlowColor(clampedPercent)

  return (
    <div className="w-full">
      <div className={cn('w-full bg-slate-800 rounded-full overflow-hidden', HEIGHT_CLASSES[height])}>
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', barColor, glow)}
          style={{ width: `${clampedPercent}%` }}
          role="progressbar"
          aria-valuenow={clampedPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-xs text-slate-500">
          <span>0%</span>
          <span className={percent >= 85 ? 'text-routeiq-red' : 'text-slate-400'}>
            {Math.round(clampedPercent)}%
          </span>
          <span>100%</span>
        </div>
      )}
    </div>
  )
}
