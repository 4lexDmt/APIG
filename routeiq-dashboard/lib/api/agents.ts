import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './client'
import type { Agent, CreateAgentRequest, CreateAgentResponse } from '@/types/api'

// ── Query keys ───────────────────────────────────────────────────────────────
export const agentKeys = {
  all: ['agents'] as const,
  lists: () => [...agentKeys.all, 'list'] as const,
  detail: (id: string) => [...agentKeys.all, 'detail', id] as const,
}

// ── Hooks ────────────────────────────────────────────────────────────────────

/** Fetch all agents for the current org. */
export function useAgents() {
  return useQuery({
    queryKey: agentKeys.lists(),
    queryFn: async () => {
      const result = await api.get<Agent[]>('/api/agents')
      if (!result.success) throw new Error(result.error.message)
      return result.data
    },
    staleTime: 30_000, // 30 seconds
  })
}

/** Fetch a single agent by ID. */
export function useAgent(id: string) {
  return useQuery({
    queryKey: agentKeys.detail(id),
    queryFn: async () => {
      const result = await api.get<Agent>(`/api/agents/${id}`)
      if (!result.success) throw new Error(result.error.message)
      return result.data
    },
    enabled: Boolean(id),
    staleTime: 30_000,
  })
}

/** Create a new agent. Returns the full API key (only shown once). */
export function useCreateAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateAgentRequest) => {
      const result = await api.post<CreateAgentResponse>('/api/agents', payload)
      if (!result.success) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
    },
  })
}

/** Toggle agent active status. */
export function useToggleAgent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const result = await api.patch<Agent>(`/api/agents/${id}`, { is_active: isActive })
      if (!result.success) throw new Error(result.error.message)
      return result.data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: agentKeys.lists() })
    },
  })
}
