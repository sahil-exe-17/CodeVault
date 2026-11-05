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
          <label className="text-xs font-medium text-[#A1A1A1] tracking-wide">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3 text-[#666666] flex items-center pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={`w-full bg-[#111111] text-[#F5F5F5] placeholder-[#555555] text-sm rounded-lg border border-[rgba(255,255,255,0.09)] focus:border-white focus:outline-none focus:ring-0 transition-colors py-2 ${
              icon ? 'pl-9 pr-3' : 'px-3'
            } ${error ? 'border-neutral-400' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-[#A1A1A1] mt-0.5">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

