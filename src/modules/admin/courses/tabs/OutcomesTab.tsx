import { useEffect, useState, type FormEvent } from 'react'
import { Pencil, Plus, Target, Trash2 } from 'lucide-react'
import type { CourseFull, LearningOutcomeItem } from '../../../../shared/types/courseContent'
import { Button } from '../../../../shared/components/buttons/Button'
import { Input } from '../../../../shared/components/inputs/Input'
import { Modal } from '../../../../shared/components/modals/Modal'
import { useCreateOutcome, useDeleteOutcome, useUpdateOutcome } from '../../../../shared/api/courses/CourseContentQueries'

export function OutcomesTab({ course }: { course: CourseFull }) {
  const [modal, setModal] = useState<{ outcome?: LearningOutcomeItem } | null>(null)
  const deleteMutation = useDeleteOutcome(course.slug)

  return (
    <div className="max-w-2xl">
      <p className="mb-4 text-sm text-text-secondary">
        Define what learners will be able to do by the end of this course.
      </p>

      <div className="mb-6">
        <Button onClick={() => setModal({})} className="shrink-0">
          <Plus className="h-4 w-4" />
          Add outcome
        </Button>
      </div>

      {course.learning_outcomes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface-card p-10 text-center">
          <Target className="mx-auto h-10 w-10 text-blue-400" />
          <p className="mt-3 text-sm text-text-secondary">
            No learning outcomes yet. Add the first one above.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {course.learning_outcomes.map((outcome) => (
            <li
              key={outcome.id}
              className="flex items-start gap-3 rounded-xl border border-border-subtle bg-surface-card px-4 py-3"
            >
              <Target className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
              <span className="flex-1 text-sm text-text-secondary">{outcome.description}</span>
              <button
                type="button"
                onClick={() => setModal({ outcome })}
                className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-card-hover hover:text-white"
                aria-label="Edit outcome"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(outcome.id)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-card-hover hover:text-semantic-error"
                aria-label="Remove outcome"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <AddOutcomeModal
        courseId={course.slug}
        modal={modal}
        onClose={() => setModal(null)}
      />
    </div>
  )
}

function AddOutcomeModal({
  courseId,
  modal,
  onClose,
}: {
  courseId: string
  modal: { outcome?: LearningOutcomeItem } | null
  onClose: () => void
}) {
  const createMutation = useCreateOutcome(courseId)
  const updateMutation = useUpdateOutcome(courseId)
  const editing = modal?.outcome ?? null
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setDescription(modal?.outcome?.description ?? '')
    setError(null)
  }, [modal])

  const busy = createMutation.isPending || updateMutation.isPending

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!description.trim() || busy || !modal) return
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, description: description.trim() },
        {
          onSuccess: onClose,
          onError: (err) => setError(err.message || 'Could not update learning outcome.'),
        },
      )
      return
    }
    createMutation.mutate(
      { description: description.trim() },
      {
        onSuccess: () => {
          setDescription('')
          onClose()
        },
        onError: (err) => setError(err.message || 'Could not add learning outcome.'),
      },
    )
  }

  return (
    <Modal open={modal !== null} onClose={onClose} title={editing ? 'Edit learning outcome' : 'Add learning outcome'} size="sm">
      <form onSubmit={handleAdd} className="space-y-4">
        {error && (
          <p className="rounded-lg border border-semantic-error/40 bg-semantic-error/10 px-4 py-3 text-sm text-semantic-error">
            {error}
          </p>
        )}
        <Input
          label="Outcome"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          autoFocus
          placeholder="e.g. Build and deploy a full web application"
        />
        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            <Plus className="h-4 w-4" />
            {editing ? 'Save changes' : 'Add'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
