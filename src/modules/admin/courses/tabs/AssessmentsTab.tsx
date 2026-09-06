import { useState, type FormEvent } from 'react'
import { FileQuestion, FileUp, Plus, Trash2, ClipboardCheck, BookMarked, FileCheck2 } from 'lucide-react'
import type { CourseFull, QuestionItem } from '../../../../shared/types/courseContent'
import { Button } from '../../../../shared/components/buttons/Button'
import { Input } from '../../../../shared/components/inputs/Input'
import { Modal } from '../../../../shared/components/modals/Modal'
import {
  useCreateQuiz,
  useDeleteQuiz,
  useCreateExercise,
  useDeleteExercise,
  useCreateExam,
  useDeleteExam,
} from '../../../../shared/api/courses/CourseContentQueries'

type Kind = 'quiz' | 'exercise' | 'exam'
const KIND_LABEL: Record<Kind, string> = { quiz: 'Quiz', exercise: 'Exercise', exam: 'Exam' }
const KIND_ICON: Record<Kind, typeof FileQuestion> = {
  quiz: FileQuestion,
  exercise: ClipboardCheck,
  exam: BookMarked,
}

interface DraftQuestion {
  question: string
  type: string
  options: string
  correct_answer: string
  points: number
}

const EMPTY_QUESTION: DraftQuestion = { question: '', type: 'multiple_choice', options: '', correct_answer: '', points: 1 }

export function AssessmentsTab({ course }: { course: CourseFull }) {
  const [kind, setKind] = useState<Kind | null>(null)
  const createQuiz = useCreateQuiz(course.id)
  const deleteQuiz = useDeleteQuiz(course.id)
  const createExercise = useCreateExercise(course.id)
  const deleteExercise = useDeleteExercise(course.id)
  const createExam = useCreateExam(course.id)
  const deleteExam = useDeleteExam(course.id)

  const [title, setTitle] = useState('')
  const [passing, setPassing] = useState('50')
  const [questions, setQuestions] = useState<DraftQuestion[]>([{ ...EMPTY_QUESTION }])
  const [examFile, setExamFile] = useState<File | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const creators: Record<Kind, (payload: Record<string, unknown>) => void> = {
    quiz: (p) => createQuiz.mutate(p as never, { onSuccess: resetAndClose }),
    exercise: (p) => createExercise.mutate(p as never, { onSuccess: resetAndClose }),
    exam: (p) => createExam.mutate(p as never, { onSuccess: resetAndClose }),
  }

  const deleting: Record<Kind, (id: number) => void> = {
    quiz: (id) => deleteQuiz.mutate(id),
    exercise: (id) => deleteExercise.mutate(id),
    exam: (id) => deleteExam.mutate(id),
  }

  function resetAndClose() {
    setKind(null)
    setTitle('')
    setPassing('50')
    setQuestions([{ ...EMPTY_QUESTION }])
    setExamFile(null)
    setFormError(null)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!kind || !title.trim()) return
    setFormError(null)
    const cleanQuestions = questions
      .filter((q) => q.question.trim() !== '')
      .map((q): Partial<QuestionItem> => ({
        question: q.question.trim(),
        type: q.type,
        options: q.options ? q.options.split(',').map((o) => o.trim()).filter(Boolean) : null,
        correct_answer: q.correct_answer.trim() || null,
        points: Number(q.points) || 1,
      }))
    // An exam may be a paper file, typed questions, or both - but never neither.
    if (kind === 'exam' && cleanQuestions.length === 0 && !examFile) {
      setFormError('Attach an exam paper file or add at least one typed question.')
      return
    }
    creators[kind]({
      title: title.trim(),
      passing_score: Number(passing) || 50,
      max_score: 100,
      questions: cleanQuestions,
      ...(kind === 'exam' && examFile ? { file: examFile } : {}),
    })
  }

  const lists = [
    { kind: 'quiz' as Kind, items: course.quizzes },
    { kind: 'exercise' as Kind, items: course.exercises },
    { kind: 'exam' as Kind, items: course.exams },
  ]

  return (
    <div className="max-w-3xl">
      <p className="mb-4 text-sm text-text-secondary">
        Quizzes (auto-graded), exercises (practice) and exams test what learners have mastered.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        {(['quiz', 'exercise', 'exam'] as Kind[]).map((k) => (
          <Button key={k} size="sm" onClick={() => setKind(k)}>
            <Plus className="h-4 w-4" />
            Add {k}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {lists.map(({ kind: k, items }) => {
          const Icon = KIND_ICON[k]
          return (
            <div key={k}>
              <h3 className="mb-2 flex items-center gap-2 font-display text-base font-bold text-white">
                <Icon className="h-4 w-4 text-blue-400" />
                {KIND_LABEL[k]}s
                <span className="text-xs font-normal text-text-muted">({items.length})</span>
              </h3>
              {items.length === 0 ? (
                <p className="mb-3 text-sm text-text-muted">None yet.</p>
              ) : (
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-card px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-white">{item.title}</div>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
                          <span>
                            {item.questions.length} questions · passing {item.passing_score}%
                          </span>
                          {k === 'exam' && 'file_path' in item && item.file_path && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 font-medium text-blue-300">
                              <FileCheck2 className="h-3 w-3" />
                              Paper attached
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleting[k](item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-card-hover hover:text-semantic-error"
                        aria-label={`Delete ${k}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>

      <Modal open={kind !== null} onClose={resetAndClose} title={`Add ${kind ?? 'assessment'}`} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <p className="rounded-lg border border-semantic-error/40 bg-semantic-error/10 px-4 py-3 text-sm text-semantic-error">
              {formError}
            </p>
          )}
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder={kind === 'quiz' ? 'e.g. Module 1 Quiz' : kind === 'exercise' ? 'e.g. Practice Problem Set' : 'e.g. Final Exam'}
          />
          {kind === 'exam' && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                Exam paper (PDF/file, optional)
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-border-default bg-surface-card px-4 py-3">
                <FileUp className="h-5 w-5 shrink-0 text-blue-300" />
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  onChange={(e) => setExamFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-blue-500/15 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-300"
                />
              </div>
              <p className="mt-1.5 text-xs text-text-muted">
                {examFile
                  ? `Selected: ${examFile.name}`
                  : 'Learners download the paper, then upload their answer script. Combine with typed questions or use the paper alone.'}
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Passing score (%)"
              type="number"
              min={0}
              max={100}
              value={passing}
              onChange={(e) => setPassing(e.target.value)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">Questions</label>
            <div className="space-y-3">
              {questions.map((q, index) => (
                <div key={index} className="rounded-xl border border-border-subtle bg-surface-section p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                      Question {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuestions((list) => list.filter((_, i) => i !== index))}
                      className="flex h-6 w-6 items-center justify-center rounded text-text-muted hover:text-semantic-error"
                      aria-label="Remove question"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <textarea
                    value={q.question}
                    onChange={(e) => updateQuestion(index, { question: e.target.value })}
                    rows={2}
                    placeholder="Question text"
                    className="mb-2 w-full rounded-lg border border-border-default bg-surface-input px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none"
                  />
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <Input
                      placeholder="Options (comma separated)"
                      value={q.options}
                      onChange={(e) => updateQuestion(index, { options: e.target.value })}
                    />
                    <Input
                      placeholder="Correct answer"
                      value={q.correct_answer}
                      onChange={(e) => updateQuestion(index, { correct_answer: e.target.value })}
                    />
                    <Input
                      type="number"
                      min={1}
                      placeholder="Points"
                      value={String(q.points)}
                      onChange={(e) => updateQuestion(index, { points: Number(e.target.value) || 1 })}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setQuestions((list) => [...list, { ...EMPTY_QUESTION }])}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border-default px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" />
              Add question
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={resetAndClose}>
              Cancel
            </Button>
            <Button type="submit" loading={createQuiz.isPending || createExercise.isPending || createExam.isPending}>
              Add {kind}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )

  function updateQuestion(index: number, patch: Partial<DraftQuestion>) {
    setQuestions((list) => list.map((q, i) => (i === index ? { ...q, ...patch } : q)))
  }
}