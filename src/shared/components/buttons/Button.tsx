import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-electric-blue text-white hover:bg-blue-hover active:bg-blue-hover focus:ring-electric-blue shadow-md shadow-electric-blue/25',
  secondary: 'bg-academy-orange text-white hover:bg-bright-orange active:bg-bright-orange focus:ring-academy-orange shadow-md shadow-academy-orange/25',
  outline: 'border border-border-navy bg-transparent text-text-secondary hover:bg-deep-navy hover:border-custospark-blue focus:ring-electric-blue',
  danger: 'bg-academy-red text-white hover:bg-red-700 active:bg-red-800 focus:ring-academy-red shadow-md',
  ghost: 'text-text-secondary hover:bg-deep-navy hover:text-white active:bg-card-navy focus:ring-electric-blue',
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