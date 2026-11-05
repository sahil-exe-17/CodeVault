import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, type = 'text', className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const computedType = isPassword ? (showPassword ? 'text' : 'password') : type

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-medium text-[var(--text-muted)] tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3 text-[var(--text-dim)] flex items-center pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            type={computedType}
            className={`w-full bg-[var(--bg-input)] text-[var(--text-main)] placeholder-[var(--text-dim)] text-sm rounded-lg border border-[var(--border-subtle)] focus:border-[var(--border-hover)] focus:outline-none focus:ring-0 transition-colors py-2 ${
              icon ? 'pl-9' : 'pl-3'
            } ${isPassword ? 'pr-9' : 'pr-3'} ${error ? 'border-red-500' : ''} ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-2.5 text-[var(--text-dim)] hover:text-[var(--text-main)] transition-colors cursor-pointer p-1"
              title={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
