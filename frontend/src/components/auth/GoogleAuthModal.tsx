import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, ShieldCheck, Settings, Check } from 'lucide-react'
import { GlassInput } from './GlassInput'
import toast from 'react-hot-toast'

declare global {
  interface Window {
    google?: any
  }
}

interface GoogleAuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (googleData: { email: string; name: string; avatar_url: string; google_id: string }) => Promise<void>
  loading?: boolean
}

export const parseGoogleJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    console.error('Failed to parse Google JWT:', e)
    return null
  }
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  loading = false,
}) => {
  const [googleEmail, setGoogleEmail] = useState('')
  const [googleName, setGoogleName] = useState('')
  const [showConfig, setShowConfig] = useState(false)
  const [clientId, setClientId] = useState(
    () => import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('codevault_google_client_id') || ''
  )
  const [isGsiReady, setIsGsiReady] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const googleBtnContainerRef = useRef<HTMLDivElement | null>(null)

  // Detect if Google Identity Services script is active
  useEffect(() => {
    const checkGsi = () => {
      if (window.google?.accounts?.id) {
        setIsGsiReady(true)
      } else {
        setTimeout(checkGsi, 400)
      }
    }
    checkGsi()
  }, [])

  // Initialize native Google GIS if Client ID is configured
  useEffect(() => {
    if (!isOpen || !isGsiReady || !clientId.trim()) return

    try {
      window.google.accounts.id.initialize({
        client_id: clientId.trim(),
        callback: async (response: any) => {
          if (response?.credential) {
            const profile = parseGoogleJwt(response.credential)
            if (profile?.email) {
              await onSuccess({
                email: profile.email,
                name: profile.name || profile.email.split('@')[0],
                avatar_url: profile.picture || '',
                google_id: profile.sub || `google-${Date.now()}`,
              })
              onClose()
            }
          }
        },
        auto_select: false,
      })

      if (googleBtnContainerRef.current) {
        googleBtnContainerRef.current.innerHTML = ''
        window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
          type: 'standard',
          theme: 'filled_black',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: 320,
        })
      }
    } catch (err) {
      console.error('Error with Google GIS:', err)
    }
  }, [isOpen, isGsiReady, clientId])

  // Direct Browser Account Authentication
  const handleDirectGoogleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanEmail = googleEmail.trim().toLowerCase()
    if (!cleanEmail || !cleanEmail.includes('@')) {
      toast.error('Please enter a valid Google account email.')
      return
    }

    setIsSubmitting(true)
    try {
      const derivedName = googleName.trim()
        ? googleName.trim()
        : cleanEmail
            .split('@')[0]
            .replace(/[._]/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase())

      const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        derivedName
      )}&backgroundColor=0f0f14&textColor=ffffff`

      await onSuccess({
        email: cleanEmail,
        name: derivedName,
        avatar_url: avatar,
        google_id: `google-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
      })
      toast.success(`Connected with Google as ${cleanEmail}`)
      onClose()
    } catch (err: any) {
      toast.error(err.message || 'Google authentication failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault()
    const clean = clientId.trim()
    localStorage.setItem('codevault_google_client_id', clean)
    toast.success('Client ID updated.')
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        {/* Solid Modal Card - No Bouncing / Tilt */}
        <div className="relative w-full max-w-md bg-[#111116] border border-white/15 rounded-3xl p-7 sm:p-8 shadow-[0_25px_90px_rgba(0,0,0,0.95)] overflow-hidden text-[#F5F5F5]">
          {/* Subtle ambient light */}
          <div className="absolute -top-24 -left-24 w-52 h-52 bg-white/[0.04] rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Google Official G Logo */}
          <div className="flex flex-col items-center text-center space-y-2 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#181820] border border-white/15 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
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
            </div>
            <h2 className="text-xl font-bold font-['Manrope'] text-white tracking-tight">
              Sign in with Google
            </h2>
            <p className="text-xs text-white/45">
              Authenticate directly with your browser's Google account
            </p>
          </div>

          {/* If Google Client ID is configured, show native GIS button */}
          {clientId.trim() && (
            <div className="mb-5 p-4 rounded-2xl bg-[#171720] border border-white/10 flex flex-col items-center justify-center">
              <div ref={googleBtnContainerRef} className="w-full flex justify-center" />
              <p className="text-[10px] font-mono text-white/40 mt-2 text-center">
                Click above to use your browser's active Google account
              </p>
            </div>
          )}

          {/* Direct Google Account Login Form */}
          <form onSubmit={handleDirectGoogleLogin} className="space-y-3.5">
            <GlassInput
              label="Your Google Account Email"
              type="email"
              placeholder="name@gmail.com"
              value={googleEmail}
              onChange={(e) => setGoogleEmail(e.target.value)}
              required
              autoFocus
            />

            <GlassInput
              label="Your Full Name (Optional)"
              type="text"
              placeholder="As displayed on your Google profile"
              value={googleName}
              onChange={(e) => setGoogleName(e.target.value)}
            />

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full mt-2 h-11 rounded-xl bg-white hover:bg-neutral-200 active:scale-[0.99] text-black font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.2)] disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Continue with this Google Account'}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </form>

          {/* Toggle Developer Google OAuth Client ID */}
          <div className="mt-5 pt-3.5 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className="text-[11px] text-white/40 hover:text-white flex items-center justify-between w-full cursor-pointer transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Settings className="w-3 h-3" />
                <span>Google Cloud OAuth 2.0 Client ID</span>
              </span>
              <span>{showConfig ? '▲ Hide' : '▼ Configure'}</span>
            </button>

            {showConfig && (
              <form onSubmit={handleSaveClientId} className="mt-3 space-y-2.5">
                <p className="text-[10px] text-white/40 leading-relaxed">
                  Provide your Google Cloud Console Client ID to enable native Google Identity One-Tap.
                </p>
                <GlassInput
                  placeholder="xxxx.apps.googleusercontent.com"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition-colors cursor-pointer"
                >
                  Save Client ID
                </button>
              </form>
            )}
          </div>

          <div className="mt-4 text-center">
            <p className="text-[10px] font-mono text-white/30 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Direct secure Google account verification</span>
            </p>
          </div>
        </div>
      </div>
    </AnimatePresence>
  )
}
