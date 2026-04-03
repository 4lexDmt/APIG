'use client'

import { useMemo } from 'react'

export interface BudgetStatus {
  usedPct: number
  color: 'green' | 'amber' | 'red'
  isWarning: boolean
  isCritical: boolean
  remaining: number
}

/**
 * Derives budget status and color thresholds from spend/limit values.
 */
export function useAgentBudget(currentSpend: number, budgetLimit: number): BudgetStatus {
  return useMemo(() => {
    const usedPct = budgetLimit > 0 ? (currentSpend / budgetLimit) * 100 : 0
    const remaining = Math.max(0, budgetLimit - currentSpend)

    let color: 'green' | 'amber' | 'red' = 'green'
    if (usedPct >= 80) color = 'red'
    else if (usedPct >= 60) color = 'amber'

    return {
      usedPct,
      color,
      isWarning: usedPct >= 60,
      isCritical: usedPct >= 80,
      remaining,
    }
  }, [currentSpend, budgetLimit])
}
