import React, { useState } from 'react'

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: React.ReactNode
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, icon, className = '', onChange, onKeyDown, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-[11px] font-medium text-[var(--text-dim)] tracking-wide uppercase">
            {label}
          </label>
        )}
        <div className="relative group">
          {/* Subtle Ambient Focus Ring */}
          <div
            className={`absolute -inset-[1px] rounded-xl transition-opacity duration-300 pointer-events-none ${
              isFocused ? 'opacity-100 bg-emerald-500/10 blur-[1px]' : 'opacity-0'
            }`}
          />

          <div
            className={`relative flex items-center bg-[var(--bg-input)] backdrop-blur-md rounded-xl border transition-all duration-200 overflow-hidden ${
              isFocused
                ? 'border-[var(--border-hover)] shadow-sm'
                : 'border-[var(--border-subtle)] hover:border-[var(--border-hover)]'
            } ${className}`}
          >
            {icon && (
              <span className="pl-3.5 pr-1 text-[var(--text-dim)] flex items-center pointer-events-none">
                {icon}
              </span>
            )}

            <input
              ref={ref}
              onFocus={(e) => {
                setIsFocused(true)
                if (onFocus) onFocus(e)
              }}
              onBlur={(e) => {
                setIsFocused(false)
                if (onBlur) onBlur(e)
              }}
              onKeyDown={onKeyDown}
              onChange={onChange}
              className={`w-full bg-transparent text-[var(--text-main)] placeholder-[var(--text-dim)] text-sm py-2.5 px-3.5 focus:outline-none focus:ring-0 ${
                icon ? 'pl-2' : ''
              }`}
              {...props}
            />

            {/* Clean bottom line on focus */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-[1.5px] pointer-events-none transition-opacity duration-200 ${
                isFocused
                  ? 'opacity-100 bg-gradient-to-r from-transparent via-white/70 to-transparent'
                  : 'opacity-0'
              }`}
            />
          </div>
        </div>
      </div>
    )
  }
)

GlassInput.displayName = 'GlassInput'
