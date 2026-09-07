import type {
  LearnerAttemptStatus,
  LearnerSubmissionStatus,
} from '../../shared/types/learnerCourse'
import { windowLabel, windowState } from '../../shared/utils/assessmentWindows'
import { cn } from '../../shared/utils/cn'

interface WindowedItem {
  opens_at: string | null
  closes_at: string | null
  my_status?: LearnerAttemptStatus | LearnerSubmissionStatus | null
}

/** Window + submission/grade pills shown under every learner assessment row. */
export function AssessmentBadges({ item }: { item: WindowedItem }) {
  const window = windowLabel(item.opens_at, item.closes_at)
  const status = item.my_status ?? null

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {window && (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 font-medium',
            windowState(item.opens_at, item.closes_at) === 'closed'
              ? 'bg-semantic-error/15 text-semantic-error'
              : 'bg-surface-section text-text-muted',
          )}
        >
          {window}
        </span>
      )}
      {status && 'is_passed' in status && (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 font-medium',
            status.is_passed ? 'bg-semantic-success/15 text-semantic-success' : 'bg-academy-amber/15 text-academy-amber',
          )}
        >
          {status.score}/{status.max_score}
          {status.is_passed ? ' · Passed' : ''}
        </span>
      )}
      {status && !('is_passed' in status) && (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 font-medium',
            status.status === 'graded'
              ? 'bg-semantic-success/15 text-semantic-success'
              : 'bg-academy-amber/15 text-academy-amber',
          )}
        >
          {status.status === 'graded'
            ? `Graded${status.score !== null ? `: ${status.score}` : ''}`
            : 'Submitted for grading'}
        </span>
      )}
    </span>
  )
}

/** Non-null reason when submissions are blocked (shown instead of the submit button). */
export function windowBlockedReason(opensAt: string | null, closesAt: string | null): string | null {
  const state = windowState(opensAt, closesAt)
  if (state === 'upcoming' && opensAt) {
    return `This opens ${new Date(opensAt).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' })} - come back then.`
  }
  if (state === 'closed') {
    return 'Submissions are closed for this item.'
  }
  return null
}
