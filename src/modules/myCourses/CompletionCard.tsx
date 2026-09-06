import { Award, CheckCircle2, Clock, Flag, Loader2 } from 'lucide-react'
import { useCompleteEnrollment } from '../../shared/api/learner/LearnerCourseQueries'
import { apiErrorMessage } from '../../shared/utils/apiError'
import { Button } from '../../shared/components/buttons/Button'
import { cn } from '../../shared/utils/cn'
import type { CourseProgress, Enrollment } from '../../shared/types'

const GRADING_LABELS: Record<string, string> = {
  learner: 'Learner-managed',
  auto: 'Auto-graded',
  instructor: 'Instructor-graded',
}

interface CompletionCardProps {
  progress?: CourseProgress
  enrollment?: Enrollment
}

/**
 * Shows the course completion manifest (every required item type with its
 * count, progress and grading owner) and, when everything is done, the
 * "Mark course complete" action that advances the enrollment so the learner
 * can proceed to the certificate.
 */
export function CompletionCard({ progress, enrollment }: CompletionCardProps) {
  const complete = useCompleteEnrollment()
  const manifest = progress?.completion

  if (!manifest) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-border-subtle bg-surface-card p-8 text-sm text-text-muted">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading completion status...
      </div>
    )
  }

  const isCompleted = enrollment?.completed_at !== null && enrollment?.completed_at !== undefined

  return (
    <div className="mb-6 rounded-2xl border border-border-subtle bg-surface-card p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-display text-base font-bold text-white">
          <Flag className="h-4 w-4 text-academy-orange" />
          Course completion
        </h3>
        {manifest.auto_completes ? (
          <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-medium text-blue-300">
            Auto-completing
          </span>
        ) : (
          <span className="rounded-full bg-academy-amber/15 px-2.5 py-0.5 text-xs font-medium text-academy-amber">
            Confirmed completion
          </span>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-text-secondary">
          <span className="font-bold text-white">{manifest.completed_required}</span>
          <span className="text-text-muted"> / {manifest.total_required} requirements met</span>
        </div>
        <div className="flex w-full max-w-[16rem] items-center gap-2 sm:w-56">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-input">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${manifest.percent}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-text-secondary">{manifest.percent}%</span>
        </div>
      </div>

      {manifest.categories.some((c) => c.total > 0) && (
        <ul className="space-y-2">
          {manifest.categories
            .filter((category) => category.total > 0)
            .map((category) => (
              <li
                key={category.key}
                className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-section px-4 py-3"
              >
                {category.completed >= category.total ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-semantic-success" />
                ) : (
                  <Clock className="h-4 w-4 shrink-0 text-academy-amber" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-white">{category.label}</span>
                    <span className="text-xs text-text-muted">
                      {category.completed}/{category.total}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-input">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        category.completed >= category.total ? 'bg-semantic-success' : 'bg-academy-amber',
                      )}
                      style={{ width: `${category.percent}%` }}
                    />
                  </div>
                </div>
                <span className="hidden shrink-0 text-[10px] uppercase tracking-wide text-text-muted sm:inline">
                  {GRADING_LABELS[category.grading] ?? category.grading}
                </span>
              </li>
            ))}
        </ul>
      )}

      {manifest.pending_instructor.length > 0 && (
        <div className="mt-4 rounded-xl border border-academy-amber/40 bg-academy-amber/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-academy-amber">
            Awaiting instructor grading
          </p>
          <ul className="mt-2 space-y-1">
            {manifest.pending_instructor.map((item) => (
              <li key={`${item.type}-${item.id}`} className="text-sm text-text-secondary">
                {item.title ?? `${item.type} #${item.id}`}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-text-muted">
            These items (exams, practical exercises and assignments) are counted once graded.
          </p>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-text-secondary">
          {manifest.is_complete ? (
            <span className="inline-flex items-center gap-1.5 text-semantic-success">
              <CheckCircle2 className="h-4 w-4" />
              All requirements completed.
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-academy-amber">
              <Clock className="h-4 w-4" />
              Complete every required item to finish this course.
            </span>
          )}
        </div>

        {manifest.is_complete && !isCompleted && (
          <Button
            variant="secondary"
            onClick={() => {
              if (enrollment) {
                complete.mutate(
                  { enrollmentId: enrollment.id },
                  {
                    onError: (err) => {
                      console.warn(apiErrorMessage(err, 'Could not mark the course complete.'))
                    },
                  },
                )
              }
            }}
            loading={complete.isPending}
            disabled={!enrollment}
          >
            {complete.isPending ? 'Marking complete...' : 'Mark course complete'}
          </Button>
        )}

        {isCompleted && (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-semantic-success">
            <Award className="h-4 w-4" />
            Completed on{' '}
            {enrollment?.completed_at
              ? new Date(enrollment.completed_at).toLocaleDateString('en-UG', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : '—'}
          </span>
        )}
      </div>
    </div>
  )
}