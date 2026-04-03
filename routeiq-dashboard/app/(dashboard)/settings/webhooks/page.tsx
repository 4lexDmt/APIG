'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, CheckCircle, AlertCircle, Webhook } from 'lucide-react'

const webhookSchema = z.object({
  url: z.string().url('Must be a valid HTTPS URL').refine((url) => url.startsWith('https://'), {
    message: 'Webhook URL must use HTTPS',
  }),
  description: z.string().max(128, 'Max 128 characters').optional(),
  events: z.array(z.string()).min(1, 'Select at least one event type'),
})

type WebhookFormData = z.infer<typeof webhookSchema>

const EVENT_TYPES = [
  { value: 'request.completed', label: 'Request Completed', description: 'Fired after every AI request' },
  { value: 'budget.threshold', label: 'Budget Threshold', description: 'Fired at 80% and 95% budget usage' },
  { value: 'budget.exceeded', label: 'Budget Exceeded', description: 'Fired when daily budget is exceeded' },
  { value: 'agent.created', label: 'Agent Created', description: 'Fired when a new agent is created' },
  { value: 'agent.deactivated', label: 'Agent Deactivated', description: 'Fired when an agent is deactivated' },
  { value: 'circuit_breaker.open', label: 'Circuit Breaker Open', description: 'Fired when a provider is taken offline' },
]

interface SavedWebhook {
  id: string
  url: string
  description: string
  events: string[]
  status: 'active' | 'failing'
  lastTriggered: string
}

const MOCK_WEBHOOKS: SavedWebhook[] = [
  {
    id: 'wh_001',
    url: 'https://api.myapp.com/webhooks/routeiq',
    description: 'Production webhook',
    events: ['request.completed', 'budget.exceeded'],
    status: 'active',
    lastTriggered: '2 minutes ago',
  },
]

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<SavedWebhook[]>(MOCK_WEBHOOKS)
  const [showForm, setShowForm] = useState(false)
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WebhookFormData>({
    resolver: zodResolver(webhookSchema),
    defaultValues: { events: [] },
  })

  const selectedEvents = watch('events') ?? []

  const toggleEvent = (event: string) => {
    const current = selectedEvents
    setValue(
      'events',
      current.includes(event) ? current.filter((e) => e !== event) : [...current, event]
    )
  }

  const onSubmit = async (data: WebhookFormData) => {
    await new Promise((r) => setTimeout(r, 800))
    const newWebhook: SavedWebhook = {
      id: `wh_${Date.now()}`,
      url: data.url,
      description: data.description ?? '',
      events: data.events,
      status: 'active',
      lastTriggered: 'Never',
    }
    setWebhooks((prev) => [...prev, newWebhook])
    setSaved(true)
    reset()
    setShowForm(false)
    setTimeout(() => setSaved(false), 3000)
  }

  const deleteWebhook = (id: string) => {
    setWebhooks((prev) => prev.filter((w) => w.id !== id))
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Webhooks</h1>
        <p className="text-slate-400 text-sm mt-1">
          Receive real-time notifications when events occur in RouteIQ
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-routeiq-green/20 border border-routeiq-green/30 rounded-lg px-4 py-3 text-routeiq-green text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Webhook saved successfully!
        </div>
      )}

      {/* Existing webhooks */}
      <div className="space-y-3">
        {webhooks.map((webhook) => (
          <div key={webhook.id} className="bg-slate-900 border border-white/10 rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    webhook.status === 'active' ? 'bg-routeiq-green/20' : 'bg-routeiq-red/20'
                  }`}
                >
                  <Webhook
                    className={`w-4 h-4 ${
                      webhook.status === 'active' ? 'text-routeiq-green' : 'text-routeiq-red'
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm truncate">{webhook.url}</p>
                  {webhook.description && (
                    <p className="text-slate-400 text-xs">{webhook.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {webhook.status === 'active' ? (
                  <span className="flex items-center gap-1 text-xs text-routeiq-green">
                    <CheckCircle className="w-3 h-3" /> Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-routeiq-red">
                    <AlertCircle className="w-3 h-3" /> Failing
                  </span>
                )}
                <button
                  onClick={() => deleteWebhook(webhook.id)}
                  className="text-slate-500 hover:text-routeiq-red transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {webhook.events.map((event) => (
                <span key={event} className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-xs font-mono">
                  {event}
                </span>
              ))}
            </div>
            <p className="text-slate-500 text-xs mt-2">Last triggered: {webhook.lastTriggered}</p>
          </div>
        ))}
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-routeiq-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Webhook
        </button>
      ) : (
        <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">New Webhook</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm mb-1.5">Webhook URL</label>
              <input
                {...register('url')}
                type="url"
                placeholder="https://api.yourapp.com/webhooks/routeiq"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-routeiq-blue"
              />
              {errors.url && (
                <p className="text-routeiq-red text-xs mt-1">{errors.url.message}</p>
              )}
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-1.5">Description (optional)</label>
              <input
                {...register('description')}
                type="text"
                placeholder="e.g. Production webhook"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-routeiq-blue"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm mb-2">Events to subscribe</label>
              <div className="space-y-2">
                {EVENT_TYPES.map((event) => (
                  <label
                    key={event.value}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(event.value)}
                      onChange={() => toggleEvent(event.value)}
                      className="mt-0.5 w-4 h-4 accent-routeiq-blue"
                    />
                    <div>
                      <p className="text-slate-200 text-sm font-medium group-hover:text-white transition-colors">
                        {event.label}
                      </p>
                      <p className="text-slate-500 text-xs">{event.description}</p>
                    </div>
                  </label>
                ))}
              </div>
              {errors.events && (
                <p className="text-routeiq-red text-xs mt-1">{errors.events.message}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-routeiq-blue hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {isSubmitting ? 'Saving...' : 'Save Webhook'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); reset() }}
                className="text-slate-400 hover:text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
