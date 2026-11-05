import React, { useEffect, useRef } from 'react'

export const AuroraBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX / width
      mouseRef.current.targetY = e.clientY / height
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', handleMouseMove)

    let t = 0

    const render = () => {
      t += 0.01

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04

      // Clear with absolute deep black
      ctx.fillStyle = '#050507'
      ctx.fillRect(0, 0, width, height)

      // Mouse subtle offset
      const mouseOffsetX = (mouseRef.current.x - 0.5) * 35
      const mouseOffsetY = (mouseRef.current.y - 0.5) * 20

      // Ambient backlight glow
      const bgGlow = ctx.createRadialGradient(
        width * 0.5 + mouseOffsetX * 0.4,
        height * 0.48 + mouseOffsetY * 0.4,
        10,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.65
      )
      bgGlow.addColorStop(0, 'rgba(147, 51, 234, 0.12)')
      bgGlow.addColorStop(0.3, 'rgba(236, 72, 153, 0.08)')
      bgGlow.addColorStop(0.6, 'rgba(56, 189, 248, 0.05)')
      bgGlow.addColorStop(1, 'rgba(5, 5, 7, 0)')
      ctx.fillStyle = bgGlow
      ctx.fillRect(0, 0, width, height)

      // Silk Ribbon Parameters
      const ribbonWidth = width * 1.35
      const startX = -width * 0.18 + mouseOffsetX
      const baseY = height * 0.52 + mouseOffsetY
      const ribbonSegments = 160

      const getRibbonPoint = (u: number, timeOffset = 0, layerScale = 1) => {
        const p1 = Math.sin(u * 3.8 + t + timeOffset) * 65 * layerScale
        const p2 = Math.cos(u * 5.2 - t * 0.8 + timeOffset) * 45 * layerScale
        const p3 = Math.sin(u * 9.5 + t * 1.2) * 20 * layerScale
        const tilt = (u - 0.5) * -45
        return baseY + p1 + p2 + p3 + tilt
      }

      // Draw Multi-Layer Silk Waves
      const layers = [
        {
          offset: 0,
          scale: 1.0,
          colorStop1: 'rgba(99, 102, 241, 0.35)',
          colorStop2: 'rgba(236, 72, 153, 0.45)',
          colorStop3: 'rgba(251, 146, 60, 0.4)',
          colorStop4: 'rgba(56, 189, 248, 0.3)',
        },
        {
          offset: 0.18,
          scale: 0.94,
          colorStop1: 'rgba(168, 85, 247, 0.28)',
          colorStop2: 'rgba(244, 63, 94, 0.35)',
          colorStop3: 'rgba(250, 204, 21, 0.3)',
          colorStop4: 'rgba(16, 185, 129, 0.25)',
        },
        {
          offset: -0.15,
          scale: 1.06,
          colorStop1: 'rgba(14, 165, 233, 0.25)',
          colorStop2: 'rgba(139, 92, 246, 0.3)',
          colorStop3: 'rgba(244, 63, 94, 0.28)',
          colorStop4: 'rgba(251, 146, 60, 0.2)',
        },
      ]

      ctx.save()
      ctx.globalCompositeOperation = 'screen'

      layers.forEach((layer) => {
        const topPoints: Array<{ x: number; y: number }> = []
        const bottomPoints: Array<{ x: number; y: number }> = []

        const thickness = 55 * layer.scale

        for (let i = 0; i <= ribbonSegments; i++) {
          const u = i / ribbonSegments
          const x = startX + u * ribbonWidth
          const centerCurve = getRibbonPoint(u, layer.offset, layer.scale)

          const angle = Math.cos(u * 4 + t) * 0.45
          const yTop = centerCurve - (thickness * 0.5) * Math.cos(angle)
          const yBottom = centerCurve + (thickness * 0.5) * Math.cos(angle)

          topPoints.push({ x, y: yTop })
          bottomPoints.push({ x, y: yBottom })
        }

        ctx.beginPath()
        topPoints.forEach((p, idx) => {
          if (idx === 0) ctx.moveTo(p.x, p.y)
          else ctx.lineTo(p.x, p.y)
        })
        for (let i = bottomPoints.length - 1; i >= 0; i--) {
          ctx.lineTo(bottomPoints[i].x, bottomPoints[i].y)
        }
        ctx.closePath()

        const grad = ctx.createLinearGradient(startX, baseY - 60, startX + ribbonWidth, baseY + 60)
        grad.addColorStop(0.0, layer.colorStop1)
        grad.addColorStop(0.32, layer.colorStop2)
        grad.addColorStop(0.68, layer.colorStop3)
        grad.addColorStop(1.0, layer.colorStop4)

        ctx.fillStyle = grad
        ctx.filter = 'blur(12px)'
        ctx.fill()
      })

      ctx.filter = 'none'

      // Crisp White Silk Crest Line
      ctx.beginPath()
      for (let i = 0; i <= ribbonSegments; i++) {
        const u = i / ribbonSegments
        const x = startX + u * ribbonWidth
        const y = getRibbonPoint(u, 0, 1.0)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)'
      ctx.lineWidth = 1.6
      ctx.shadowColor = 'rgba(255, 255, 255, 0.95)'
      ctx.shadowBlur = 10
      ctx.stroke()

      // Subtle Secondary Shimmer Ridge
      ctx.beginPath()
      for (let i = 0; i <= ribbonSegments; i++) {
        const u = i / ribbonSegments
        const x = startX + u * ribbonWidth
        const y = getRibbonPoint(u, -0.15, 0.97) + 3
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
      ctx.lineWidth = 1.0
      ctx.shadowColor = 'rgba(236, 72, 153, 0.7)'
      ctx.shadowBlur = 6
      ctx.stroke()
      ctx.restore()

      animFrameRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  )
}
