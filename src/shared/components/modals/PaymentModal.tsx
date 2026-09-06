import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Loader2, RefreshCw, Smartphone, Wallet } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from '../buttons/Button'
import { usePayFee, usePaymentStatus } from '../../api/learner/LearnerCourseQueries'
import { apiErrorMessage } from '../../utils/apiError'
import { useToast } from '../../../app/contexts/useToast'
import { usePaymentPopup } from '../../hooks/usePaymentPopup'
import { PaymentPopupNotice } from '../payments/PaymentPopupNotice'
import type { PaymentFeeType } from '../../types'

const FEE_LABELS: Record<PaymentFeeType, string> = {
  application: 'Application fee',
  tuition: 'Tuition',
  certificate: 'Certificate fee',
}

interface PaymentStepProps {
  enrollmentId: number
  courseTitle: string
  feeType: PaymentFeeType
  amount: number
  currency?: string
  /** Reset signal: true while the step is the visible modal content. */
  active: boolean
  onClose: () => void
  onPaid?: () => void
  /** Reports the initiating state so the host shell can hide its X button. */
  onBusyChange?: (busy: boolean) => void
}

/**
 * Custospark Academy payment step (mirrors Custosell's payment modal pattern).
 * The PesaPal gateway page opens synchronously in a popup/tab inside the click
 * gesture (popups opened after an await are silently blocked), then that window
 * is redirected to the gateway URL once initiation returns. While waiting, the
 * payment status is polled (GET /payments/{id}, which re-checks the gateway) and
 * a manual Verify refetches status instead of re-initiating. If the popup is
 * blocked, a fallback "Open Payment Page" button keeps the user moving.
 *
 * Rendered WITHOUT its own modal shell so hosts can swap it into a single
 * <Modal> (e.g. Apply -> Pay) instead of stacking two shells (flash/flicker).
 */
export function PaymentModalBody({
  enrollmentId,
  courseTitle,
  feeType,
  amount,
  currency = 'UGX',
  active,
  onClose,
  onPaid,
  onBusyChange,
}: PaymentStepProps) {
  const payFee = usePayFee()
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useToast()
  const {
    environment,
    popupBlocked,
    paymentUrl,
    openPaymentPopup,
    redirectPaymentWindow,
    closePaymentPopup,
    resetPaymentPopup,
  } = usePaymentPopup()

  const paymentId = payFee.data?.payment?.id ?? null
  const status = usePaymentStatus(paymentId)

  function handlePay() {
    setError(null)
    // Open the blank popup/tab synchronously inside the click gesture so the
    // browser never classifies the payment page as a blocked popup.
    openPaymentPopup()
    payFee.mutate(
      { enrollmentId, feeType },
      {
        onSuccess: (data) => {
          if (data.type === 'auto_advanced' || data.payment?.status === 'paid') {
            closePaymentPopup()
            return
          }
          if (data.redirect_url) {
            redirectPaymentWindow(data.redirect_url)
          }
        },
        onError: (err) => {
          const message = apiErrorMessage(err)
          setError(message)
          showToast('error', message)
          closePaymentPopup()
        },
      },
    )
  }

  const paid =
    payFee.data?.type === 'auto_advanced' ||
    payFee.data?.payment?.status === 'paid' ||
    status.data?.status === 'paid'

  const onPaidRef = useRef(onPaid)
  onPaidRef.current = onPaid
  const notifiedRef = useRef(false)

  useEffect(() => {
    if (paid && !notifiedRef.current) {
      notifiedRef.current = true
      showToast('success', 'Payment received.')
      onPaidRef.current?.()
    }
    if (!paid) {
      notifiedRef.current = false
    }
  }, [paid, showToast])

  useEffect(() => {
    if (active) {
      setError(null)
      notifiedRef.current = false
      resetPaymentPopup()
      payFee.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  useEffect(() => {
    onBusyChange?.(payFee.isPending)
  }, [payFee.isPending, onBusyChange])

  function handleClose() {
    closePaymentPopup()
    onClose()
  }

  const waiting = paymentUrl !== null

  if (paid) {
    return (
      <div className="py-4 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-semantic-success" />
        <h3 className="mt-4 text-lg font-bold text-white">Payment received</h3>
        <p className="mt-1.5 text-sm text-text-secondary">
          Your {FEE_LABELS[feeType].toLowerCase()} for {courseTitle} has been confirmed.
        </p>
        <Button className="mt-5" onClick={handleClose}>
          Done
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Fee summary */}
      <div className="rounded-xl border border-border-subtle bg-surface-section p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white">{courseTitle}</div>
            <div className="text-xs text-text-muted">{FEE_LABELS[feeType]}</div>
          </div>
          <div className="text-right">
            <div className="font-display text-xl font-bold text-blue-400">
              {new Intl.NumberFormat('en-UG').format(Math.round(amount))} {currency}
            </div>
            <div className="text-xs text-text-muted">{currency}</div>
          </div>
        </div>
      </div>

      {/* Payment method */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-text-secondary">
          Payment method
        </label>
        <div className="flex items-center gap-3 rounded-xl border border-border-default bg-surface-card px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-academy-orange/15 text-academy-orange">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-medium text-white">Mobile Money</div>
            <div className="text-xs text-text-muted">MTN / Airtel / others</div>
          </div>
          <span className="ml-auto rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-medium text-blue-300">
            Selected
          </span>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-semantic-error/40 bg-semantic-error/10 px-4 py-3 text-sm text-semantic-error">
          {error}
        </p>
      )}

      {/* Waiting for payment / gateway state */}
      {waiting ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-academy-amber/40 bg-academy-amber/10 p-4 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-academy-amber" />
            <h3 className="mt-3 text-sm font-semibold text-white">Waiting for payment</h3>
            <p className="mt-1 text-xs text-text-secondary">
              Complete the payment in the window that opened, then verify below. Your status is
              checked automatically.
            </p>
            {paymentUrl && !popupBlocked && (
              <div className="mt-3 flex justify-center gap-2">
                <Wallet className="h-4 w-4 text-academy-amber" />
                <span className="text-xs text-text-secondary">Payment window opened.</span>
              </div>
            )}
          </div>

          <PaymentPopupNotice
            popupBlocked={popupBlocked}
            paymentUrl={paymentUrl}
            environment={environment}
          />

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={() => status.refetch()} loading={status.isFetching}>
              <RefreshCw className="h-4 w-4" />
              I have paid - verify
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end gap-3 pt-1">
          <Button variant="outline" onClick={handleClose} disabled={payFee.isPending}>
            Cancel
          </Button>
          <Button onClick={handlePay} loading={payFee.isPending} disabled={payFee.isPending}>
            {payFee.isPending ? 'Initiating...' : 'Pay now'}
          </Button>
        </div>
      )}
    </div>
  )
}

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  enrollmentId: number
  courseTitle: string
  feeType: PaymentFeeType
  amount: number
  currency?: string
  onPaid?: () => void
}

/** Standalone payment modal: one shell around the shared payment step. */
export function PaymentModal({
  open,
  onClose,
  enrollmentId,
  courseTitle,
  feeType,
  amount,
  currency = 'UGX',
  onPaid,
}: PaymentModalProps) {
  const [busy, setBusy] = useState(false)
  return (
    <Modal open={open} onClose={onClose} title="Make payment" size="sm" showCloseButton={!busy}>
      <PaymentModalBody
        enrollmentId={enrollmentId}
        courseTitle={courseTitle}
        feeType={feeType}
        amount={amount}
        currency={currency}
        active={open}
        onClose={onClose}
        onPaid={onPaid}
        onBusyChange={setBusy}
      />
    </Modal>
  )
}
