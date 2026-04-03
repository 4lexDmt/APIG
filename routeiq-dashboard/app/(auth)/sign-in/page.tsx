// TODO(production): restore <SignIn /> component with Clerk keys configured.
export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="w-full max-w-md px-4 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          Route<span className="text-[#3b82f6]">IQ</span>
        </h1>
        <p className="text-slate-400 text-sm mb-6">AI Cost Optimization Platform</p>
        <div className="bg-slate-900 border border-white/10 rounded-xl p-8">
          <p className="text-slate-300 text-sm">Sign-in powered by Clerk.</p>
          <p className="text-slate-500 text-xs mt-2">Configure NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY to enable.</p>
        </div>
      </div>
    </div>
  )
}
