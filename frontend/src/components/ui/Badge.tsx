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
      'bg-[rgba(255,255,255,0.06)] text-[var(--text-muted)] border border-[var(--border-subtle)] font-medium rounded',
    outline:
      'bg-transparent text-[var(--text-muted)] border border-[rgba(255,255,255,0.12)] font-medium rounded',
    mono:
      'bg-[var(--bg-card)] text-[#E0E0E0] border border-[var(--border-subtle)] font-mono text-[11px] rounded tracking-wide',
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

