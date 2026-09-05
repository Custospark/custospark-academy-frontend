import { GraduationCap } from 'lucide-react'
import { cn } from '../../utils/cn'

interface LogoImageProps {
  size?: 'sm' | 'md' | 'lg'
  withWordmark?: boolean
  className?: string
}

const SIZES = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
} as const

/**
 * Custospark Academy logo - graduation cap with Custospark orbital DNA.
 * Replaces the placeholder SVG until the final logo asset is delivered.
 */
export function LogoImage({ size = 'md', withWordmark = true, className }: LogoImageProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          SIZES[size],
          'flex items-center justify-center rounded-xl cta-gradient text-white shadow-lg shadow-electric-blue/20',
        )}
      >
        <GraduationCap className={size === 'lg' ? 'h-8 w-8' : size === 'md' ? 'h-6 w-6' : 'h-5 w-5'} />
      </div>
      {withWordmark && (
        <div className="leading-tight">
          <span className="block font-display text-lg font-bold tracking-tight text-white">
            Custospark <span className="text-custospark-blue">Academy</span>
          </span>
          <span className="block text-[11px] font-medium tracking-wide text-text-muted">
            LEARN · BUILD · LAUNCH
          </span>
        </div>
      )}
    </div>
  )
}