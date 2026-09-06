import { useEffect, useState } from 'react'
import { CheckCircle2, GraduationCap } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from '../buttons/Button'
import { PaymentModal } from './PaymentModal'
import { useApply } from '../../api/learner/LearnerCourseQueries'
import { apiErrorMessage } from '../../utils/apiError'

interface ApplyModalProps {
  open: boolean
  onClose: () => void
  courseId: number
  courseTitle: string
  applicationFee: number
  currency?: string
  onChanged?: () => void
}

/**
 * Enroll/apply modal. Confirms the application, creates the enrollment, then
 * opens the application-fee payment modal (state: applied -> application_fee_paid).
 */
export function ApplyModal({
  open,
  onClose,
  courseId,
  courseTitle,
  applicationFee,
  currency = 'UGX',
  onChanged,
}: ApplyModalProps) {
  const apply = useApply()
  const [error, setError] = useState<string | null>(null)
  const [enrollmentId, setEnrollmentId] = useState<number | null>(null)
  const [showPayment, setShowPayment] = useState(false)

  useEffect(() => {
    if (!open) {
      setError(null)
      setEnrollmentId(null)
      setShowPayment(false)
    }
  }, [open])

  function handleApply() {
    setError(null)
    apply.mutate(
      { courseId },
      {
        onSuccess: (data) => {
          onChanged?.()
          if (applicationFee > 0) {
            setEnrollmentId(data.id)
            setShowPayment(true)
          } else {
            // Waived application fee: the backend auto-advances the enrollment
            // (application_fee_paid -> admitted -> tuition_paid). Nothing to pay.
            onClose()
          }
        },
        onError: (err) => setError(apiErrorMessage(err, 'Could not apply.')),
      },
    )
  }

  return (
    <>
      <Modal open={open && !showPayment} onClose={onClose} title="Enroll in course" size="sm">
        <div className="space-y-5">
          <div className="rounded-xl border border-border-subtle bg-surface-section p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <div className="font-medium text-white">{courseTitle}</div>
                <div className="text-xs text-text-muted">Application</div>
              </div>
            </div>
          </div>

          {applicationFee > 0 ? (
            <p className="text-sm text-text-secondary">
              Apply now and pay the application fee of{' '}
              <span className="font-semibold text-white">
                {new Intl.NumberFormat('en-UG').format(Math.round(applicationFee))} {currency}
              </span>{' '}
              to complete your application.
            </p>
          ) : (
            <p className="text-sm text-text-secondary">
              This course has no application fee - your application will be submitted immediately.
            </p>
          )}

          {error && (
            <p className="rounded-lg border border-semantic-error/40 bg-semantic-error/10 px-4 py-3 text-sm text-semantic-error">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <Button variant="outline" onClick={onClose} disabled={apply.isPending}>
              Cancel
            </Button>
            <Button onClick={handleApply} loading={apply.isPending}>
              <CheckCircle2 className="h-4 w-4" />
              Apply now
            </Button>
          </div>
        </div>
      </Modal>

      {enrollmentId !== null && (
        <PaymentModal
          open={showPayment}
          onClose={() => {
            setShowPayment(false)
            onClose()
          }}
          enrollmentId={enrollmentId}
          courseTitle={courseTitle}
          feeType="application"
          amount={applicationFee}
          currency={currency}
          onPaid={() => {
            setShowPayment(false)
            onClose()
            onChanged?.()
          }}
        />
      )}
    </>
  )
}