import React from 'react'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-[var(--border-subtle)] rounded-xl bg-[rgba(255,255,255,0.015)] my-4">
      {icon && <div className="text-[var(--text-dim)] mb-3">{icon}</div>}
      <h4 className="text-base font-semibold text-[var(--text-main)] font-['Manrope'] mb-1">
        {title}
      </h4>
      {description && (
        <p className="text-xs text-[var(--text-muted)] max-w-sm mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

