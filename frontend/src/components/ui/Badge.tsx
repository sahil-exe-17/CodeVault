import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'outline' | 'mono' | 'solid'
  size?: 'sm' | 'md'
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }

  const variantClasses = {
    default:
      'bg-[rgba(255,255,255,0.06)] text-[#A1A1A1] border border-[rgba(255,255,255,0.09)] font-medium rounded',
    outline:
      'bg-transparent text-[#A1A1A1] border border-[rgba(255,255,255,0.12)] font-medium rounded',
    mono:
      'bg-[#141414] text-[#E0E0E0] border border-[rgba(255,255,255,0.1)] font-mono text-[11px] rounded tracking-wide',
    solid:
      'bg-white text-black font-semibold rounded',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 uppercase tracking-wider ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
