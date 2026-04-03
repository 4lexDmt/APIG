'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Copy, Check, ArrowRight, ArrowLeft, Terminal, Sparkles } from 'lucide-react'

// ─── Step types ───────────────────────────────────────────────
interface WizardState {
  orgName: string
  useCase: string
  agentName: string
  dailyBudget: number
  qualityTier: string
}

const INITIAL_STATE: WizardState = {
  orgName: '',
  useCase: '',
  agentName: '',
  dailyBudget: 50,
  qualityTier: 'standard',
}

const TOTAL_STEPS = 5

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 60 : -60, opacity: 0 }),
}

// ─── Step components ──────────────────────────────────────────

function Step1({ state, onChange }: { state: WizardState; onChange: (patch: Partial<WizardState>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white font-bold text-2xl">Welcome to RouteIQ</h2>
        <p className="text-slate-400 mt-2">
          Let&apos;s get you set up. This takes less than 2 minutes.
        </p>
      </div>
      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">Organization Name</label>
        <input
          type="text"
          value={state.orgName}
          onChange={(e) => onChange({ orgName: e.target.value })}
          placeholder="Acme Corp"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-routeiq-blue"
        />
      </div>
      <div>
        <label className="block text-slate-300 text-sm font-medium mb-3">Use Case</label>
        <div className="grid grid-cols-1 gap-2">
          {[
            { value: 'multi-agent', label: 'Multi-Agent System', desc: 'Multiple AI agents working together' },
            { value: 'single-bot', label: 'Single Chatbot', desc: 'Customer support or Q&A bot' },
            { value: 'research', label: 'Research & Analysis', desc: 'Document processing, summarization' },
            { value: 'developer', label: 'Developer / Experimentation', desc: 'Building & testing AI features' },
          ].map((uc) => (
            <label
              key={uc.value}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                state.useCase === uc.value
                  ? 'border-routeiq-blue bg-routeiq-blue/10'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              <input
                type="radio"
                name="useCase"
                value={uc.value}
                checked={state.useCase === uc.value}
                onChange={(e) => onChange({ useCase: e.target.value })}
                className="accent-routeiq-blue"
              />
              <div>
                <p className="text-white text-sm font-medium">{uc.label}</p>
                <p className="text-slate-400 text-xs">{uc.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

function Step2({ state, onChange }: { state: WizardState; onChange: (patch: Partial<WizardState>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white font-bold text-2xl">Create Your First Agent</h2>
        <p className="text-slate-400 mt-2">Each agent has its own API key and budget settings.</p>
      </div>
      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">Agent Name</label>
        <input
          type="text"
          value={state.agentName}
          onChange={(e) => onChange({ agentName: e.target.value })}
          placeholder="My First Agent"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-routeiq-blue"
        />
      </div>
      <div>
        <div className="flex justify-between mb-2">
          <label className="text-slate-300 text-sm font-medium">Daily Budget</label>
          <span className="text-white font-semibold">${state.dailyBudget}</span>
        </div>
        <input
          type="range"
          min={1}
          max={500}
          value={state.dailyBudget}
          onChange={(e) => onChange({ dailyBudget: parseInt(e.target.value) })}
          className="w-full accent-routeiq-blue"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>$1</span>
          <span>$500/day</span>
        </div>
      </div>
      <div>
        <label className="block text-slate-300 text-sm font-medium mb-3">Quality Tier</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'economy', label: 'Economy', desc: 'Cheapest option' },
            { value: 'standard', label: 'Standard', desc: 'Balanced' },
            { value: 'premium', label: 'Premium', desc: 'Best quality' },
          ].map((tier) => (
            <label
              key={tier.value}
              className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-colors text-center ${
                state.qualityTier === tier.value
                  ? 'border-routeiq-blue bg-routeiq-blue/10'
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              <input
                type="radio"
                name="qualityTier"
                value={tier.value}
                checked={state.qualityTier === tier.value}
                onChange={(e) => onChange({ qualityTier: e.target.value })}
                className="accent-routeiq-blue mb-1"
              />
              <p className="text-white text-sm font-medium">{tier.label}</p>
              <p className="text-slate-400 text-xs">{tier.desc}</p>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

function Step3({ state }: { state: WizardState }) {
  const [copied, setCopied] = useState(false)
  const apiKey = `routeiq-abc123def456ghi789jkl012mno345pq`

  const handleCopy = () => {
    void navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white font-bold text-2xl">Your API Key</h2>
        <p className="text-slate-400 mt-2">
          Use this key for &quot;{state.agentName || 'My First Agent'}&quot;. Store it securely.
        </p>
      </div>

      {/* API Key */}
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <code className="text-routeiq-green font-mono text-sm flex-1 break-all">{apiKey}</code>
          <button
            onClick={handleCopy}
            className="shrink-0 p-2 rounded hover:bg-slate-700 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-routeiq-green" /> : <Copy className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* THE CODE DIFF */}
      <div>
        <p className="text-slate-300 text-sm font-medium mb-3">The one-line change:</p>
        <div className="rounded-xl overflow-hidden border border-white/10 font-mono text-sm">
          {/* Diff header */}
          <div className="bg-slate-800 px-4 py-2 text-slate-500 text-xs border-b border-white/10">
            openai_client.py
          </div>
          {/* Red line */}
          <div
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', borderLeft: '3px solid #ef4444' }}
            className="px-4 py-2.5 flex items-center gap-3"
          >
            <span className="text-red-400 select-none w-3 text-center">-</span>
            <span>
              <span className="text-slate-400">base_url=</span>
              <span className="text-red-400">&quot;https://api.openai.com/v1&quot;</span>
            </span>
          </div>
          {/* Green line */}
          <div
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', borderLeft: '3px solid #10b981' }}
            className="px-4 py-2.5 flex items-center gap-3"
          >
            <span className="text-routeiq-green select-none w-3 text-center">+</span>
            <span>
              <span className="text-slate-400">base_url=</span>
              <span className="text-routeiq-green">&quot;https://api.routeiq.com/v1&quot;</span>
            </span>
          </div>
        </div>
        <p className="text-slate-500 text-xs mt-2">
          That&apos;s it. Your existing code continues to work. RouteIQ handles everything else.
        </p>
      </div>
    </div>
  )
}

function Step4() {
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const handleTest = () => {
    setTestStatus('loading')
    setTimeout(() => setTestStatus('success'), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white font-bold text-2xl">Make Your First Request</h2>
        <p className="text-slate-400 mt-2">Try it right now with this curl command.</p>
      </div>

      <div className="bg-slate-800 rounded-xl p-4 overflow-x-auto">
        <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs">
          <Terminal className="w-3.5 h-3.5" />
          Terminal
        </div>
        <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
{`curl https://api.routeiq.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer routeiq-abc123..." \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      {
        "role": "user",
        "content": "Hello from RouteIQ!"
      }
    ]
  }'`}
        </pre>
      </div>

      {testStatus === 'success' ? (
        <div className="bg-routeiq-green/20 border border-routeiq-green/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-4 h-4 text-routeiq-green" />
            <span className="text-routeiq-green font-semibold text-sm">Request successful!</span>
          </div>
          <pre className="text-xs font-mono text-slate-300 overflow-x-auto">
{`{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "model": "gemini-1.5-flash",
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "Hello! I'm routed through RouteIQ..."
    }
  }],
  "x-routeiq-provider": "google",
  "x-routeiq-cost": "0.000034",
  "x-routeiq-savings": "0.000156"
}`}
          </pre>
          <p className="text-routeiq-green text-xs mt-2">
            RouteIQ saved you $0.000156 on this single request by routing to Gemini Flash instead of GPT-4o.
          </p>
        </div>
      ) : (
        <button
          onClick={handleTest}
          disabled={testStatus === 'loading'}
          className="flex items-center gap-2 bg-routeiq-blue hover:bg-blue-600 disabled:opacity-70 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          {testStatus === 'loading' ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Terminal className="w-4 h-4" />
              Test It Now
            </>
          )}
        </button>
      )}
    </div>
  )
}

function Step5({ state }: { state: WizardState }) {
  const savingsEstimate = state.dailyBudget * 0.35 * 30

  return (
    <div className="space-y-6 text-center">
      {/* Confetti effect (CSS only) */}
      <div className="relative h-20 overflow-hidden rounded-xl">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-sm animate-bounce"
            style={{
              left: `${(i * 5.2) % 100}%`,
              top: `${Math.random() * 60}%`,
              backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#a78bfa', '#ec4899'][i % 5],
              animationDelay: `${i * 0.08}s`,
              animationDuration: `${0.8 + Math.random() * 0.6}s`,
              transform: `rotate(${Math.random() * 45}deg)`,
            }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-12 h-12 text-routeiq-amber" />
        </div>
      </div>

      <div>
        <h2 className="text-white font-bold text-2xl">You&apos;re All Set! 🎉</h2>
        <p className="text-slate-400 mt-2">
          {state.orgName || 'Your organization'} is ready to start saving on AI costs.
        </p>
      </div>

      {/* Savings projection */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-xl p-4">
          <p className="text-routeiq-green font-bold text-2xl">${savingsEstimate.toFixed(0)}</p>
          <p className="text-slate-400 text-sm mt-1">Projected monthly savings</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4">
          <p className="text-white font-bold text-2xl">~35%</p>
          <p className="text-slate-400 text-sm mt-1">Average cost reduction</p>
        </div>
      </div>

      {/* Cost comparison */}
      <div className="bg-slate-800 rounded-xl p-4 text-left space-y-3">
        <p className="text-slate-300 text-sm font-medium">Monthly cost comparison</p>
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Without RouteIQ</span>
            <span>${(state.dailyBudget * 30).toFixed(0)}/mo</span>
          </div>
          <div className="h-2 bg-red-500/40 rounded-full w-full" />
        </div>
        <div>
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>With RouteIQ</span>
            <span className="text-routeiq-green">${(state.dailyBudget * 30 * 0.65).toFixed(0)}/mo</span>
          </div>
          <div className="h-2 bg-routeiq-green/60 rounded-full" style={{ width: '65%' }} />
        </div>
      </div>
    </div>
  )
}

// ─── Main wizard ──────────────────────────────────────────────

export function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [state, setState] = useState<WizardState>(INITIAL_STATE)

  const updateState = (patch: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...patch }))
  }

  const goNext = () => {
    if (step < TOTAL_STEPS) {
      setDirection(1)
      setStep((s) => s + 1)
    }
  }

  const goBack = () => {
    if (step > 1) {
      setDirection(-1)
      setStep((s) => s - 1)
    }
  }

  const handleFinish = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold text-white">
            Route<span className="text-routeiq-blue">IQ</span>
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                  i + 1 < step
                    ? 'bg-routeiq-green text-white'
                    : i + 1 === step
                    ? 'bg-routeiq-blue text-white ring-4 ring-routeiq-blue/30'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {i + 1 < step ? '✓' : i + 1}
              </div>
            ))}
          </div>
          <div className="h-1 bg-slate-800 rounded-full mt-2">
            <div
              className="h-full bg-gradient-to-r from-routeiq-blue to-routeiq-green rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-8 min-h-[420px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
                {step === 1 && <Step1 state={state} onChange={updateState} />}
                {step === 2 && <Step2 state={state} onChange={updateState} />}
                {step === 3 && <Step3 state={state} />}
                {step === 4 && <Step4 />}
                {step === 5 && <Step5 state={state} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer nav */}
          <div className="px-8 py-5 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={goBack}
              disabled={step === 1}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white disabled:opacity-0 disabled:pointer-events-none transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <span className="text-slate-600 text-xs">
              Step {step} of {TOTAL_STEPS}
            </span>

            {step < TOTAL_STEPS ? (
              <button
                onClick={goNext}
                className="flex items-center gap-1.5 bg-routeiq-blue hover:bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex items-center gap-1.5 bg-routeiq-green hover:bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
