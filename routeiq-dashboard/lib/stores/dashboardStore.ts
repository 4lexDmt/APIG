import { create } from 'zustand'

interface DateRange {
  start: Date
  end: Date
}

interface DashboardState {
  selectedAgentId: string | null
  dateRange: DateRange
  selectedProviders: string[]
  showCacheHitsOnly: boolean

  setSelectedAgent: (id: string | null) => void
  setDateRange: (range: DateRange) => void
  setSelectedProviders: (providers: string[]) => void
  setShowCacheHitsOnly: (show: boolean) => void
  resetFilters: () => void
}

const DEFAULT_DATE_RANGE: DateRange = {
  start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  end: new Date(),
}

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedAgentId: null,
  dateRange: DEFAULT_DATE_RANGE,
  selectedProviders: [],
  showCacheHitsOnly: false,

  setSelectedAgent: (id) => set({ selectedAgentId: id }),
  setDateRange: (range) => set({ dateRange: range }),
  setSelectedProviders: (providers) => set({ selectedProviders: providers }),
  setShowCacheHitsOnly: (show) => set({ showCacheHitsOnly: show }),
  resetFilters: () =>
    set({
      selectedAgentId: null,
      dateRange: DEFAULT_DATE_RANGE,
      selectedProviders: [],
      showCacheHitsOnly: false,
    }),
}))
