import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Code2, ArrowRight, ShieldCheck, Terminal, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export const AuthPage: React.FC = () => {
  const navigate = useNavigate()
  const { signIn, signUp, signInDemo, loading } = useAuthStore()

  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter both email and password.')
      return
    }

    try {
      if (isSignUp) {
        await signUp(email, password, displayName)
        toast.success('Account created! Welcome to CodeVault.')
      } else {
        await signIn(email, password)
        toast.success('Signed in successfully.')
      }
      navigate('/dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed.')
    }
  }

  const handleDemoLogin = () => {
    signInDemo()
    toast.success('Entered Developer Demo Workspace')
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#090909] text-[#F5F5F5] flex flex-col md:flex-row select-none">
      {/* Left Brand Panel */}
      <div className="flex-1 bg-[#111111] border-b md:border-b-0 md:border-r border-[rgba(255,255,255,0.09)] p-8 md:p-14 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle background grid */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top Wordmark */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
            <Code2 className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-['Manrope'] tracking-tight text-white">
              CodeVault
            </h1>
            <p className="text-[11px] text-[#666666] font-mono uppercase tracking-wider">
              Engineering Workspace
            </p>
          </div>
        </div>

        {/* Center Philosophy Pitch */}
        <div className="my-12 md:my-0 z-10 max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.03)] text-xs text-[#A1A1A1]">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>AI-Powered Practical Exam Preparation</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold font-['Manrope'] text-white tracking-tight leading-tight">
            Your coding knowledge, organized in one place.
          </h2>

          <p className="text-sm text-[#A1A1A1] leading-relaxed">
            Store university practicals, generate line-by-line AI explanations, simulate oral viva exams, and master algorithms with spaced repetition.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-[#888888] font-mono">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-white" />
              <span>Full Monaco Editor</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span>Isolated Data & RLS</span>
            </div>
          </div>
        </div>

        {/* Bottom Quote / Badge */}
        <div className="z-10 text-[11px] text-[#666666] font-mono">
          <span>Crafted for developers & engineering students • Monochromatic UI</span>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-14">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold font-['Manrope'] text-white">
              {isSignUp ? 'Create an account' : 'Welcome back'}
            </h3>
            <p className="text-xs text-[#A1A1A1]">
              {isSignUp
                ? 'Join CodeVault to organize and analyze your code'
                : 'Enter your credentials to access your workspace'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <Input
                label="Full Name / Display Name"
                placeholder="Alex Rivera"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required={isSignUp}
              />
            )}

            <Input
              type="email"
              label="Email Address"
              placeholder="alex@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              label="Password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={loading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>

          {/* Quick Demo Access Button */}
          <div className="pt-2">
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[rgba(255,255,255,0.08)]"></div>
              <span className="flex-shrink mx-3 text-[11px] text-[#666666] uppercase font-mono tracking-wider">
                Or explore directly
              </span>
              <div className="flex-grow border-t border-[rgba(255,255,255,0.08)]"></div>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="md"
              className="w-full mt-2 text-xs"
              onClick={handleDemoLogin}
            >
              ⚡ Instant Developer Demo Login
            </Button>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-[#A1A1A1] hover:text-white transition-colors"
            >
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
