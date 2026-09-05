import { useState, type FormEvent } from 'react'
import { Plus, Target, Trash2 } from 'lucide-react'
import type { CourseFull } from '../../../../shared/types/courseContent'
import { Button } from '../../../../shared/components/buttons/Button'
import { Input } from '../../../../shared/components/inputs/Input'
import { useCreateOutcome, useDeleteOutcome } from '../../../../shared/api/courses/CourseContentQueries'

export function OutcomesTab({ course }: { course: CourseFull }) {
  const [description, setDescription] = useState('')
  const createMutation = useCreateOutcome(course.id)
  const deleteMutation = useDeleteOutcome(course.id)

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!description.trim() || createMutation.isPending) return
    createMutation.mutate(
      { description: description.trim() },
      {
        onSuccess: () => setDescription(''),
      },
    )
  }

  return (
    <div className="max-w-2xl">
      <p className="mb-4 text-sm text-text-secondary">
        Define what learners will be able to do by the end of this course.
      </p>

      <form onSubmit={handleAdd} className="mb-6 flex items-start gap-3">
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Build and deploy a full web application"
          className="flex-1"
        />
        <Button type="submit" loading={createMutation.isPending} className="shrink-0">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </form>

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
    </div>
  )
}