'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Copy, Check, Key } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/formatCurrency'

const createAgentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(64, 'Name must be 64 characters or less'),
  daily_budget: z.number().min(1).max(500),
  quality_tier: z.enum(['economy', 'standard', 'premium']),
})

type CreateAgentFormData = z.infer<typeof createAgentSchema>

interface CreateAgentDialogProps {
  open: boolean
  onClose: () => void
}

const QUALITY_TIERS = [
  {
    value: 'economy' as const,
    label: 'Economy',
    description: 'Cost-optimized routing. Best value for high-volume tasks.',
    examples: 'Gemini Flash, Mistral 7B, Claude Haiku',
  },
  {
    value: 'standard' as const,
    label: 'Standard',
    description: 'Balanced cost and quality for most use cases.',
    examples: 'GPT-4o Mini, Llama 70B, Gemini Pro',
  },
  {
    value: 'premium' as const,
    label: 'Premium',
    description: 'Highest quality models for complex reasoning tasks.',
    examples: 'GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro',
  },
]

function generateApiKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const randomPart = Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `routeiq-${randomPart}`
}

export function CreateAgentDialog({ open, onClose }: CreateAgentDialogProps) {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [budgetValue, setBudgetValue] = useState(50)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAgentFormData>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      name: '',
      daily_budget: 50,
      quality_tier: 'standard',
    },
  })

  const qualityTier = watch('quality_tier')

  const onSubmit = async (data: CreateAgentFormData) => {
    await new Promise((r) => setTimeout(r, 900))
    console.log('Creating agent:', data)
    setApiKey(generateApiKey())
  }

  const handleClose = () => {
    setApiKey(null)
    setCopied(false)
    setBudgetValue(50)
    reset()
    onClose()
  }

  const handleCopy = () => {
    if (!apiKey) return
    void navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-white font-semibold text-lg">
            {apiKey ? 'Agent Created!' : 'Create Agent'}
          </h2>
          <button onClick={handleClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {apiKey ? (
          /* Success state */
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-routeiq-green/20 mx-auto">
              <Key className="w-8 h-8 text-routeiq-green" />
            </div>
            <div className="text-center">
              <p className="text-white font-medium">Your API Key</p>
              <p className="text-slate-400 text-sm mt-1">
                Store this key securely — it won&apos;t be shown again.
              </p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <code className="text-routeiq-green font-mono text-xs flex-1 break-all">{apiKey}</code>
                <button
                  onClick={handleCopy}
                  className="shrink-0 p-2 rounded-md hover:bg-slate-700 transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-routeiq-green" />
                  ) : (
                    <Copy className="w-4 h-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4 text-sm space-y-2">
              <p className="text-slate-300 font-medium text-xs">Quick start:</p>
              <code className="text-xs font-mono text-slate-400 block">
                <span className="text-slate-500">import</span>{' '}
                <span className="text-white">openai</span>
                <br />
                <br />
                <span className="text-slate-500">client = openai.OpenAI(</span>
                <br />
                {'    '}<span className="text-slate-400">api_key=</span>
                <span className="text-routeiq-green">&quot;{apiKey.slice(0, 20)}...&quot;</span>,
                <br />
                {'    '}<span className="text-slate-400">base_url=</span>
                <span className="text-routeiq-green">&quot;https://api.routeiq.com/v1&quot;</span>
                <br />
                <span className="text-slate-500">)</span>
              </code>
            </div>
            <button
              onClick={handleClose}
              className="w-full bg-routeiq-blue hover:bg-blue-600 text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              Go to Agents
            </button>
          </div>
        ) : (
          /* Form state */
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">
                Agent Name
              </label>
              <input
                {...register('name')}
                type="text"
                placeholder="e.g. Customer Support Bot"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-routeiq-blue transition-colors"
              />
              {errors.name && (
                <p className="text-routeiq-red text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Budget slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-300 text-sm font-medium">Daily Budget</label>
                <span className="text-white font-semibold text-sm">{formatCurrency(budgetValue)}</span>
              </div>
              <input
                type="range"
                min={1}
                max={500}
                step={1}
                value={budgetValue}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  setBudgetValue(val)
                  setValue('daily_budget', val)
                }}
                className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-routeiq-blue"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>$1</span>
                <span>$500</span>
              </div>
            </div>

            {/* Quality tier */}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Quality Tier</label>
              <div className="space-y-2">
                {QUALITY_TIERS.map((tier) => (
                  <label
                    key={tier.value}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      qualityTier === tier.value
                        ? 'border-routeiq-blue bg-routeiq-blue/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      {...register('quality_tier')}
                      value={tier.value}
                      className="mt-0.5 accent-routeiq-blue"
                    />
                    <div>
                      <p className="text-white text-sm font-medium">{tier.label}</p>
                      <p className="text-slate-400 text-xs">{tier.description}</p>
                      <p className="text-slate-500 text-xs mt-0.5">Examples: {tier.examples}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-routeiq-blue hover:bg-blue-600 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                {isSubmitting ? 'Creating...' : 'Create Agent'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
