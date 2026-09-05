import { GraduationCap } from 'lucide-react'
import { cn } from '../../utils/cn'

interface AcademyLoaderProps {
  fullPage?: boolean
  className?: string
}

/**
 * Branded full-page/block loader (mirrors CustosellLoader).
 */
export function AcademyLoader({ fullPage = false, className }: AcademyLoaderProps) {
  return (
    <div
      className={cn(
        fullPage && 'flex min-h-screen items-center justify-center bg-gray-50',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl cta-gradient text-white shadow-md shadow-electric-blue/20">
          <GraduationCap className="h-7 w-7" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-electric-blue" />
          <span
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-academy-orange"
            style={{ animationDelay: '0.15s' }}
          />
          <span
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-custospark-blue"
            style={{ animationDelay: '0.3s' }}
          />
        </div>
      </div>
    </div>
  )
}