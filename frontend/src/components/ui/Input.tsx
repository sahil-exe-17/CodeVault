import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
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
            className={`w-full bg-[var(--bg-input)] text-[var(--text-main)] placeholder-[var(--text-dim)] text-sm rounded-lg border border-[var(--border-subtle)] focus:border-[var(--border-hover)] focus:outline-none focus:ring-0 transition-colors py-2 ${
              icon ? 'pl-9 pr-3' : 'px-3'
            } ${error ? 'border-red-500' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

