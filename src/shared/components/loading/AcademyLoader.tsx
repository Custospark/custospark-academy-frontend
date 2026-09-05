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
        fullPage && 'flex min-h-screen items-center justify-center bg-surface-page',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <img
          src="/custospark_academy_logo.png"
          alt="Custospark Academy"
          className="h-12 w-12 rounded-xl object-contain shadow-md"
        />
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500" />
          <span
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-academy-orange"
            style={{ animationDelay: '0.15s' }}
          />
          <span
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400"
            style={{ animationDelay: '0.3s' }}
          />
        </div>
      </div>
    </div>
  )
}