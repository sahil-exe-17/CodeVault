import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, X, ArrowRight } from 'lucide-react'
import { AuroraBackground } from '@/components/auth/AuroraBackground'
import { GlassInput } from '@/components/auth/GlassInput'
import { GoogleAuthModal, parseGoogleJwt } from '@/components/auth/GoogleAuthModal'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

export const AuthPage: React.FC = () => {
  const navigate = useNavigate()
  const { signIn, signUp, signInWithGoogle, loading } = useAuthStore()

  const [mode, setMode] = useState<'signup' | 'signin'>('signup')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false)

  const handleAuthSuccess = (user: any) => {
    if (!user.is_profile_completed) {
      navigate('/onboarding')
    } else {
      navigate('/subjects')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedEmail = email.trim().toLowerCase()
    const trimmedPassword = password.trim()

    if (!trimmedEmail) {
      toast.error('Please enter your email address.')
      return
    }

    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      toast.error('Please enter a valid email address.')
      return
    }

    if (!trimmedPassword) {
      toast.error('Please enter your password.')
      return
    }

    if (trimmedPassword.length < 4) {
      toast.error('Password must be at least 4 characters long.')
      return
    }

    try {
      if (mode === 'signup') {
        const fullName = `${firstName.trim()} ${lastName.trim()}`.trim() || trimmedEmail.split('@')[0]
        const user = await signUp(trimmedEmail, trimmedPassword, fullName)
        toast.success('Account created successfully!')
        handleAuthSuccess(user)
      } else {
        const user = await signIn(trimmedEmail, trimmedPassword)
        toast.success(`Welcome back, ${user.display_name}!`)
        handleAuthSuccess(user)
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed. Please try again.')
    }
  }

  const handleGoogleSuccess = async (googleData: {
    email: string
    name: string
    avatar_url: string
    google_id: string
  }) => {
    const user = await signInWithGoogle(googleData)
    toast.success(`Signed in with Google as ${user.email}`)
    handleAuthSuccess(user)
  }

  const handleGoogleClick = () => {
    const savedClientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      localStorage.getItem('codevault_google_client_id')

    if (savedClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: savedClientId.trim(),
          callback: async (response: any) => {
            if (response?.credential) {
              const profile = parseGoogleJwt(response.credential)
              if (profile?.email) {
                await handleGoogleSuccess({
                  email: profile.email,
                  name: profile.name || profile.email.split('@')[0],
                  avatar_url: profile.picture || '',
                  google_id: profile.sub || `google-${Date.now()}`,
                })
              }
            }
          },
        })
        window.google.accounts.id.prompt()
        return
      } catch (e) {
        console.error('Error prompting Google GIS:', e)
      }
    }
    // If not connected yet, open the connection modal
    setIsGoogleModalOpen(true)
  }

  const handleAppleSignIn = () => {
    handleGoogleClick()
  }

  return (
    <div
      className="relative min-h-screen w-full bg-[#050507] text-[#F5F5F5] flex items-center justify-center p-4 overflow-hidden select-none"
    >
      {/* Dark Ambient Atmosphere Layer */}
      <div className="absolute inset-0 bg-[#050507] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {/* Ambient Canvas Background */}
      <AuroraBackground />

      {/* Glassmorphism Auth Modal Card (Solid & Professional) */}
      <div
        className="relative z-10 w-full max-w-[430px] rounded-[28px] p-8 sm:p-9 bg-[#111115]/80 backdrop-blur-2xl border border-white/[0.12] shadow-[0_30px_100px_rgba(0,0,0,0.85)] overflow-hidden"
      >
        {/* Subtle glass reflection highlight on the card surface */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-white/[0.04] rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Controls: Segmented Toggle + Close Button */}
        <div className="flex items-center justify-between mb-7">
          {/* Segmented Pill Switcher (Sign up / Sign in) */}
          <div className="flex items-center p-1 bg-[#1a1a20]/80 border border-white/[0.08] rounded-full backdrop-blur-md">
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`relative px-4 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                mode === 'signup' ? 'text-white' : 'text-white/50 hover:text-white/80'
              }`}
            >
              {mode === 'signup' && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-[#282830] border border-white/15 rounded-full shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">Sign up</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`relative px-4 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer ${
                mode === 'signin' ? 'text-white' : 'text-white/50 hover:text-white/80'
              }`}
            >
              {mode === 'signin' && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-[#282830] border border-white/15 rounded-full shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">Sign in</span>
            </button>
          </div>

          {/* Close 'X' Button */}
          <button
            type="button"
            onClick={() => navigate('/subjects')}
            title="Continue as guest"
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/[0.09] flex items-center justify-center text-white/50 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Title & Official Logo */}
        <div className="mb-6 flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#181820] border border-white/20 p-2 flex items-center justify-center shrink-0 shadow-[0_0_25px_rgba(255,255,255,0.12)]">
            <img
              src="/logo-tight.png"
              alt="CodeVault Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-['Manrope'] text-white tracking-tight">
              {mode === 'signup' ? 'Create an account' : 'Welcome back'}
            </h1>
            <p className="text-xs text-white/40 mt-1">
              {mode === 'signup'
                ? 'Join CodeVault to organize, study, and master practicals.'
                : 'Sign in to access your subjects, code, and notes.'}
            </p>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-2.5">
              <GlassInput
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required={mode === 'signup'}
              />
              <GlassInput
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required={mode === 'signup'}
              />
            </div>
          )}

          <GlassInput
            type="email"
            placeholder="Enter your email"
            icon={<Mail className="w-4 h-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <GlassInput
            type="password"
            placeholder={mode === 'signup' ? 'Create password (min. 4 chars)' : 'Enter your password'}
            icon={<Lock className="w-4 h-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Primary CTA Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 h-11 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(255,255,255,0.18)] cursor-pointer disabled:opacity-50"
          >
            <span>
              {loading
                ? mode === 'signup'
                  ? 'Creating account...'
                  : 'Signing in...'
                : mode === 'signup'
                ? 'Create an account'
                : 'Sign in'}
            </span>
            {!loading && <ArrowRight className="w-4 h-4 stroke-[2.5]" />}
          </button>
        </form>

        {/* OR SIGN IN WITH Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-[1px] bg-white/[0.08]" />
          <span className="text-[10px] font-mono tracking-widest text-white/35 uppercase">
            OR SIGN IN WITH
          </span>
          <div className="flex-1 h-[1px] bg-white/[0.08]" />
        </div>

        {/* Social Authentication: Google & Apple */}
        <div className="grid grid-cols-2 gap-2.5 mb-6">
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={loading}
            className="h-10 px-3 rounded-xl bg-[#1a1a20]/80 hover:bg-[#23232c] text-white/90 border border-white/[0.08] hover:border-white/20 text-xs font-medium flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="font-medium">Google</span>
          </button>

          <button
            type="button"
            onClick={handleAppleSignIn}
            disabled={loading}
            className="h-10 px-3 rounded-xl bg-[#1a1a20]/80 hover:bg-[#23232c] text-white/90 border border-white/[0.08] hover:border-white/20 text-xs font-medium flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <svg className="w-3.5 h-3.5 fill-current shrink-0 text-white" viewBox="0 0 170 170">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.7-7.85-12.01-14.42-5.74-8.81-10.22-18.89-13.43-30.25-3.21-11.36-4.82-22.18-4.82-32.48 0-14.78 3.8-27.24 11.41-37.38 7.61-10.13 17.26-15.34 28.96-15.63 4.9.11 10.26 1.41 16.08 3.9 5.82 2.49 9.77 3.81 11.85 3.97 1.83-.16 5.88-1.54 12.16-4.14 6.27-2.6 11.66-3.83 16.17-3.69 12.63.63 22.84 5.34 30.64 14.13-11.08 6.74-16.51 16.04-16.3 27.9.21 9.47 3.83 17.38 10.86 23.73 7.03 6.35 15.37 10.02 25.02 11.02-2.3 7.21-5.18 14.35-8.63 21.42zM119.22 33.15c0-7.39 2.68-14.38 8.04-20.97 5.36-6.59 12.01-10.73 19.95-12.43.1 1.06.16 2.12.16 3.18 0 7.39-2.73 14.47-8.19 21.23-5.46 6.76-12.22 10.87-20.29 12.32-.22-1.16-.33-2.27-.33-3.33z" />
            </svg>
            <span className="font-medium">Apple</span>
          </button>
        </div>

        {/* Footer Terms */}
        <div className="text-center">
          <p className="text-[11px] text-white/30 leading-relaxed">
            By creating an account, you agree to our{' '}
            <span className="text-white/50 hover:underline cursor-pointer">Terms & Service</span>
          </p>
        </div>
      </div>

      {/* Google Account Selection Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSuccess={handleGoogleSuccess}
        loading={loading}
      />
    </div>
  )
}
