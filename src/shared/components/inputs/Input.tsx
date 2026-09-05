import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || props.name

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border bg-surface-input px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted',
            'transition-colors duration-200 focus:outline-none focus:ring-2',
            error
              ? 'border-semantic-error focus:ring-semantic-error/40'
              : 'border-border-default focus:border-border-focus focus:ring-border-focus/30',
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-semantic-error">{error}</p>}
        {!error && hint && <p className="mt-1.5 text-xs text-text-muted">{hint}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'