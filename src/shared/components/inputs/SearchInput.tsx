import type { InputHTMLAttributes } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '../../utils/cn'

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void
}

/**
 * Academy search input - navy surface, search icon, optional clear button.
 */
export function SearchInput({
  className,
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  ...props
}: SearchInputProps) {
  const hasValue = typeof value === 'string' && value.length > 0

  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          'w-full rounded-lg border border-border-default bg-surface-input py-2.5 pl-9 pr-9 text-sm text-text-primary placeholder:text-text-muted',
          'transition-colors focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus/30',
          className,
        )}
        {...props}
      />
      {hasValue && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-card-hover hover:text-white"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}