import { useState, type ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, LockKeyhole } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from '../buttons/Button'
import { Input } from '../inputs/Input'
import { cn } from '../../utils/cn'

export type ConfirmTone = 'danger' | 'warning' | 'info' | 'success'

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  title: string
  message: ReactNode
  tone?: ConfirmTone
  confirmLabel?: string
  cancelLabel?: string
  isConfirming?: boolean
  onConfirm: () => void
  /** Require typing the keyword to enable confirm (destructive actions). */
  confirmKeyword?: string
}

const TONE: Record<
  ConfirmTone,
  { icon: typeof AlertTriangle; accent: string; iconColor: string; bar: string }
> = {
  danger: {
    icon: AlertTriangle,
    accent: 'border-semantic-error/40 bg-semantic-error/10',
    iconColor: 'text-semantic-error',
    bar: 'border-t-semantic-error',
  },
  warning: {
    icon: AlertTriangle,
    accent: 'border-semantic-warning/40 bg-semantic-warning/10',
    iconColor: 'text-semantic-warning',
    bar: 'border-t-semantic-warning',
  },
  info: {
    icon: Info,
    accent: 'border-blue-500/40 bg-blue-500/10',
    iconColor: 'text-blue-400',
    bar: 'border-t-blue-500',
  },
  success: {
    icon: CheckCircle2,
    accent: 'border-semantic-success/40 bg-semantic-success/10',
    iconColor: 'text-semantic-success',
    bar: 'border-t-semantic-success',
  },
}

/**
 * Academy tone-based confirmation dialog (delete, warn, info, success).
 */
export function ConfirmDialog({
  open,
  onClose,
  title,
  message,
  tone = 'danger',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isConfirming = false,
  onConfirm,
  confirmKeyword,
}: ConfirmDialogProps) {
  const [keywordValue, setKeywordValue] = useState('')
  const toneConfig = TONE[tone]
  const ToneIcon = toneConfig.icon

  // Reset keyword when the dialog opens/closes.
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) setKeywordValue('')
  }

  const keywordMatch =
    !confirmKeyword ||
    keywordValue.trim().toLowerCase() === confirmKeyword.trim().toLowerCase()

  const confirmDisabled = !keywordMatch || isConfirming

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!isConfirming) onClose()
      }}
      title={title}
      size="sm"
      panelClassName={`border-t-4 ${toneConfig.bar}`}
      showCloseButton={!isConfirming}
    >
      <div className="space-y-5">
        <div className={cn('flex items-start gap-3 rounded-xl border p-4', toneConfig.accent)}>
          <ToneIcon className={cn('mt-0.5 h-5 w-5 shrink-0', toneConfig.iconColor)} aria-hidden />
          <div className="flex-1 text-sm leading-relaxed text-text-secondary">{message}</div>
        </div>

        {confirmKeyword && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Type{' '}
              <code className="rounded bg-surface-input px-1.5 py-0.5 font-mono text-xs text-semantic-error">
                {confirmKeyword}
              </code>{' '}
              to confirm
            </label>
            <Input
              type="text"
              value={keywordValue}
              onChange={(e) => setKeywordValue(e.target.value)}
              placeholder={confirmKeyword}
              autoFocus
              autoComplete="off"
              disabled={isConfirming}
              error={
                !keywordMatch && keywordValue.length > 0 ? 'Keyword does not match.' : undefined
              }
            />
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-text-muted">
              <LockKeyhole className="h-3.5 w-3.5" aria-hidden />
              Keyword must match exactly
            </p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-1">
          <Button variant="outline" onClick={onClose} disabled={isConfirming}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : tone === 'warning' ? 'secondary' : 'primary'}
            onClick={onConfirm}
            disabled={confirmDisabled}
            loading={isConfirming}
          >
            {isConfirming ? 'Working...' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}