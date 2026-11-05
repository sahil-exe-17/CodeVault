import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Terminal, Cpu } from 'lucide-react'

interface IntroSplashProps {
  onComplete?: () => void
  forceShow?: boolean
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete, forceShow = false }) => {
  const [isVisible, setIsVisible] = useState(() => {
    if (forceShow) return true
    const shown = sessionStorage.getItem('codevault_intro_shown')
    return !shown
  })

  const [phase, setPhase] = useState<'grid' | 'monolith' | 'type' | 'ready'>('grid')
  const [progress, setProgress] = useState(0)
  const [glitchActive, setGlitchActive] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const handleReplay = () => {
      setProgress(0)
      setPhase('grid')
      setIsVisible(true)
    }
    window.addEventListener('codevault:replay-intro', handleReplay)
    return () => window.removeEventListener('codevault:replay-intro', handleReplay)
  }, [])

  // Kinetic phase timing sequence
  useEffect(() => {
    if (!isVisible) return

    setPhase('grid')
    const tMonolith = setTimeout(() => {
      setPhase('monolith')
      setGlitchActive(true)
      setTimeout(() => setGlitchActive(false), 240)
    }, 450)

    const tType = setTimeout(() => {
      setPhase('type')
    }, 1100)

    const tReady = setTimeout(() => {
      setPhase('ready')
    }, 2000)

    // Progress counter (0 to 100)
    const startTime = Date.now()
    const totalDuration = 2700 // Crisp, punchy 2.7s duration
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const p = Math.min(100, Math.floor((elapsed / totalDuration) * 100))
      setProgress(p)

      if (p >= 100) {
        clearInterval(interval)
        setTimeout(() => handleFinish(), 250)
      }
    }, 25)

    // Keyboard trigger (Enter or Space to skip immediately)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        handleFinish()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(tMonolith)
      clearTimeout(tType)
      clearTimeout(tReady)
      clearInterval(interval)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isVisible])

  // Canvas background for subtle architectural grid lines & particle sparks
  useEffect(() => {
    if (!isVisible) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Grid nodes
    let t = 0
    const render = () => {
      t += 0.02
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, width, height)

      // Fine architectural grid (100px cells)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)'
      ctx.lineWidth = 1
      const gridSize = 80
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Optical crosshairs at intersections
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)'
      for (let x = gridSize; x < width; x += gridSize * 3) {
        for (let y = gridSize; y < height; y += gridSize * 3) {
          ctx.fillRect(x - 2, y, 5, 1)
          ctx.fillRect(x, y - 2, 1, 5)
        }
      }

      // Traveling kinetic horizontal scan line
      const scanY = ((t * 80) % (height + 200)) - 100
      const grad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 30)
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)')
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)')
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = grad
      ctx.fillRect(0, scanY - 30, width, 60)

      animId = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [isVisible])

  const handleFinish = () => {
    sessionStorage.setItem('codevault_intro_shown', 'true')
    setIsVisible(false)
    if (onComplete) onComplete()
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        key="brutalist-intro"
        initial={{ opacity: 1 }}
        exit={{
          opacity: 0,
          scale: 1.15,
          filter: 'blur(16px)',
          transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
        }}
        onClick={handleFinish}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-between p-6 sm:p-12 bg-black text-[#F5F5F5] select-none cursor-pointer overflow-hidden"
      >
        {/* Background Architectural Canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* 1. Top Industrial Monospace Header */}
        <div className="relative z-10 w-full max-w-6xl flex items-center justify-between text-[11px] font-mono tracking-widest text-white/40 uppercase">
          <div className="flex items-center gap-3">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/80 font-bold">SYSTEM // CODEVAULT CORE</span>
            <span className="hidden sm:inline text-white/20">|</span>
            <span className="hidden sm:inline text-white/30">REF. 5693-TANGIBLE</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-mono text-white/60">EST. 2026 // BUILD 4.0</span>
            <span className="px-2 py-0.5 rounded bg-white/10 border border-white/15 text-[10px] text-white/80">
              STABLE
            </span>
          </div>
        </div>

        {/* 2. Center Stage: Monolithic Logo & Kinetic Brutalist Typography */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center max-w-4xl px-4">
          {/* Logo Monolith with Laser Slicing */}
          <div className="relative mb-8 sm:mb-12 flex items-center justify-center">
            {/* Chromatic Offset Glitch Shadow (Red/Cyan offset) */}
            {glitchActive && (
              <>
                <motion.div
                  initial={{ opacity: 0.8, x: -8, y: -2 }}
                  animate={{ opacity: 0, x: 0, y: 0 }}
                  className="absolute w-36 h-36 sm:w-48 sm:h-48 pointer-events-none"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(255, 0, 80, 0.8))' }}
                >
                  <img
                    src="/logo-tight.png"
                    alt=""
                    className="w-full h-full object-contain filter invert opacity-80"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0.8, x: 8, y: 2 }}
                  animate={{ opacity: 0, x: 0, y: 0 }}
                  className="absolute w-36 h-36 sm:w-48 sm:h-48 pointer-events-none"
                  style={{ filter: 'drop-shadow(0 0 10px rgba(0, 240, 255, 0.8))' }}
                >
                  <img
                    src="/logo-tight.png"
                    alt=""
                    className="w-full h-full object-contain filter invert opacity-80"
                  />
                </motion.div>
              </>
            )}

            {/* Main Stark White Monolithic Logo Mark */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0, rotate: -8 }}
              animate={
                phase !== 'grid'
                  ? { scale: 1, opacity: 1, rotate: 0 }
                  : { scale: 0.4, opacity: 0, rotate: -8 }
              }
              transition={{
                type: 'spring',
                stiffness: 340,
                damping: 22,
                mass: 0.8,
              }}
              className="relative w-28 h-28 sm:w-44 sm:h-44 md:w-56 md:h-56 flex items-center justify-center"
            >
              {/* Laser Scanning Flare across the glyph */}
              <motion.div
                initial={{ left: '-100%' }}
                animate={{ left: '200%' }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  repeatDelay: 0.8,
                  ease: 'easeInOut',
                }}
                className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 -skew-x-12 pointer-events-none z-20"
              />

              {/* Tightly cropped, bold, solid white glyph */}
              <img
                src="/logo-tight.png"
                alt="CodeVault Monolith"
                className="w-full h-full object-contain filter drop-shadow-[0_0_35px_rgba(255,255,255,0.7)] z-10"
              />
            </motion.div>
          </div>

          {/* Kinetic Brutalist Typography: CODEVAULT */}
          <div className="overflow-hidden mb-2 sm:mb-3">
            <motion.h1
              initial={{ y: 80, opacity: 0 }}
              animate={
                phase === 'type' || phase === 'ready'
                  ? { y: 0, opacity: 1 }
                  : { y: 80, opacity: 0 }
              }
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-2xl sm:text-5xl md:text-7xl font-extrabold tracking-[0.16em] sm:tracking-[0.35em] font-['Manrope'] text-white uppercase whitespace-nowrap"
            >
              CODEVAULT
            </motion.h1>
          </div>

          {/* Subtitle with Tactile Engineering Aesthetic */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={
              phase === 'type' || phase === 'ready'
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 10 }
            }
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2.5 text-[10px] sm:text-sm font-mono tracking-[0.15em] sm:tracking-[0.2em] uppercase text-white/50"
          >
            <span>ACADEMIC CODE SYSTEM</span>
            <span className="text-white/20">•</span>
            <span>AI LAB ARCHIVE</span>
          </motion.div>

          {/* Telemetry Progress Bar & Data Stream */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="w-64 sm:w-80 mt-8 space-y-2"
          >
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden p-[1px]">
              <div
                className="h-full bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.9)] transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-white/40 tracking-wider">
              <span>INITIALIZING CORE</span>
              <span className="text-white font-bold">{progress}%</span>
            </div>
          </motion.div>
        </div>

        {/* 3. Bottom Navigation / Skip Command Bar */}
        <div className="relative z-10 w-full max-w-6xl flex items-center justify-between text-xs font-mono text-white/40">
          <div className="hidden sm:flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/70 text-[10px]">
              SPACE / CLICK
            </span>
            <span>TO ENTER VAULT</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={handleFinish}
            className="ml-auto px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs flex items-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:bg-neutral-200 transition-all cursor-pointer"
          >
            <span>ENTER VAULT</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
