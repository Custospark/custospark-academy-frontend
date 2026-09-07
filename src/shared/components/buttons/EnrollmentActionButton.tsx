import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BadgeCheck, RefreshCcw } from 'lucide-react'
import { Button } from './Button'
import { PaymentModal } from '../modals/PaymentModal'
import type { PaymentFeeType } from '../../types'
import { ApplyModal } from '../modals/ApplyModal'
import { usePayFee } from '../../api/learner/LearnerCourseQueries'
import { useIssueCertificate } from '../../api/misc/MiscQueries'
import { ROUTES } from '../../../app/routes/constants/shared.paths'
import { enrollmentMatrix, feeAmountFor } from '../../utils/enrollmentMatrix'
import { windowLabel, windowState } from '../../utils/assessmentWindows'
import type { CourseFee } from '../../types'

interface EnrollmentActionButtonProps {
  /** Numeric course id for API request bodies (never shown in URLs). */
  courseId: number
  /** Course slug for display-URL links. */
  courseSlug: string
  courseTitle: string
  enrollmentId: number
  status: string
  fees?: CourseFee[] | null
  /** Enrollment window: gates new enrollments only, never enrolled learners. */
  window?: { opens_at: string | null; closes_at: string | null } | null

  /** Called after a payment or re-apply completes so lists can refetch. */
  onChanged?: () => void

  /** Emphasized (primary) render vs quieter outline for dense cards. */
  emphasis?: 'primary' | 'outline'

  size?: 'sm' | 'md' | 'lg'

  className?: string
}

/**
 * Renders the correct user action for an enrollment based on the
 * action/label matrix (see shared/utils/enrollmentMatrix.ts). Pays, continues
 * to the course player, opens certificates, or re-applies as appropriate.
 */
export function EnrollmentActionButton({
  courseId,
  courseSlug,
  courseTitle,
  enrollmentId,
  status,
  fees,
  window,
  onChanged,
  emphasis = 'primary',
  size = 'md',
  className,
}: EnrollmentActionButtonProps) {
  const entry = enrollmentMatrix(status, fees, window)
  const [payFee, setPayFee] = useState<PaymentFeeType | null>(null)
  const [reapplying, setReapplying] = useState(false)

  switch (entry.action?.type) {
    case 'pay': {
      const feeType = entry.action.feeType ?? 'application'
      const feeAmount = feeAmountFor(fees, feeType)

      // A waived (zero) fee is never paid: advance the enrollment directly.
      // The backend auto-advances waivered stages, so this bypasses the modal.
      if (feeAmount <= 0) {
        return (
          <WaivedFeeAdvanceButton
            enrollmentId={enrollmentId}
            feeType={feeType}
            label={entry.actionLabel}
            size={size}
            variant={emphasis === 'outline' ? 'outline' : 'primary'}
            className={className}
            onChanged={onChanged}
          />
        )
      }

      return (
        <>
          <Button size={size} variant={emphasis === 'outline' ? 'outline' : 'primary'} className={className} onClick={() => setPayFee(feeType)}>
            {entry.actionLabel}
            <ArrowRight className="h-4 w-4" />
          </Button>
          <PaymentModal
            open={payFee !== null}
            onClose={() => setPayFee(null)}
            enrollmentId={enrollmentId}
            courseTitle={courseTitle}
            feeType={feeType}
            amount={feeAmount}
            onPaid={() => {
              setPayFee(null)
              onChanged?.()
            }}
          />
        </>
      )
    }

    case 'issue': {
      return (
        <IssueCertificateButton
          enrollmentId={enrollmentId}
          label={entry.actionLabel}
          size={size}
          variant={emphasis === 'outline' ? 'outline' : 'primary'}
          className={className}
          onChanged={onChanged}
        />
      )
    }

    case 'certificate':
      return (
        <Link to={ROUTES.APP.CERTIFICATES} className={className}>
          <Button size={size} variant={emphasis === 'outline' ? 'outline' : 'primary'}>
            <BadgeCheck className="h-4 w-4" />
            {entry.actionLabel}
          </Button>
        </Link>
      )

    case 'reapply':
      return (
        <>
          <Button size={size} variant={emphasis === 'outline' ? 'outline' : 'primary'} className={className} onClick={() => setReapplying(true)}>
            <RefreshCcw className="h-4 w-4" />
            {entry.actionLabel}
          </Button>
          <ApplyModal
            open={reapplying}
            onClose={() => setReapplying(false)}
            courseId={courseId}
            courseTitle={courseTitle}
            applicationFee={feeAmountFor(fees, 'application')}
            onChanged={onChanged}
          />
        </>
      )

    case 'continue':
    default:
      // A null action (e.g. enrollment closed) renders a disabled button that
      // states the reason - never a link that goes nowhere.
      if (entry.action === null) {
        return (
          <Button size={size} variant={emphasis === 'outline' ? 'outline' : 'primary'} className={className} disabled>
            {entry.actionLabel}
          </Button>
        )
      }
      return (
        <Link to={ROUTES.APP.MY_COURSE(courseSlug)} className={className}>
          <Button size={size} variant={emphasis === 'outline' ? 'outline' : 'primary'}>
            {entry.actionLabel}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      )
  }
}

export const EnrollmentStatusBadge = ({
  status,
  className,
}: {
  status: string
  className?: string
}) => {
  const entry = enrollmentMatrix(status)
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${entry.badgeClass} ${className ?? ''}`}>
      {entry.badgeLabel}
    </span>
  )
}

/** Enrollment window line for course cards ("Enrollment open till ..."). Null when always open. */
export function EnrollmentWindowLine({
  opensAt,
  closesAt,
  className,
}: {
  opensAt: string | null
  closesAt: string | null
  className?: string
}) {
  const label = windowLabel(opensAt, closesAt)
  if (!label) return null
  return (
    <p className={`text-xs text-text-muted ${className ?? ''}`}>
      Enrollment {label.charAt(0).toLowerCase() + label.slice(1)}
    </p>
  )
}

interface EnrollButtonProps {
  opensAt: string | null
  closesAt: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onEnroll: () => void
}

/**
 * The pre-enrollment button: Enroll when open, otherwise a disabled button
 * stating exactly why (closed date / opening date). Mirrors the matrix gate.
 */
export function EnrollButton({ opensAt, closesAt, size = 'sm', className, onEnroll }: EnrollButtonProps) {
  const state = windowState(opensAt, closesAt)
  if (state === 'closed') {
    return (
      <Button size={size} className={className} disabled>
        Enrollment closed
      </Button>
    )
  }
  if (state === 'upcoming') {
    const when = opensAt
      ? new Date(opensAt).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' })
      : ''
    return (
      <Button size={size} className={className} disabled>
        {`Opens ${when}`}
      </Button>
    )
  }
  return (
    <Button size={size} className={className} onClick={onEnroll}>
      Enroll
      <ArrowRight className="h-4 w-4" />
    </Button>
  )
}

/**
 * Claims a certificate for a certification-stage enrollment: POSTs to the
 * issue endpoint which moves the enrollment to certified and creates the
 * certificate record, then the list refetches.
 */
function IssueCertificateButton({
  enrollmentId,
  label,
  size,
  variant,
  className,
  onChanged,
}: {
  enrollmentId: number
  label: string
  size?: 'sm' | 'md' | 'lg'
  variant: 'outline' | 'primary'
  className?: string
  onChanged?: () => void
}) {
  const issue = useIssueCertificate()
  const [issued, setIssued] = useState(false)

  return (
    <Button
      size={size}
      variant={variant}
      className={className}
      loading={issue.isPending}
      onClick={() =>
        issue.mutate(
          { enrollmentId },
          {
            onSuccess: () => {
              setIssued(true)
              onChanged?.()
            },
            onError: () => {
              setIssued(false)
              onChanged?.()
            },
          },
        )
      }
    >
      <BadgeCheck className="h-4 w-4" />
      {issued ? 'View certificate' : label}
    </Button>
  )
}

/**
 * Advances an enrollment through a waivered fee stage with a single click.
 * The backend auto-advances waivered stages (no payment, no gateway), so we
 * just fire the pay endpoint and let the list refetch the new status.
 */
function WaivedFeeAdvanceButton({
  enrollmentId,
  feeType,
  label,
  size,
  variant,
  className,
  onChanged,
}: {
  enrollmentId: number
  feeType: PaymentFeeType
  label: string
  size?: 'sm' | 'md' | 'lg'
  variant: 'outline' | 'primary'
  className?: string
  onChanged?: () => void
}) {
  const payFee = usePayFee()

  return (
    <Button
      size={size}
      variant={variant}
      className={className}
      onClick={() =>
        payFee.mutate(
          { enrollmentId, feeType },
          {
            onSuccess: () => onChanged?.(),
            onError: () => onChanged?.(),
          },
        )
      }
      loading={payFee.isPending}
    >
      {label}
      <ArrowRight className="h-4 w-4" />
    </Button>
  )
}