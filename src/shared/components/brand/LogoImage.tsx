import { cn } from '../../utils/cn'

interface LogoImageProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = {
  sm: 'h-9',
  md: 'h-11',
  lg: 'h-14',
} as const

/**
 * Custospark Academy logo - real brand lockup (wordmark baked into the asset).
 * Height-based so the full lockup renders; do not add a separate brand text next to it.
 */
export function LogoImage({ size = 'md', className }: LogoImageProps) {
  return (
    <img
      src="/custospark_academy_logo.png"
      alt="Custospark Academy"
      title="Custospark Academy"
      className={cn(SIZES[size], 'w-auto shrink-0 object-contain', className)}
    />
  )
}