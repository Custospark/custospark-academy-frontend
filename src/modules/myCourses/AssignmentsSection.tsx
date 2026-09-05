import { useState } from 'react'
import { CheckCircle2, ClipboardList, Upload } from 'lucide-react'
import type { LearnerAssignment, LearnerCourse } from '../../shared/types/learnerCourse'
import { Button } from '../../shared/components/buttons/Button'
import { Modal } from '../../shared/components/modals/Modal'
import { useSubmitWork, type SubmitResult } from '../../shared/api/learner/LearnerCourseQueries'

export function AssignmentsSection({ course, courseId }: { course: LearnerCourse; courseId: number }) {
  const [active, setActive] = useState<LearnerAssignment | null>(null)

  if (course.assignments.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border-strong bg-surface-card p-10 text-center">
        <ClipboardList className="mx-auto h-10 w-10 text-blue-400" />
        <p className="mt-3 text-sm text-text-secondary">No assignments for this course yet.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-2">
      {course.assignments.map((assignment) => (
        <button
          key={assignment.id}
          type="button"
          onClick={() => setActive(assignment)}
          className="flex w-full items-center gap-3 rounded-xl border border-border-subtle bg-surface-card px-4 py-3 text-left transition-colors hover:border-border-strong"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
            <ClipboardList className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-white">{assignment.title}</div>
            <div className="text-xs text-text-muted">
              {assignment.submission_type} submission · max {assignment.max_score} pts
            </div>
          </div>
          <span className="text-sm font-medium text-blue-300">Submit</span>
        </button>
      ))}

      {active && (
        <SubmissionModal
          courseId={courseId}
          assignment={active}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  )
}

function SubmissionModal({
  courseId,
  assignment,
  onClose,
}: {
  courseId: number
  assignment: LearnerAssignment
  onClose: () => void
}) {
  const submit = useSubmitWork(courseId)
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<SubmitResult | null>(null)

  function handleSubmit() {
    if (submit.isPending) return
    if (assignment.submission_type === 'file' && !file) return
    if (assignment.submission_type === 'text' && !content.trim()) return

    submit.mutate(
      {
        type: 'assignment',
        typeId: assignment.id,
        content: content.trim() || undefined,
        file: file ?? undefined,
      },
      {
        onSuccess: (data) => setResult(data),
      },
    )
  }

  return (
    <Modal open onClose={onClose} title={assignment.title} size="md" showCloseButton={!submit.isPending}>
      {result ? (
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-semantic-success" />
          <h3 className="mt-4 text-lg font-bold text-white">Submitted</h3>
          <p className="mt-2 text-sm text-text-secondary">
            {result.status === 'graded'
              ? `Graded: ${result.score}/${result.max_score ?? assignment.max_score}`
              : 'Your submission has been sent for grading.'}
          </p>
          <Button className="mt-5" onClick={onClose}>
            Done
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-text-secondary">
            {assignment.instructions || 'Submit your work below.'}
          </p>

          {assignment.submission_type === 'text' && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">Your answer</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder="Write your answer here..."
                className="w-full rounded-lg border border-border-default bg-surface-input px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none"
              />
            </div>
          )}

          {assignment.submission_type === 'file' && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">Upload file</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full rounded-lg border border-border-default bg-surface-input px-3 py-2.5 text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-blue-500/15 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-300"
              />
              {file && <p className="mt-1.5 text-xs text-text-muted">{file.name}</p>}
            </div>
          )}

          {assignment.submission_type === 'link' && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">Link to your work</label>
              <input
                type="url"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="https://github.com/you/project"
                className="w-full rounded-lg border border-border-default bg-surface-input px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none"
              />
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border-subtle pt-4">
            <span className="text-xs text-text-muted">Max {assignment.max_score} pts</span>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} disabled={submit.isPending}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} loading={submit.isPending}>
                <Upload className="h-4 w-4" />
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}