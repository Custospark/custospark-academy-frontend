import { cn } from '../../utils/cn'

interface AcademyLoaderProps {
  message?: string
  className?: string
  /** Full-screen overlay loader (initial route load, auth redirects). */
  fullPage?: boolean
  /** Compact inline loader for buttons/small blocks. */
  size?: 'sm' | 'md' | 'lg'
  /** When false, renders nothing (lets callers keep the component mounted). */
  show?: boolean
  /** When true, renders a block with a min-height suitable for sections. */
  block?: boolean
}

/**
 * Academy branded loader - an orbiting graduation cap with a spark node,
 * echoing the logo's orbital DNA without copying Custosell's concentric arcs.
 */
export function AcademyLoader({
  message,
  className,
  fullPage = false,
  size = 'md',
  show = true,
  block = false,
}: AcademyLoaderProps) {
  if (!show) return null

  const cap = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-14 w-14' : 'h-11 w-11'
  const ring = size === 'sm' ? 'h-16 w-16' : size === 'lg' ? 'h-28 w-28' : 'h-24 w-24'

  return (
    <div
      className={cn(
        fullPage
          ? 'fixed inset-0 z-50 flex items-center justify-center bg-surface-page'
          : block
            ? 'flex min-h-48 w-full items-center justify-center'
            : 'flex items-center justify-center py-10',
        className,
      )}
      role="status"
      aria-label="Loading Custospark Academy"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center">
          {/* Orbital rings */}
          <div className={cn('relative', ring)}>
            <svg viewBox="0 0 96 96" fill="none" aria-hidden className="h-full w-full">
              <defs>
                <linearGradient id="academy-orbit-1" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#008bfa" />
                  <stop offset="100%" stopColor="#02aafa" />
                </linearGradient>
                <linearGradient id="academy-orbit-2" x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f86803" />
                  <stop offset="100%" stopColor="#fc9103" />
                </linearGradient>
              </defs>

              {/* Outer blue ring (clockwise) */}
              <circle
                cx="48"
                cy="48"
                r="44"
                stroke="url(#academy-orbit-1)"
                strokeWidth="2"
                strokeDasharray="5 9"
                strokeLinecap="round"
                className="animate-academy-orbit origin-center"
              />
              {/* Inner orange ring (counter) */}
              <circle
                cx="48"
                cy="48"
                r="36"
                stroke="url(#academy-orbit-2)"
                strokeWidth="1.5"
                strokeDasharray="3 8"
                strokeLinecap="round"
                className="animate-academy-orbit-reverse origin-center animate-academy-orbit-fade"
              />
            </svg>

            {/* Orbiting spark node */}
            <div className="animate-academy-orbit absolute inset-0">
              <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
                <span className="block h-2.5 w-2.5 rounded-full bg-academy-orange shadow-[0_0_10px_rgba(248,104,3,0.9)]" />
              </span>
            </div>
          </div>

          {/* Graduation cap center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={cn(
                cap,
                'flex items-center justify-center rounded-full bg-surface-card text-white shadow-lg shadow-blue-500/20 ring-1 ring-border-default',
              )}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-3/5 w-3/5 text-blue-300">
                <path d="M22 10L12 5 2 10l10 5 10-5z" />
                <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
              </svg>
            </div>
          </div>
        </div>

        {message && (
          <p className="animate-pulse text-sm text-text-secondary">{message}</p>
        )}
      </div>
    </div>
  )
}