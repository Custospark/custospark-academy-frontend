import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface-page cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-700 focus:ring-blue-500 shadow-sm',
  secondary: 'bg-academy-orange text-white hover:bg-orange-600 active:bg-orange-600 focus:ring-academy-orange shadow-sm',
  outline: 'border border-border-default bg-transparent text-text-secondary hover:bg-surface-card hover:border-border-strong hover:text-white focus:ring-blue-500',
  danger: 'bg-semantic-error text-white hover:bg-red-700 active:bg-red-800 focus:ring-semantic-error shadow-sm',
  ghost: 'text-text-secondary hover:bg-surface-card hover:text-white active:bg-surface-card-hover focus:ring-blue-500',
}

const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'