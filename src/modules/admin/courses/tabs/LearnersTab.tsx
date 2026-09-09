import { useState } from 'react'
import { CheckCircle2, Flag, UserSquare2 } from 'lucide-react'
import type { CourseFull } from '../../../../shared/types/courseContent'
import { Button } from '../../../../shared/components/buttons/Button'
import { ConfirmDialog } from '../../../../shared/components/modals/ConfirmDialog'
import { AcademyLoader } from '../../../../shared/components/loading/AcademyLoader'
import { useAdminEnrollments, useCompleteLearners } from '../../../../shared/api/misc/MiscQueries'
import { useCompleteEnrollment } from '../../../../shared/api/learner/LearnerCourseQueries'
import { useToast } from '../../../../app/contexts/useToast'
import { apiErrorMessage } from '../../../../shared/utils/apiError'

const DONE_STATUSES = ['completed', 'certification', 'certified', 'rejected', 'cancelled']

/**
 * Course learners for instructors: per-learner completion plus one action
 * that closes the whole cohort at once. This is where live courses are
 * completed - learners never see a complete button on live courses.
 */
export function LearnersTab({ course }: { course: CourseFull }) {
  const { data: enrollments, isPending, refetch } = useAdminEnrollments({ courseId: course.slug })
  const completeAll = useCompleteLearners(course.slug)
  const [confirmAll, setConfirmAll] = useState(false)

  const pending = (enrollments ?? []).filter((e) => !DONE_STATUSES.includes(e.status))

  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">
          {enrollments?.length ?? 0} learner{(enrollments?.length ?? 0) === 1 ? '' : 's'} on this
          course
          {pending.length > 0 && ` · ${pending.length} still learning`}.
        </p>
        <Button
          size="sm"
          onClick={() => setConfirmAll(true)}
          disabled={pending.length === 0 || completeAll.isPending}
          loading={completeAll.isPending}
        >
          <Flag className="h-4 w-4" />
          Complete all learners
        </Button>
      </div>

      {isPending && <AcademyLoader block />}

      {!isPending && (enrollments ?? []).length === 0 && (
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface-card p-10 text-center">
          <UserSquare2 className="mx-auto h-10 w-10 text-blue-400" />
          <p className="mt-3 text-sm text-text-secondary">No learners enrolled yet.</p>
        </div>
      )}

      <ul className="space-y-2">
        {(enrollments ?? []).map((enrollment) => (
          <LearnerRow
            key={enrollment.id}
            enrollmentId={enrollment.id}
            name={enrollment.user_name ?? 'Learner'}
            email={enrollment.user_email ?? ''}
            status={enrollment.status}
            onChanged={() => void refetch()}
          />
        ))}
      </ul>

      <ConfirmDialog
        open={confirmAll}
        onClose={() => setConfirmAll(false)}
        title="Complete all learners?"
        tone="success"
        confirmLabel="Complete all"
        message={`This marks all ${pending.length} learning enrolment${pending.length === 1 ? '' : 's'} on this course as complete. Already-finished learners are untouched.`}
        isConfirming={completeAll.isPending}
        onConfirm={() => {
          completeAll.mutate(undefined, { onSuccess: () => setConfirmAll(false) })
        }}
      />
    </div>
  )
}

function LearnerRow({
  enrollmentId,
  name,
  email,
  status,
  onChanged,
}: {
  enrollmentId: number
  name: string
  email: string
  status: string
  onChanged: () => void
}) {
  const complete = useCompleteEnrollment()
  const { showToast } = useToast()
  const done = DONE_STATUSES.includes(status)

  return (
    <li className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-card px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-white">{name}</div>
        <div className="truncate text-xs text-text-muted">
          {email} · {status.replace(/_/g, ' ')}
        </div>
      </div>
      {done ? (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-semantic-success">
          <CheckCircle2 className="h-4 w-4" />
          Done
        </span>
      ) : (
        <Button
          size="sm"
          variant="outline"
          loading={complete.isPending}
          onClick={() =>
            complete.mutate(
              { enrollmentId },
              {
                onSuccess: () => {
                  showToast('success', 'Learner marked complete.')
                  onChanged()
                },
                onError: (err) => {
                  showToast('error', apiErrorMessage(err, 'Could not complete this learner.'))
                },
              },
            )
          }
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Complete
        </Button>
      )}
    </li>
  )
}
