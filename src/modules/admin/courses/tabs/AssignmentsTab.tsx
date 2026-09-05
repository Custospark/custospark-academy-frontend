import { useState, type FormEvent } from 'react'
import { ClipboardList, Plus, Trash2 } from 'lucide-react'
import type { CourseFull, AssignmentItem } from '../../../../shared/types/courseContent'
import { Button } from '../../../../shared/components/buttons/Button'
import { Input } from '../../../../shared/components/inputs/Input'
import { Modal } from '../../../../shared/components/modals/Modal'
import {
  useCreateAssignment,
  useDeleteAssignment,
} from '../../../../shared/api/courses/CourseContentQueries'

const SUBMISSION_HINTS: Record<AssignmentItem['submission_type'], string> = {
  text: 'Learners submit written text in a text area.',
  file: 'Learners upload a file (PDF, image, document).',
  link: 'Learners submit a URL to hosted work (e.g. GitHub, portfolio).',
}

export function AssignmentsTab({ course }: { course: CourseFull }) {
  const [showModal, setShowModal] = useState(false)
  const createAssignment = useCreateAssignment(course.id)
  const deleteAssignment = useDeleteAssignment(course.id)
  const [form, setForm] = useState({
    title: '',
    instructions: '',
    submission_type: 'text' as AssignmentItem['submission_type'],
    max_score: '100',
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || createAssignment.isPending) return
    createAssignment.mutate(
      {
        title: form.title.trim(),
        instructions: form.instructions || null,
        submission_type: form.submission_type,
        max_score: Number(form.max_score) || 100,
      },
      {
        onSuccess: () => {
          setShowModal(false)
          setForm({ title: '', instructions: '', submission_type: 'text', max_score: '100' })
        },
      },
    )
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Graded work learners submit - text, files or links - that instructors score.
        </p>
        <Button size="sm" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Add assignment
        </Button>
      </div>

      {course.assignments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface-card p-10 text-center">
          <ClipboardList className="mx-auto h-10 w-10 text-blue-400" />
          <p className="mt-3 text-sm text-text-secondary">
            No assignments yet. Add graded work to assess practical skills.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {course.assignments.map((assignment) => (
            <li
              key={assignment.id}
              className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-card px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-white">{assignment.title}</div>
                <div className="text-xs text-text-muted">
                  {assignment.submission_type} submission · max {assignment.max_score} pts
                  {assignment.due_after_days ? ` · due in ${assignment.due_after_days}d` : ''}
                </div>
              </div>
              <button
                type="button"
                onClick={() => deleteAssignment.mutate(assignment.id)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-card-hover hover:text-semantic-error"
                aria-label="Delete assignment"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add assignment" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
            placeholder="e.g. Build a landing page"
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">Instructions</label>
            <textarea
              value={form.instructions}
              onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
              rows={4}
              placeholder="Describe what learners should submit..."
              className="w-full rounded-lg border border-border-default bg-surface-input px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus/30"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">Submission type</label>
              <select
                value={form.submission_type}
                onChange={(e) => setForm((f) => ({ ...f, submission_type: e.target.value as AssignmentItem['submission_type'] }))}
                className="w-full rounded-lg border border-border-default bg-surface-input px-3 py-2.5 text-sm text-text-primary focus:border-border-focus focus:outline-none"
              >
                <option value="text">Text</option>
                <option value="file">File</option>
                <option value="link">Link</option>
              </select>
              <p className="mt-1.5 text-xs text-text-muted">{SUBMISSION_HINTS[form.submission_type]}</p>
            </div>
            <Input
              label="Max score"
              type="number"
              min={0}
              value={form.max_score}
              onChange={(e) => setForm((f) => ({ ...f, max_score: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createAssignment.isPending}>
              Add assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}