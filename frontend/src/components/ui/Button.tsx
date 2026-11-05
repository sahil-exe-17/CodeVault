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
      'bg-[#171717] text-[#F5F5F5] border border-[rgba(255,255,255,0.09)] hover:border-[rgba(255,255,255,0.18)] hover:bg-[#1c1c1c]',
    ghost:
      'bg-transparent text-[#A1A1A1] hover:text-[#F5F5F5] hover:bg-[rgba(255,255,255,0.05)]',
    outline:
      'bg-transparent text-[#F5F5F5] border border-[rgba(255,255,255,0.09)] hover:border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.03)]',
    danger:
      'bg-transparent text-[#F5F5F5] border border-[rgba(255,255,255,0.15)] hover:border-white hover:bg-[rgba(255,255,255,0.05)]',
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

