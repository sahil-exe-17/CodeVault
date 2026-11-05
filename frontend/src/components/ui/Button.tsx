import React from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none'

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-sm px-4 py-2.5 gap-2.5',
  }

  const variantClasses = {
    primary:
      'bg-white text-black hover:bg-neutral-200 active:bg-neutral-300 font-semibold shadow-sm',
    secondary:
      'bg-[var(--bg-metric)] text-[var(--text-main)] border border-[var(--border-subtle)] hover:border-[rgba(255,255,255,0.18)] hover:bg-[#1c1c1c]',
    ghost:
      'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-metric)]',
    outline:
      'bg-transparent text-[var(--text-main)] border border-[var(--border-subtle)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.03)]',
    danger:
      'bg-transparent text-[var(--text-main)] border border-[rgba(255,255,255,0.15)] hover:border-white hover:bg-[var(--bg-metric)]',
  }

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}

