import { useState } from 'react'
import { Download, FileCheck2, Inbox, PenLine } from 'lucide-react'
import type { CourseFull } from '../../../../shared/types/courseContent'
import { Button } from '../../../../shared/components/buttons/Button'
import { Input } from '../../../../shared/components/inputs/Input'
import { Modal } from '../../../../shared/components/modals/Modal'
import { AcademyLoader } from '../../../../shared/components/loading/AcademyLoader'
import {
  useGradeSubmission,
  useSubmissions,
  type InstructorSubmission,
} from '../../../../shared/api/courses/CourseContentQueries'
import { storageUrl } from '../../../../shared/utils/storageUrl'

/**
 * Instructor grading inbox: every learner submission on this course with
 * download links, filterable by status/type, graded inline. Learners see
 * scores + feedback in their performance view - closing the feedback loop.
 */
export function SubmissionsTab({ course }: { course: CourseFull }) {
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [grading, setGrading] = useState<InstructorSubmission | null>(null)
  const { data: submissions, isPending } = useSubmissions(course.slug, status, type)

  return (
    <div className="max-w-4xl">
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-border-default bg-surface-input px-3 py-2 text-sm text-text-primary focus:border-border-focus focus:outline-none"
          >
            <option value="">All</option>
            <option value="submitted">Submitted</option>
            <option value="graded">Graded</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-lg border border-border-default bg-surface-input px-3 py-2.5 text-sm text-text-primary focus:border-border-focus focus:outline-none"
          >
            <option value="">All</option>
            <option value="assignment">Assignments</option>
            <option value="exercise">Exercises</option>
            <option value="exam">Exams</option>
          </select>
        </div>
      </div>

      {isPending && <AcademyLoader block />}

      {!isPending && (submissions ?? []).length === 0 && (
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface-card p-10 text-center">
          <Inbox className="mx-auto h-10 w-10 text-blue-400" />
          <p className="mt-3 text-sm text-text-secondary">
            No submissions here yet. Learner work lands here for grading.
          </p>
        </div>
      )}

      <ul className="space-y-2">
        {(submissions ?? []).map((submission) => {
          const fileUrl = storageUrl(submission.file_path)
          return (
            <li
              key={submission.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-border-subtle bg-surface-card px-4 py-3"
            >
              <div className="min-w-0 flex-1 basis-56">
                <div className="truncate font-medium text-white">{submission.assessment_title}</div>
                <div className="truncate text-xs text-text-muted">
                  {submission.learner_name} · {submission.learner_email} · {submission.assessment_type}
                </div>
                {submission.content && (
                  <p className="mt-1 line-clamp-2 text-xs text-text-secondary">{submission.content}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {fileUrl && (
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-card-hover hover:text-white"
                    aria-label={`Download ${submission.learner_name}'s submission`}
                  >
                    <Download className="h-4 w-4" />
                  </a>
                )}
                {submission.status === 'graded' ? (
                  <button
                    type="button"
                    onClick={() => setGrading(submission)}
                    title="Edit grade"
                    className="inline-flex items-center gap-1 rounded-full bg-semantic-success/15 px-2.5 py-1 text-xs font-semibold text-semantic-success transition-colors hover:bg-semantic-success/25"
                  >
                    <FileCheck2 className="h-3.5 w-3.5" />
                    {submission.grade ?? `${submission.score ?? '-'}/${submission.max_score ?? '-'}`}
                  </button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setGrading(submission)}>
                    <PenLine className="h-3.5 w-3.5" />
                    Grade
                  </Button>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {grading && (
        <GradeModal
          courseSlug={course.slug}
          submission={grading}
          onClose={() => setGrading(null)}
        />
      )}
    </div>
  )
}

function GradeModal({
  courseSlug,
  submission,
  onClose,
}: {
  courseSlug: string
  submission: InstructorSubmission
  onClose: () => void
}) {
  const grade = useGradeSubmission(courseSlug)
  const [score, setScore] = useState(submission.score !== null ? String(submission.score) : '')
  const [gradeLabel, setGradeLabel] = useState(submission.grade ?? '')
  const [feedback, setFeedback] = useState(submission.feedback ?? '')
  const [formError, setFormError] = useState<string | null>(null)

  function handleSave() {
    setFormError(null)
    if (score.trim() === '' && gradeLabel.trim() === '') {
      setFormError('Give a numeric score, a grade label (e.g. A, 85%), or both.')
      return
    }
    grade.mutate(
      {
        submissionId: submission.id,
        score: score.trim() === '' ? undefined : Number(score),
        grade: gradeLabel.trim() || undefined,
        feedback: feedback || undefined,
      },
      { onSuccess: onClose },
    )
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Grade - ${submission.learner_name}`}
      subtitle={`${submission.assessment_title} · submitted ${
        submission.submitted_at
          ? new Date(submission.submitted_at).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' })
          : '-'
      }`}
      size="sm"
    >
      <div className="space-y-4">
        {formError && (
          <p className="rounded-lg border border-semantic-error/40 bg-semantic-error/10 px-4 py-3 text-sm text-semantic-error">
            {formError}
          </p>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={`Score (max ${submission.max_score ?? '-'})`}
            type="number"
            min={0}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            autoFocus
          />
          <Input
            label="Grade (A, 85%, Pass...)"
            value={gradeLabel}
            onChange={(e) => setGradeLabel(e.target.value)}
            maxLength={20}
            placeholder="e.g. A"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Feedback (visible to the learner)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            placeholder="What did they do well? What should they fix?"
            className="w-full rounded-lg border border-border-default bg-surface-input px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus/30"
          />
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={grade.isPending}>
            Save grade
          </Button>
        </div>
      </div>
    </Modal>
  )
}
