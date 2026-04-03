'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils/formatCurrency'

interface SpendMeterProps {
  currentSpend: number
  budgetLimit: number
}

function getColor(percent: number): string {
  if (percent < 60) return '#10b981' // green
  if (percent < 85) return '#f59e0b' // amber
  return '#ef4444' // red
}

export function SpendMeter({ currentSpend, budgetLimit }: SpendMeterProps) {
  const [spend, setSpend] = useState(currentSpend)
  const [isConnected, setIsConnected] = useState(false)

  // Simulate WebSocket live updates
  useEffect(() => {
    // Simulate connection after a short delay
    const connectTimer = setTimeout(() => setIsConnected(true), 800)

    // Simulate live spend increments
    const interval = setInterval(() => {
      setSpend((prev) => {
        const increment = Math.random() * 0.05
        return Math.min(prev + increment, budgetLimit)
      })
    }, 3000)

    return () => {
      clearTimeout(connectTimer)
      clearInterval(interval)
    }
  }, [budgetLimit])

  const percent = Math.min((spend / budgetLimit) * 100, 100)
  const strokeColor = getColor(percent)

  // SVG gauge params
  const radius = 80
  const cx = 100
  const cy = 100
  const circumference = 2 * Math.PI * radius
  // 270 degrees arc (3/4 circle), starting from 135deg to 45deg
  const arcLength = circumference * 0.75
  const dashOffset = arcLength - (percent / 100) * arcLength

  return (
    <div className="bg-slate-900 border border-white/10 rounded-xl p-6 flex flex-col items-center">
      <div className="flex items-center justify-between w-full mb-4">
        <h3 className="text-slate-300 text-sm font-medium">Monthly Spend</h3>
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-routeiq-green animate-pulse-dot' : 'bg-slate-600'}`}
          />
          <span className={`text-xs ${isConnected ? 'text-routeiq-green' : 'text-slate-600'}`}>
            {isConnected ? 'LIVE' : 'CONNECTING'}
          </span>
        </div>
      </div>

      <div className="relative">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Background track arc */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth="14"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform="rotate(135, 100, 100)"
          />
          {/* Filled arc */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="14"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(135, 100, 100)"
            className="gauge-arc"
            style={{ filter: `drop-shadow(0 0 6px ${strokeColor}80)` }}
          />

          {/* Center text */}
          <text x={cx} y={cy - 10} textAnchor="middle" fill="white" fontSize="22" fontWeight="700">
            {formatCurrency(spend)}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" fill="#94a3b8" fontSize="11">
            of {formatCurrency(budgetLimit)}
          </text>
          <text x={cx} y={cy + 32} textAnchor="middle" fill={strokeColor} fontSize="13" fontWeight="600">
            {percent.toFixed(1)}%
          </text>
        </svg>
      </div>

      {/* Footer */}
      <div className="w-full mt-2 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-routeiq-green text-xs font-semibold">$0</p>
          <p className="text-slate-600 text-xs">Start</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs">{Math.round(percent)}% used</p>
          <p className="text-slate-600 text-xs">of budget</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs font-semibold">{formatCurrency(budgetLimit)}</p>
          <p className="text-slate-600 text-xs">Limit</p>
        </div>
      </div>
    </div>
  )
}
