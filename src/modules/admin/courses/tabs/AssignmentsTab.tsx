import { useEffect, useState, type FormEvent } from 'react'
import { ClipboardList, FileCheck2, Pencil, Plus, Trash2 } from 'lucide-react'
import type { AssignmentItem, CourseFull } from '../../../../shared/types/courseContent'
import { Button } from '../../../../shared/components/buttons/Button'
import { Input } from '../../../../shared/components/inputs/Input'
import { Modal } from '../../../../shared/components/modals/Modal'
import {
  useCreateAssignment,
  useDeleteAssignment,
  useUpdateAssignment,
} from '../../../../shared/api/courses/CourseContentQueries'
import { fromInputDateTime } from '../../../../shared/utils/assessmentWindows'

const SUBMISSION_HINTS: Record<AssignmentItem['submission_type'], string> = {
  text: 'Learners submit written text in a text area.',
  file: 'Learners upload a file (PDF, image, document).',
  link: 'Learners submit a URL to hosted work (e.g. GitHub, portfolio).',
}

interface AssignmentForm {
  title: string
  instructions: string
  submission_type: AssignmentItem['submission_type']
  max_score: string
  opens_at: string
  closes_at: string
  file: File | null
}

const EMPTY_FORM: AssignmentForm = {
  title: '',
  instructions: '',
  submission_type: 'text',
  max_score: '100',
  opens_at: '',
  closes_at: '',
  file: null,
}

export function AssignmentsTab({ course }: { course: CourseFull }) {
  const [modal, setModal] = useState<{ assignment?: AssignmentItem } | null>(null)
  const deleteAssignment = useDeleteAssignment(course.slug)

  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Graded work learners submit - text, files or links - that instructors score.
        </p>
        <Button size="sm" onClick={() => setModal({})}>
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
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
                  <span>
                    {assignment.submission_type} submission · max {assignment.max_score} pts
                    {assignment.due_after_days ? ` · due in ${assignment.due_after_days}d` : ''}
                  </span>
                  {assignment.file_path && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 font-medium text-blue-300">
                      <FileCheck2 className="h-3 w-3" />
                      File attached
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModal({ assignment })}
                className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-card-hover hover:text-white"
                aria-label="Edit assignment"
              >
                <Pencil className="h-4 w-4" />
              </button>
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

      <AssignmentModal
        courseSlug={course.slug}
        modal={modal}
        onClose={() => setModal(null)}
      />
    </div>
  )
}

function AssignmentModal({
  courseSlug,
  modal,
  onClose,
}: {
  courseSlug: string
  modal: { assignment?: AssignmentItem } | null
  onClose: () => void
}) {
  const createAssignment = useCreateAssignment(courseSlug)
  const updateAssignment = useUpdateAssignment(courseSlug)
  const editing = modal?.assignment ?? null
  const [form, setForm] = useState<AssignmentForm>(EMPTY_FORM)

  useEffect(() => {
    if (modal?.assignment) {
      const a = modal.assignment
      setForm({
        title: a.title,
        instructions: a.instructions ?? '',
        submission_type: a.submission_type,
        max_score: String(a.max_score),
        opens_at: '',
        closes_at: '',
        file: null,
      })
    } else if (modal) {
      setForm(EMPTY_FORM)
    }
  }, [modal])

  const busy = createAssignment.isPending || updateAssignment.isPending

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || busy || !modal) return
    const payload = {
      title: form.title.trim(),
      instructions: form.instructions || null,
      submission_type: form.submission_type,
      max_score: Number(form.max_score) || 100,
      opens_at: fromInputDateTime(form.opens_at),
      closes_at: fromInputDateTime(form.closes_at),
      file: form.file ?? undefined,
    }
    if (editing) {
      updateAssignment.mutate({ ...payload, id: editing.id }, { onSuccess: onClose })
      return
    }
    createAssignment.mutate(payload, { onSuccess: onClose })
  }

  return (
    <Modal
      open={modal !== null}
      onClose={onClose}
      title={editing ? 'Edit assignment' : 'Add assignment'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
          autoFocus
          placeholder="e.g. Build a landing page"
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Instructions / description
          </label>
          <textarea
            value={form.instructions}
            onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
            rows={4}
            placeholder="Describe what learners should submit - or attach it as a file below for long briefs."
            className="w-full rounded-lg border border-border-default bg-surface-input px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus/30"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Brief file (PDF, optional)
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
            onChange={(e) => setForm((f) => ({ ...f, file: e.target.files?.[0] ?? null }))}
            className="w-full rounded-lg border border-border-default bg-surface-input px-3 py-2.5 text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-blue-500/15 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-300"
          />
          <p className="mt-1.5 text-xs text-text-muted">
            {form.file
              ? `Selected: ${form.file.name}`
              : editing?.file_path
                ? 'A file is already attached - choosing one replaces it.'
                : 'For long briefs, attach the file instead of a wall of text.'}
          </p>
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Opens at (optional)"
            type="datetime-local"
            value={form.opens_at}
            onChange={(e) => setForm((f) => ({ ...f, opens_at: e.target.value }))}
          />
          <Input
            label="Closes at (optional)"
            type="datetime-local"
            value={form.closes_at}
            onChange={(e) => setForm((f) => ({ ...f, closes_at: e.target.value }))}
          />
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            {editing ? 'Save changes' : 'Add assignment'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
