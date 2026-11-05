/**
 * Select — Custom themed dropdown matching the pill-list style shown in reference.
 * 
 * Features:
 * - Rounded capsule items with icon badge and border
 * - Header title with optional close button
 * - Pill-shaped search bar with search icon on right
 * - Light and Dark theme native styling
 * - Supports keyboard navigation & ESC to close
 */
import React, { useState, useRef, useEffect, useId } from 'react'
import { ChevronDown, Search, Check, X, Code2, Tag, Compass, Sparkles } from 'lucide-react'
import { createPortal } from 'react-dom'

export interface SelectOptionType {
  value: string
  label: string
  icon?: React.ReactNode
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options?: SelectOptionType[]
  children?: React.ReactNode
  placeholder?: string
  /** Title shown at the top of the dropdown modal/popover */
  title?: string
  /** compact = small inline variant (code editor toolbar). default = full input size */
  size?: 'default' | 'compact'
  className?: string
  disabled?: boolean
  searchable?: boolean
  id?: string
}

export const SelectOption: React.FC<{ value: string; children: React.ReactNode; icon?: React.ReactNode }> = () => null

// Helper to extract options from JSX children if provided
const parseChildOptions = (children: React.ReactNode): SelectOptionType[] => {
  const result: SelectOptionType[] = []
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return
    const props = child.props as { value?: string; children?: React.ReactNode; icon?: React.ReactNode }
    if (props.value !== undefined) {
      result.push({
        value: String(props.value),
        label: String(props.children ?? props.value),
        icon: props.icon,
      })
    }
  })
  return result
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options: optionsProp,
  children,
  placeholder = 'Select…',
  title,
  size = 'default',
  className = '',
  disabled = false,
  searchable,
  id,
}) => {
  const uid = useId()
  const selectId = id ?? uid

  const options: SelectOptionType[] = optionsProp ?? parseChildOptions(children)
  const shouldSearch = searchable ?? (options.length > 5)

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0, openUp: false })

  const selected = options.find((o) => o.value === value)

  const filtered = search.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : options

  const updatePos = () => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const dropdownHeight = 320
    const openUp = spaceBelow < dropdownHeight && rect.top > dropdownHeight

    const width = Math.max(rect.width, size === 'compact' ? 240 : 280)

    // Adjust left if overflowing screen
    let left = rect.left + window.scrollX
    if (left + width > window.innerWidth - 16) {
      left = window.innerWidth - width - 16
    }
    if (left < 16) left = 16

    const top = openUp
      ? rect.top + window.scrollY - dropdownHeight - 6
      : rect.bottom + window.scrollY + 6

    setDropPos({ top, left, width, openUp })
  }

  useEffect(() => {
    if (!open) {
      setSearch('')
      return
    }
    updatePos()
    const t = setTimeout(() => searchRef.current?.focus(), 30)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onMouseDown = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    const onResizeOrScroll = () => {
      if (open) updatePos()
    }

    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('scroll', onResizeOrScroll, true)
    window.addEventListener('resize', onResizeOrScroll)
    return () => {
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('scroll', onResizeOrScroll, true)
      window.removeEventListener('resize', onResizeOrScroll)
    }
  }, [open])

  const handleSelect = (val: string) => {
    onChange(val)
    setOpen(false)
  }

  // Trigger button styling
  const triggerBase =
    size === 'compact'
      ? 'flex items-center justify-between gap-2 bg-[var(--sel-bg)] text-[var(--sel-text)] text-xs px-2.5 py-1 rounded-lg border border-[var(--sel-border)] hover:border-[var(--sel-border-hover)] focus:border-[var(--sel-focus)] focus:outline-none font-mono transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed select-none'
      : 'flex w-full items-center justify-between gap-2 bg-[var(--sel-bg)] text-[var(--sel-text)] text-sm px-3.5 py-2.5 rounded-xl border border-[var(--sel-border)] hover:border-[var(--sel-border-hover)] focus:border-[var(--sel-focus)] focus:outline-none transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed select-none'

  // Portal dropdown
  const dropdown = open
    ? createPortal(
        <div
          ref={dropdownRef}
          className="cv-pill-dropdown-container"
          style={{
            position: 'absolute',
            top: dropPos.top,
            left: dropPos.left,
            width: dropPos.width,
            zIndex: 99999,
          }}
        >
          {/* Header row with title and close X button */}
          <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
            <span className="text-xs font-semibold text-[var(--sel-text)] font-['Manrope'] tracking-tight">
              {title || (placeholder !== 'Select…' ? placeholder : 'Select Option')}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-full text-[var(--sel-text-muted)] hover:text-[var(--sel-text)] hover:bg-[var(--sel-item-hover-bg)] transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pill Search input with right search icon */}
          {shouldSearch && (
            <div className="px-3 pb-2.5">
              <div className="cv-pill-search-box">
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="cv-pill-search-input"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setOpen(false)
                  }}
                />
                <Search className="w-4 h-4 text-[var(--sel-icon-color)] flex-shrink-0" />
              </div>
            </div>
          )}

          {/* Pill options list */}
          <div className="cv-pill-options-list" role="listbox">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-xs text-[var(--sel-empty-color)] font-mono">
                No matching options
              </div>
            ) : (
              filtered.map((opt) => {
                const isSelected = opt.value === value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    className={`cv-pill-item-btn ${isSelected ? 'cv-pill-item-btn--active' : ''}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="cv-pill-icon-bubble">
                        {opt.icon || (
                          <Compass className="w-3.5 h-3.5 text-[var(--sel-icon-color)]" />
                        )}
                      </div>
                      <span className="text-xs font-medium text-[var(--sel-text)] truncate text-left">
                        {opt.label}
                      </span>
                    </div>

                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[var(--sel-check-color)] flex-shrink-0 ml-2" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>,
        document.body
      )
    : null

  return (
    <div className={`relative inline-block ${size === 'compact' ? '' : 'w-full'} ${className}`} id={selectId}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={triggerBase}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{selected?.label ?? placeholder}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[var(--sel-icon-color)] transition-transform duration-200 ${
            open ? 'rotate-180 text-[var(--sel-text)]' : ''
          }`}
        />
      </button>
      {dropdown}
    </div>
  )
}
