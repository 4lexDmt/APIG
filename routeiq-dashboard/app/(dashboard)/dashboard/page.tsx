import { SpendMeter } from '@/components/dashboard/SpendMeter'
import { SavingsWidget } from '@/components/dashboard/SavingsWidget'
import { ProviderDonutChart } from '@/components/dashboard/ProviderDonutChart'
import { CostTimelineChart } from '@/components/dashboard/CostTimelineChart'
import { TopAgentsTable } from '@/components/dashboard/TopAgentsTable'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Monitor your AI costs and routing performance in real-time</p>
      </div>

      {/* Top row: SpendMeter + Savings + Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SpendMeter currentSpend={342.18} budgetLimit={1000} />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6">
          <SavingsWidget
            savedAmount={218.45}
            totalTokensProcessed={48_230_000}
            percentageSaved={39}
          />
        </div>
        <div className="lg:col-span-1">
          <ProviderDonutChart />
        </div>
      </div>

      {/* Cost Timeline */}
      <CostTimelineChart />

      {/* Top Agents Table */}
      <TopAgentsTable />
    </div>
  )
}
