import type { CourseFee } from '../types'
import { windowState } from './assessmentWindows'

export type EnrollmentStatus =
  | 'applied'
  | 'application_fee_paid'
  | 'admitted'
  | 'tuition_paid'
  | 'in_progress'
  | 'completed'
  | 'certification'
  | 'certified'
  | 'rejected'
  | 'cancelled'

export type FeeType = 'application' | 'tuition' | 'certificate'

/**
 * Single source of truth for what an enrollment status means to the user:
 * the badge they see, the next action label, and what that action does.
 */
export interface EnrollmentMatrixEntry {
  badgeLabel: string
  badgeClass: string
  actionLabel: string
  action: {
    type: 'pay' | 'continue' | 'certificate' | 'issue' | 'reapply'
    feeType?: FeeType
  } | null
  note: string
}

const BADGE_STYLES: Record<EnrollmentStatus, string> = {
  applied: 'bg-blue-500/15 text-blue-300',
  application_fee_paid: 'bg-blue-500/15 text-blue-300',
  admitted: 'bg-semantic-success/15 text-semantic-success',
  tuition_paid: 'bg-semantic-success/15 text-semantic-success',
  in_progress: 'bg-academy-amber/15 text-academy-amber',
  completed: 'bg-academy-teal/15 text-academy-teal',
  certification: 'bg-academy-purple/15 text-academy-purple',
  certified: 'bg-semantic-success/15 text-semantic-success',
  rejected: 'bg-semantic-error/15 text-semantic-error',
  cancelled: 'bg-text-muted/15 text-text-muted',
}

export const ENROLLMENT_MATRIX: Record<EnrollmentStatus, EnrollmentMatrixEntry> = {
  applied: {
    badgeLabel: 'Applied',
    badgeClass: BADGE_STYLES.applied,
    actionLabel: 'Pay application fee',
    action: { type: 'pay', feeType: 'application' },
    note: 'Complete the application fee to secure your place.',
  },
  application_fee_paid: {
    badgeLabel: 'Fee paid',
    badgeClass: BADGE_STYLES.application_fee_paid,
    actionLabel: 'Pay tuition',
    action: { type: 'pay', feeType: 'tuition' },
    note: 'Your application fee is paid. Pay tuition to start.',
  },
  admitted: {
    badgeLabel: 'Admitted',
    badgeClass: BADGE_STYLES.admitted,
    actionLabel: 'Pay tuition',
    action: { type: 'pay', feeType: 'tuition' },
    note: 'Congratulations! You have been admitted. Pay tuition to begin.',
  },
  tuition_paid: {
    badgeLabel: 'Tuition paid',
    badgeClass: BADGE_STYLES.tuition_paid,
    actionLabel: 'Start course',
    action: { type: 'continue' },
    note: 'Tuition is paid. Start learning now.',
  },
  in_progress: {
    badgeLabel: 'In progress',
    badgeClass: BADGE_STYLES.in_progress,
    actionLabel: 'Continue learning',
    action: { type: 'continue' },
    note: 'Keep going - your lessons are waiting.',
  },
  completed: {
    badgeLabel: 'Completed',
    badgeClass: BADGE_STYLES.completed,
    actionLabel: 'Get certificate',
    action: { type: 'pay', feeType: 'certificate' },
    note: 'You completed the course. Pay the certificate fee to get certified.',
  },
  certification: {
    badgeLabel: 'Certification',
    badgeClass: BADGE_STYLES.certification,
    actionLabel: 'Claim certificate',
    action: { type: 'issue' },
    note: 'Your certificate is ready to claim.',
  },
  certified: {
    badgeLabel: 'Certified',
    badgeClass: BADGE_STYLES.certified,
    actionLabel: 'Start course',
    action: { type: 'continue' },
    note: 'Congratulations! You are certified. Revisit any lesson anytime - your certificate lives under Certificates.',
  },
  rejected: {
    badgeLabel: 'Rejected',
    badgeClass: BADGE_STYLES.rejected,
    actionLabel: 'View status',
    action: { type: 'continue' },
    note: 'Your application was not accepted for this cohort.',
  },
  cancelled: {
    badgeLabel: 'Cancelled',
    badgeClass: BADGE_STYLES.cancelled,
    actionLabel: 'Re-apply',
    action: { type: 'reapply' },
    note: 'This enrollment was cancelled. You can re-apply.',
  },
}

/**
 * Fee-aware overrides: when the next required payment is waived (zero or
 * unconfigured) the learner must never be asked to "Pay X". Tuition shows
 * "Sponsored", other fees show "Waived". The action still maps to `pay` but
 * the button advances the enrollment directly - the backend auto-advances
 * waived stages, so no payment modal is ever shown for a zero fee.
 */
export const WAIVED_MATRIX: Partial<Record<EnrollmentStatus, Partial<EnrollmentMatrixEntry>>> = {
  applied: {
    actionLabel: 'Start course',
    note: 'Your application fee is waived - welcome to the academy!',
  },
  application_fee_paid: {
    actionLabel: 'Start course',
    note: 'Tuition is sponsored - start learning.',
  },
  admitted: {
    actionLabel: 'Start course',
    note: 'Tuition is sponsored - no tuition required.',
  },
  completed: {
    actionLabel: 'Get certificate',
    note: 'Your certificate fee is waived - claim your certificate.',
  },
}

export function enrollmentMatrix(
  status: string | null,
  fees?: CourseFee[] | null,
  window?: { opens_at: string | null; closes_at: string | null } | null,
): EnrollmentMatrixEntry {
  // Enrollment window gates NEW enrollments (and re-applications) only.
  // Learners who are already enrolled are never blocked by it.
  if (window && (status === null || status === 'cancelled')) {
    const state = windowState(window.opens_at, window.closes_at)
    if (state === 'closed') {
      const when = window.closes_at
        ? ` on ${new Date(window.closes_at).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' })}`
        : ''
      return {
        badgeLabel: 'Enrollment closed',
        badgeClass: 'bg-text-muted/15 text-text-muted',
        actionLabel: 'Enrollment closed',
        action: null,
        note: `Enrollment for this course closed${when}.`,
      }
    }
    if (state === 'upcoming' && window.opens_at) {
      const when = new Date(window.opens_at).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' })
      return {
        badgeLabel: `Opens ${when}`,
        badgeClass: 'bg-blue-500/15 text-blue-300',
        actionLabel: `Opens ${when}`,
        action: null,
        note: `Enrollment opens on ${when}. Check back then.`,
      }
    }
  }

  const base = ENROLLMENT_MATRIX[status as EnrollmentStatus]

  if (base) {
    // A "pay" action with a zero/absent fee is a waived stage: show the
    // Sponsored/Waived experience instead of asking for payment.
    if (base.action?.type === 'pay' && base.action.feeType) {
      const amount = feeAmountFor(fees, base.action.feeType)
      if (amount <= 0) {
        const waived = WAIVED_MATRIX[status as EnrollmentStatus]
        if (waived) return { ...base, ...waived }
      }
    }

    return base
  }

  return {
    badgeLabel: status?.replace(/_/g, ' ') ?? 'Unknown',
    badgeClass: 'bg-text-muted/15 text-text-muted',
    actionLabel: 'View course',
    action: { type: 'continue' },
    note: '',
  }
}

function feeAmount(fees: CourseFee[], type: FeeType): number {
  return fees.find((f) => f.fee_type === type)?.amount ?? 0
}

/** Returns the amount (or 0 if fee is not configured) for an action's fee. */
export function feeAmountFor(fees: CourseFee[] | null | undefined, feeType?: FeeType): number {
  if (!fees || !feeType) return 0
  return feeAmount(fees, feeType)
}