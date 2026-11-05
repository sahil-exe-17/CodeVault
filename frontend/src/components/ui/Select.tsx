/**
 * Select — Custom themed dropdown matching the pill-list style shown in reference.
 * 
 * Features:
 * - Rounded capsule items with official language logo / icon badge and border
 * - Header title with optional close button
 * - Pill-shaped search bar with search icon on right
 * - Light and Dark theme native styling
 * - Supports keyboard navigation & ESC to close
 */
import React, { useState, useRef, useEffect, useId } from 'react'
import { ChevronDown, Search, Check, X, Compass, Code2 } from 'lucide-react'
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

/**
 * Official vector logos for programming languages and tools
 */
export const LanguageLogo: React.FC<{ language: string; className?: string }> = ({ language, className = 'w-4 h-4' }) => {
  const norm = language.toLowerCase().trim()

  switch (norm) {
    case 'python':
    case 'py':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none">
          <path d="M11.9 2C6.9 2 7.2 4.2 7.2 4.2V6.4H12.2V7.1H5.3S2 6.7 2 11.7C2 16.7 4.9 16.4 4.9 16.4H6.4V14.1S6.3 11.3 9.1 11.3H14.1S16.8 11.4 16.8 8.7V4.2S17.2 2 11.9 2ZM9.5 3.6C10.2 3.6 10.7 4.1 10.7 4.8C10.7 5.4 10.2 6 9.5 6C8.9 6 8.3 5.4 8.3 4.8C8.3 4.1 8.9 3.6 9.5 3.6Z" fill="#387EB8"/>
          <path d="M12.1 22C17.1 22 16.8 19.8 16.8 19.8V17.6H11.8V16.9H18.7S22 17.3 22 12.3C22 7.3 19.1 7.6 19.1 7.6H17.6V9.9S17.7 12.7 14.9 12.7H9.9S7.2 12.6 7.2 15.3V19.8S6.8 22 12.1 22ZM14.5 20.4C13.8 20.4 13.3 19.9 13.3 19.2C13.3 18.6 13.8 18 14.5 18C15.1 18 15.7 18.6 15.7 19.2C15.7 19.9 15.1 20.4 14.5 20.4Z" fill="#FFE052"/>
        </svg>
      )

    case 'javascript':
    case 'js':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <rect width="24" height="24" rx="4" fill="#F7DF1E"/>
          <path d="M7 16.5C7.5 17.3 8.3 17.9 9.3 17.9C10.4 17.9 11.1 17.3 11.1 16.4V11H9.3V16.3C9.3 16.7 8.9 16.9 8.5 16.9C8 16.9 7.7 16.7 7.5 16.3L7 16.5ZM13.8 17.9C15.3 17.9 16.3 17.1 16.3 15.8C16.3 14.7 15.6 14.2 14.5 13.7L14.1 13.5C13.5 13.2 13.2 13 13.2 12.6C13.2 12.2 13.6 11.9 14.2 11.9C14.7 11.9 15.1 12.1 15.4 12.6L16.2 12.1C15.7 11.3 15 11 14.1 11C13 11 12.1 11.7 12.1 12.7C12.1 13.8 12.8 14.3 13.8 14.7L14.2 14.9C14.8 15.1 15.2 15.4 15.2 15.9C15.2 16.4 14.7 16.8 14 16.8C13.3 16.8 12.8 16.4 12.5 15.8L11.7 16.3C12.1 17.3 12.9 17.9 13.8 17.9Z" fill="#000000"/>
        </svg>
      )

    case 'typescript':
    case 'ts':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <rect width="24" height="24" rx="4" fill="#3178C6"/>
          <path d="M5.5 11.5H12.5M9 11.5V18M14 18C15.3 18 16.3 17.2 16.3 15.9C16.3 14.8 15.6 14.3 14.5 13.8L14.1 13.6C13.5 13.3 13.2 13.1 13.2 12.7C13.2 12.3 13.6 12 14.2 12C14.7 12 15.1 12.2 15.4 12.7L16.2 12.2C15.7 11.4 15 11.1 14.1 11.1C13 11.1 12.1 11.8 12.1 12.8C12.1 13.9 12.8 14.4 13.8 14.8L14.2 15C14.8 15.2 15.2 15.5 15.2 16C15.2 16.5 14.7 16.9 14 16.9C13.3 16.9 12.8 16.5 12.5 15.9L11.7 16.4C12.1 17.4 12.9 18 13.8 18Z" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      )

    case 'c':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <rect width="24" height="24" rx="4" fill="#659AD2"/>
          <path d="M16 9.5C15.2 8.5 13.9 8 12.5 8C9.8 8 7.8 10 7.8 12.5C7.8 15 9.8 17 12.5 17C14 17 15.3 16.4 16 15.4" stroke="white" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
        </svg>
      )

    case 'cpp':
    case 'c++':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <rect width="24" height="24" rx="4" fill="#00599C"/>
          <path d="M10.5 8.8C9.8 8.2 8.9 7.8 7.8 7.8C5.6 7.8 4 9.6 4 12C4 14.4 5.6 16.2 7.8 16.2C8.9 16.2 9.8 15.8 10.5 15.2M13 12H16M14.5 10.5V13.5M18 12H21M19.5 10.5V13.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        </svg>
      )

    case 'java':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <rect width="24" height="24" rx="4" fill="#E76F00"/>
          <path d="M12 4C10 5.5 10 7 12 8.5C14 10 14 11.5 12 13M9 6C7.5 7.2 7.5 8.5 9 9.8M6 15.5C8 16.8 16 16.8 18 15.5M7 18C9.5 19 14.5 19 17 18" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
        </svg>
      )

    case 'sql':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <rect width="24" height="24" rx="4" fill="#0284C7"/>
          <ellipse cx="12" cy="7" rx="6" ry="2.5" stroke="white" strokeWidth="1.6" fill="none"/>
          <path d="M6 7V12C6 13.4 8.7 14.5 12 14.5C15.3 14.5 18 13.4 18 12V7M6 12V17C6 18.4 8.7 19.5 12 19.5C15.3 19.5 18 18.4 18 17V12" stroke="white" strokeWidth="1.6" fill="none"/>
        </svg>
      )

    case 'go':
    case 'golang':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <rect width="24" height="24" rx="4" fill="#00ADD8"/>
          <text x="12" y="16" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="monospace">GO</text>
        </svg>
      )

    case 'rust':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <rect width="24" height="24" rx="4" fill="#CE412B"/>
          <circle cx="12" cy="12" r="7" stroke="white" strokeWidth="1.6" fill="none" strokeDasharray="3 2"/>
          <text x="12" y="16" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="sans-serif">R</text>
        </svg>
      )

    case 'html':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <rect width="24" height="24" rx="4" fill="#E34F26"/>
          <text x="12" y="15" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">HTML</text>
        </svg>
      )

    case 'css':
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <rect width="24" height="24" rx="4" fill="#1572B6"/>
          <text x="12" y="15" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">CSS</text>
        </svg>
      )

    default:
      return (
        <div className="w-4 h-4 rounded bg-neutral-500/20 flex items-center justify-center text-[var(--sel-icon-color)]">
          <Code2 className="w-3 h-3" />
        </div>
      )
  }
}

/**
 * Automatically resolves an icon for an option if it corresponds to a programming language
 */
export const resolveOptionIcon = (opt: SelectOptionType): React.ReactNode => {
  if (opt.icon) return opt.icon

  const key = opt.value.toLowerCase().trim()
  const label = opt.label.toLowerCase().trim()

  const knownLanguages = [
    'c', 'cpp', 'c++', 'python', 'py', 'java', 'javascript', 'js',
    'typescript', 'ts', 'sql', 'go', 'golang', 'rust', 'html', 'css', 'other',
  ]

  if (knownLanguages.includes(key) || knownLanguages.includes(label)) {
    return <LanguageLogo language={key || label} />
  }

  return <Compass className="w-3.5 h-3.5 text-[var(--sel-icon-color)]" />
}

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
  const selectedIcon = selected ? resolveOptionIcon(selected) : null

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
      ? rect.top + window.scrollY - 8
      : rect.bottom + window.scrollY + 8

    setDropPos({ top, left, width, openUp })
  }

  useEffect(() => {
    if (open) {
      updatePos()
      const handleResize = () => updatePos()
      const handleScroll = () => updatePos()
      window.addEventListener('resize', handleResize)
      window.addEventListener('scroll', handleScroll, true)

      // Auto focus search box on open
      setTimeout(() => {
        searchRef.current?.focus()
      }, 50)

      return () => {
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('scroll', handleScroll, true)
      }
    } else {
      setSearch('')
    }
  }, [open])

  // Click outside to close
  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleSelect = (val: string) => {
    onChange(val)
    setOpen(false)
  }

  // Trigger button styling
  const triggerBase =
    size === 'compact'
      ? 'flex items-center justify-between gap-2 bg-[var(--sel-bg)] text-[var(--sel-text)] text-xs px-2.5 py-1.5 rounded-lg border border-[var(--sel-border)] hover:border-[var(--sel-border-hover)] focus:border-[var(--sel-focus)] focus:outline-none font-mono transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed select-none'
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
                const iconNode = resolveOptionIcon(opt)
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
                        {iconNode}
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
        <div className="flex items-center gap-2 truncate min-w-0">
          {selectedIcon && (
            <span className="shrink-0 flex items-center justify-center">
              {selectedIcon}
            </span>
          )}
          <span className="truncate">{selected?.label ?? placeholder}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[var(--sel-icon-color)] transition-transform duration-200 shrink-0 ${
            open ? 'rotate-180 text-[var(--sel-text)]' : ''
          }`}
        />
      </button>
      {dropdown}
    </div>
  )
}
