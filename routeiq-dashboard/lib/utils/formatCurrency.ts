/**
 * Formats a USD amount for display, with appropriate precision for micro-amounts.
 */
export function formatCurrency(amount: number): string {
  if (amount === 0) return '$0.00'
  if (amount < 0.0001) return `$${amount.toFixed(8)}`
  if (amount < 0.01) return `$${amount.toFixed(6)}`
  if (amount < 1) return `$${amount.toFixed(4)}`
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formats a token count with K/M suffixes.
 */
export function formatTokens(count: number): string {
  if (count >= 1_000_000_000) return `${(count / 1_000_000_000).toFixed(1)}B`
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`
  return count.toLocaleString()
}

/**
 * Formats a cost per 1M tokens for pricing tables.
 */
export function formatCostPer1M(costPer1kTokens: number): string {
  return formatCurrency(costPer1kTokens * 1000)
}

/**
 * Formats latency in milliseconds.
 */
export function formatLatency(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}
