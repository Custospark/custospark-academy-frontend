import { cn } from '../../utils/cn'

interface LogoImageProps {
  size?: 'sm' | 'md' | 'lg'
  withWordmark?: boolean
  className?: string
}

const SIZES = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-14 w-14',
} as const

/**
 * Custospark Academy logo - real brand asset (navy square with blue/orange mark).
 */
export function LogoImage({ size = 'md', withWordmark = true, className }: LogoImageProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <img
        src="/custospark_academy_logo.png"
        alt="Custospark Academy"
        title="Custospark Academy"
        className={cn(SIZES[size], 'shrink-0 rounded-lg object-contain')}
      />
      {withWordmark && (
        <div className="leading-tight">
          <span className="block font-display text-lg font-bold tracking-tight text-electric-blue">
            Custospark <span className="text-academy-orange">Academy</span>
          </span>
          <span className="block text-[11px] font-medium tracking-wide text-gray-400">
            LEARN · BUILD · LAUNCH
          </span>
        </div>
      )}
    </div>
  )
}