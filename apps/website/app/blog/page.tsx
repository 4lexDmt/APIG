import type { Metadata } from 'next'
import Link from 'next/link'
import Footer from '@/components/sections/Footer'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Technical articles on LLM routing, AI cost optimization, and the RouteIQ platform.',
}

const POSTS = [
  {
    slug: 'why-llm-routing-saves-30-percent',
    title: 'Why LLM routing saves you 30%',
    date: 'March 18, 2026',
    category: 'Engineering',
    readTime: '8 min read',
    excerpt:
      "Most AI agent workloads don't actually need GPT-4o for every call. Here's the data on how intelligent routing reduces costs without sacrificing quality.",
  },
  {
    slug: 'introducing-routeiq',
    title: 'Introducing RouteIQ: Drop-in LLM cost optimization',
    date: 'March 5, 2026',
    category: 'Product',
    readTime: '5 min read',
    excerpt:
      "Today we're launching RouteIQ: a reverse proxy that sits between your AI agents and LLM providers, routing requests to the cheapest qualified option automatically.",
  },
  {
    slug: 'x402-micropayments-ai-agents',
    title: 'Understanding x402 micropayments for AI agents',
    date: 'February 20, 2026',
    category: 'Engineering',
    readTime: '12 min read',
    excerpt:
      'The x402 protocol enables HTTP-native micropayments. Here\'s how we use it to settle per-token costs on Base L2 without invoices or credit cards.',
  },
]

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#0f172a]">
      <div className="border-b border-white/10 px-6 py-16 text-center">
        <h1 className="mb-4 text-5xl font-bold text-white">Blog</h1>
        <p className="text-xl text-slate-400">
          Engineering deep-dives, product updates, and AI cost insights
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-16">
        <div className="space-y-8">
          {POSTS.map((post) => (
            <article
              key={post.slug}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 transition-all hover:border-white/20 hover:bg-white/8"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400">
                  {post.category}
                </span>
                <span className="text-xs text-slate-500">{post.date}</span>
                <span className="text-xs text-slate-600">·</span>
                <span className="text-xs text-slate-500">{post.readTime}</span>
              </div>
              <h2 className="mb-3 text-xl font-semibold text-white">
                <Link href={`/blog/${post.slug}`} className="hover:text-blue-400">
                  {post.title}
                </Link>
              </h2>
              <p className="text-sm leading-relaxed text-slate-400">{post.excerpt}</p>
              <div className="mt-4">
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-sm font-medium text-blue-400 hover:text-blue-300"
                >
                  Read more →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  )
}
