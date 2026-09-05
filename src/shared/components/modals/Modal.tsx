import { type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  panelClassName?: string
  showCloseButton?: boolean
}

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
} as const

/**
 * Academy modal shell - navy surface card over a dimmed backdrop.
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = 'md',
  children,
  panelClassName,
  showCloseButton = true,
}: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/70"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              'relative z-10 w-full rounded-2xl border border-border-subtle bg-surface-card shadow-2xl',
              SIZES[size],
              panelClassName,
            )}
          >
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between gap-4 border-b border-border-subtle px-6 py-4">
                <div>
                  {title && <h2 className="font-display text-lg font-bold text-white">{title}</h2>}
                  {subtitle && <p className="mt-0.5 text-sm text-text-secondary">{subtitle}</p>}
                </div>
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-card-hover hover:text-white"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
            <div className="px-6 py-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}