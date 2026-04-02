import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Route<span className="text-routeiq-blue">IQ</span>
          </h1>
          <p className="text-slate-400 text-sm">AI Cost Optimization Platform</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              card: 'bg-slate-900 border border-white/10 shadow-xl',
              headerTitle: 'text-white',
              headerSubtitle: 'text-slate-400',
              formFieldLabel: 'text-slate-300',
              formFieldInput:
                'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-routeiq-blue',
              footerActionLink: 'text-routeiq-blue hover:text-blue-400',
              formButtonPrimary:
                'bg-routeiq-blue hover:bg-blue-600 text-white',
              dividerLine: 'bg-slate-700',
              dividerText: 'text-slate-500',
              socialButtonsBlockButton:
                'border-slate-700 text-slate-300 hover:bg-slate-800',
              identityPreviewText: 'text-slate-300',
              formResendCodeLink: 'text-routeiq-blue',
            },
          }}
          redirectUrl="/dashboard"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  )
}
