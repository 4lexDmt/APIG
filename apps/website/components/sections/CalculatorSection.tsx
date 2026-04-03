'use client'

import { useState } from 'react'

export default function CalculatorSection() {
  const [monthlySpend, setMonthlySpend] = useState(5000)
  const savings = monthlySpend * 0.3
  const withRouteIQ = monthlySpend - savings

  const fmt = (n: number): string =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  const barMaxWidth = 300
  const currentBar = barMaxWidth
  const routeIQBar = Math.round(barMaxWidth * (withRouteIQ / monthlySpend))

  return (
    <section className="bg-slate-900/50 px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-white">Calculate your savings</h2>
          <p className="text-lg text-slate-400">Drag the slider to see how much RouteIQ saves you</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          {/* Slider */}
          <div className="mb-8">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-300">
                Monthly OpenAI spend
              </label>
              <span className="text-xl font-bold text-white">{fmt(monthlySpend)}</span>
            </div>
            <input
              type="range"
              min={100}
              max={50000}
              step={100}
              value={monthlySpend}
              onChange={(e) => setMonthlySpend(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-blue-500"
            />
            <div className="mt-1 flex justify-between text-xs text-slate-500">
              <span>$100</span>
              <span>$50,000</span>
            </div>
          </div>

          {/* Bar chart */}
          <div className="mb-8 space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-slate-400">Current (OpenAI only)</span>
                <span className="font-semibold text-white">{fmt(monthlySpend)}</span>
              </div>
              <div className="h-8 overflow-hidden rounded-lg bg-slate-800">
                <div
                  className="h-full rounded-lg bg-slate-600 transition-all duration-300"
                  style={{ width: `${(currentBar / barMaxWidth) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-slate-400">With RouteIQ</span>
                <span className="font-semibold text-emerald-400">{fmt(withRouteIQ)}</span>
              </div>
              <div className="h-8 overflow-hidden rounded-lg bg-slate-800">
                <div
                  className="h-full rounded-lg bg-emerald-600 transition-all duration-300"
                  style={{ width: `${(routeIQBar / barMaxWidth) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
            <div className="text-sm text-emerald-300/70">You&apos;d save approximately</div>
            <div className="my-2 text-5xl font-bold text-emerald-400">{fmt(savings)}</div>
            <div className="text-sm text-emerald-300/70">per month (30% average savings)</div>
          </div>

          <p className="mt-4 text-center text-xs text-slate-600">
            Based on average savings across our design partner workloads. Actual savings vary by
            workload, model mix, and quality tier selection.
          </p>
        </div>
      </div>
    </section>
  )
}
