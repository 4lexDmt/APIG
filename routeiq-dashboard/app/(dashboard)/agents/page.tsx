'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AgentCard } from '@/components/agents/AgentCard'
import { CreateAgentDialog } from '@/components/agents/CreateAgentDialog'
import type { Agent } from '@/types/api'

const MOCK_AGENTS: Agent[] = [
  {
    id: 'agt_01h9x2k3m4n5p6q7',
    org_id: 'org_01',
    name: 'Customer Support Bot',
    api_key_prefix: 'riq_cs',
    daily_budget_usd: 50,
    quality_tier: 'standard',
    is_active: true,
    created_at: new Date('2026-03-01'),
    updated_at: new Date('2026-03-28'),
    spend_today_usd: 23.45,
    requests_today: 1843,
  },
  {
    id: 'agt_02h9x2k3m4n5p6q8',
    org_id: 'org_01',
    name: 'Research Assistant',
    api_key_prefix: 'riq_ra',
    daily_budget_usd: 200,
    quality_tier: 'premium',
    is_active: true,
    created_at: new Date('2026-03-05'),
    updated_at: new Date('2026-03-30'),
    spend_today_usd: 87.12,
    requests_today: 312,
  },
  {
    id: 'agt_03h9x2k3m4n5p6q9',
    org_id: 'org_01',
    name: 'Code Review Agent',
    api_key_prefix: 'riq_cr',
    daily_budget_usd: 100,
    quality_tier: 'premium',
    is_active: true,
    created_at: new Date('2026-03-10'),
    updated_at: new Date('2026-04-01'),
    spend_today_usd: 45.67,
    requests_today: 567,
  },
  {
    id: 'agt_04h9x2k3m4n5p6r0',
    org_id: 'org_01',
    name: 'Data Extraction Pipeline',
    api_key_prefix: 'riq_de',
    daily_budget_usd: 25,
    quality_tier: 'economy',
    is_active: false,
    created_at: new Date('2026-02-15'),
    updated_at: new Date('2026-03-20'),
    spend_today_usd: 0,
    requests_today: 0,
  },
]

export default function AgentsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Agents</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your AI agents and their budgets</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-routeiq-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Agent
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MOCK_AGENTS.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      <CreateAgentDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  )
}
