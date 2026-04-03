// TypeScript types mirroring the Go models from routeiq-gateway

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } }

// ── Organizations & Teams ────────────────────────────────────────────────────

export interface Organization {
  id: string
  name: string
  plan_tier: 'free' | 'growth' | 'enterprise'
  monthly_budget_usd: number | null
  wallet_address: string | null
  created_at: string
}

export interface Team {
  id: string
  org_id: string
  name: string
  budget_pool_usd: number | null
  created_at: string
}

// ── Agents ───────────────────────────────────────────────────────────────────

export interface Agent {
  id: string
  team_id: string
  name: string
  api_key_prefix: string
  daily_budget_usd: number | null
  is_active: boolean
  created_at: string
  // Derived from usage stats
  today_spend_usd?: number
  today_request_count?: number
}

export interface CreateAgentRequest {
  name: string
  daily_budget_usd: number
  quality_tier: 'economy' | 'standard' | 'premium'
}

export interface CreateAgentResponse {
  agent: Agent
  api_key: string // Full key — only returned once
}

// ── API Requests & Cost Logs ─────────────────────────────────────────────────

export interface APIRequest {
  id: string
  agent_id: string
  agent_name?: string
  provider: 'openai' | 'anthropic' | 'gemini' | 'mistral' | 'groq'
  model: string
  input_tokens: number
  output_tokens: number
  cost_usd: number
  latency_ms: number
  cached: boolean
  stream: boolean
  status_code: number
  error_code?: string
  trace_id?: string
  routed_at: string
  // Routing metadata (future sprints)
  routing_alternatives?: RoutingAlternative[]
  reason_code?: string
}

export interface RoutingAlternative {
  provider: string
  model: string
  estimated_cost_usd: number
  estimated_latency_ms: number
  quality_score: number
  rejected_reason?: string
}

export interface CostLog {
  id: string
  agent_id: string
  request_id: string
  amount_usd: number
  provider: string
  logged_at: string
}

// ── Analytics ────────────────────────────────────────────────────────────────

export interface DailySpend {
  date: string // ISO date
  actual_cost_usd: number
  without_routeiq_usd: number
  savings_usd: number
  request_count: number
}

export interface ProviderDistribution {
  provider: string
  cost_usd: number
  request_count: number
  avg_latency_ms: number
  tokens_total: number
}

export interface AgentSummary {
  agent: Agent
  total_cost_usd: number
  total_requests: number
  avg_latency_ms: number
  budget_used_pct: number
}

// ── OpenAI Wire Format (for reference) ───────────────────────────────────────

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
}

export interface ChatCompletionRequest {
  model: string
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
}

export interface ChatCompletionResponse {
  id: string
  object: 'chat.completion'
  created: number
  model: string
  choices: Array<{
    index: number
    message: ChatMessage
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}
