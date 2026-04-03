'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

type TabKey = 'python' | 'javascript' | 'curl'

const CODE_EXAMPLES: Record<TabKey, { label: string; code: string }> = {
  python: {
    label: 'Python',
    code: `import openai

# Before: points to OpenAI
# client = openai.OpenAI(
#     api_key="sk-...",
#     base_url="https://api.openai.com/v1"
# )

# After: one line change — points to RouteIQ
client = openai.OpenAI(
    api_key="routeiq-YOUR_API_KEY",
    base_url="https://api.routeiq.com/v1"
)

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "Summarize this quarter's financials."}
    ]
)

print(response.choices[0].message.content)
# RouteIQ automatically routes to the cheapest
# provider that meets your quality requirements.`,
  },
  javascript: {
    label: 'JavaScript',
    code: `import OpenAI from 'openai';

// Before: points to OpenAI
// const client = new OpenAI({
//   apiKey: 'sk-...',
//   baseURL: 'https://api.openai.com/v1',
// });

// After: one line change — points to RouteIQ
const client = new OpenAI({
  apiKey: 'routeiq-YOUR_API_KEY',
  baseURL: 'https://api.routeiq.com/v1',
});

const response = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'user', content: 'Summarize this quarter\'s financials.' },
  ],
});

console.log(response.choices[0].message.content);
// RouteIQ handles routing, budgets, and cost optimization
// transparently — your code doesn't change.`,
  },
  curl: {
    label: 'cURL',
    code: `# Before: OpenAI direct
# curl https://api.openai.com/v1/chat/completions \\
#   -H "Authorization: Bearer sk-..." \\

# After: RouteIQ (one URL change)
curl https://api.routeiq.com/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer routeiq-YOUR_API_KEY" \\
  -d '{
    "model": "gpt-4o",
    "messages": [
      {
        "role": "user",
        "content": "Summarize this quarter\\'s financials."
      }
    ]
  }'

# Response is identical to OpenAI format.
# RouteIQ adds X-RouteIQ-Provider and
# X-RouteIQ-Cost headers to every response.`,
  },
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    void navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-routeiq-green" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('python')

  return (
    <div className="min-h-screen bg-[#0f172a] py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl font-bold text-white">
              Route<span className="text-routeiq-blue">IQ</span>
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300 text-xl">API Documentation</span>
          </div>
          <p className="text-slate-400">
            RouteIQ is a drop-in replacement for the OpenAI API. Change one line of code and start
            saving on AI costs immediately.
          </p>
        </div>

        {/* The one-line change — hero section */}
        <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-white font-semibold text-lg">The One-Line Change</h2>
            <span className="px-2 py-0.5 bg-routeiq-green/20 text-routeiq-green rounded text-xs font-medium">
              Zero code changes required
            </span>
          </div>
          <div className="p-6 font-mono text-sm">
            <div className="bg-red-950/40 border border-red-900/30 rounded-lg px-4 py-3 mb-2">
              <span className="text-red-400 select-none mr-2">-</span>
              <span className="text-red-300">base_url=</span>
              <span className="text-red-400">&quot;https://api.openai.com/v1&quot;</span>
            </div>
            <div className="bg-green-950/40 border border-green-900/30 rounded-lg px-4 py-3">
              <span className="text-routeiq-green select-none mr-2">+</span>
              <span className="text-green-300">base_url=</span>
              <span className="text-routeiq-green">&quot;https://api.routeiq.com/v1&quot;</span>
            </div>
          </div>
        </div>

        {/* Quick start */}
        <div className="space-y-4">
          <h2 className="text-white font-bold text-xl">Quick Start</h2>
          <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-white/10">
              <div className="flex gap-1">
                {(Object.keys(CODE_EXAMPLES) as TabKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                      activeTab === key
                        ? 'bg-routeiq-blue text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {CODE_EXAMPLES[key].label}
                  </button>
                ))}
              </div>
              <CopyButton text={CODE_EXAMPLES[activeTab].code} />
            </div>
            <pre className="p-6 text-sm font-mono text-slate-300 overflow-x-auto leading-relaxed">
              <code>{CODE_EXAMPLES[activeTab].code}</code>
            </pre>
          </div>
        </div>

        {/* API Reference */}
        <div className="space-y-4">
          <h2 className="text-white font-bold text-xl">API Reference</h2>
          <div className="space-y-4">
            {[
              {
                method: 'POST',
                path: '/v1/chat/completions',
                description: 'Create a chat completion. 100% compatible with OpenAI Chat Completions API.',
                color: 'bg-routeiq-green/20 text-routeiq-green',
              },
              {
                method: 'GET',
                path: '/v1/models',
                description: 'List all available models across all providers.',
                color: 'bg-routeiq-blue/20 text-routeiq-blue',
              },
              {
                method: 'GET',
                path: '/v1/agents',
                description: 'List all agents in your organization.',
                color: 'bg-routeiq-blue/20 text-routeiq-blue',
              },
              {
                method: 'POST',
                path: '/v1/agents',
                description: 'Create a new agent with budget and quality tier configuration.',
                color: 'bg-routeiq-green/20 text-routeiq-green',
              },
              {
                method: 'GET',
                path: '/v1/agents/:id/logs',
                description: 'Get routing decision logs for a specific agent.',
                color: 'bg-routeiq-blue/20 text-routeiq-blue',
              },
            ].map((endpoint, i) => (
              <div key={i} className="bg-slate-900 border border-white/10 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold shrink-0 ${endpoint.color}`}>
                    {endpoint.method}
                  </span>
                  <code className="text-white font-mono text-sm">{endpoint.path}</code>
                </div>
                <p className="text-slate-400 text-sm mt-2 ml-14">{endpoint.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Response headers */}
        <div className="space-y-4">
          <h2 className="text-white font-bold text-xl">Response Headers</h2>
          <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-slate-400 font-medium px-6 py-3">Header</th>
                  <th className="text-left text-slate-400 font-medium px-4 py-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  ['X-RouteIQ-Provider', 'The provider used for this request (e.g., openai, anthropic)'],
                  ['X-RouteIQ-Model', 'The actual model used (may differ from requested model)'],
                  ['X-RouteIQ-Cost', 'Exact cost in USD for this request (e.g., 0.000234)'],
                  ['X-RouteIQ-Latency', 'Provider latency in milliseconds'],
                  ['X-RouteIQ-Request-ID', 'Unique request ID for debugging'],
                ].map(([header, desc]) => (
                  <tr key={header}>
                    <td className="px-6 py-3 font-mono text-routeiq-blue text-xs">{header}</td>
                    <td className="px-4 py-3 text-slate-300">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
