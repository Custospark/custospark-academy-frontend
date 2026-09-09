import { useState, type FormEvent } from 'react'
import { Download, FileQuestion, FileUp, Plus, Trash2, ClipboardCheck, BookMarked, FileCheck2, Sheet } from 'lucide-react'
import { fromInputDateTime, windowLabel } from '../../../../shared/utils/assessmentWindows'
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
  useImportQuestions,
  useImportResults,
  useQuestionsTemplate,
  useResultsTemplate,
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
  const createQuiz = useCreateQuiz(course.slug)
  const deleteQuiz = useDeleteQuiz(course.slug)
  const createExercise = useCreateExercise(course.slug)
  const deleteExercise = useDeleteExercise(course.slug)
  const createExam = useCreateExam(course.slug)
  const deleteExam = useDeleteExam(course.slug)

  const [title, setTitle] = useState('')
  const [passing, setPassing] = useState('50')
  const [maxAttempts, setMaxAttempts] = useState('2')
  const [opensAt, setOpensAt] = useState('')
  const [closesAt, setClosesAt] = useState('')
  const [questions, setQuestions] = useState<DraftQuestion[]>([{ ...EMPTY_QUESTION }])
  const [paperFile, setPaperFile] = useState<File | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [resultsTarget, setResultsTarget] = useState<{ kind: Kind; id: number } | null>(null)

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
    setMaxAttempts('2')
    setOpensAt('')
    setClosesAt('')
    setQuestions([{ ...EMPTY_QUESTION }])
    setPaperFile(null)
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
    if (kind === 'exam' && cleanQuestions.length === 0 && !paperFile) {
      setFormError('Attach an exam paper file or add at least one typed question.')
      return
    }
    creators[kind]({
      title: title.trim(),
      passing_score: Number(passing) || 50,
      max_attempts: Math.min(10, Math.max(1, Number(maxAttempts) || 2)),
      max_score: 100,
      questions: cleanQuestions,
      opens_at: fromInputDateTime(opensAt),
      closes_at: fromInputDateTime(closesAt),
      ...(kind !== 'quiz' && paperFile ? { file: paperFile } : {}),
      // Paper-backed exercises are instructor-graded, never auto-graded.
      ...(kind === 'exercise' && paperFile ? { type: 'practical' } : {}),
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
        <Button size="sm" variant="outline" onClick={() => setImportOpen(true)}>
          <Sheet className="h-4 w-4" />
          Import from Excel
        </Button>
      </div>

      <ImportQuestionsDialog
        course={course}
        open={importOpen}
        onClose={() => setImportOpen(false)}
      />

      {resultsTarget && (
        <ResultsImportDialog
          courseSlug={course.slug}
          kind={resultsTarget.kind}
          parentId={resultsTarget.id}
          onClose={() => setResultsTarget(null)}
        />
      )}

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
                          {windowLabel(item.opens_at, item.closes_at) && (
                            <span className="rounded-full bg-surface-section px-2 py-0.5">
                              {windowLabel(item.opens_at, item.closes_at)}
                            </span>
                          )}
                          {k !== 'quiz' && 'file_path' in item && item.file_path && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 font-medium text-blue-300">
                              <FileCheck2 className="h-3 w-3" />
                              Paper attached
                            </span>
                          )}
                        </div>
                      </div>
                      {k !== 'quiz' && (
                        <button
                          type="button"
                          onClick={() => setResultsTarget({ kind: k, id: item.id })}
                          className="flex h-7 items-center gap-1 rounded-md px-2 text-xs font-semibold text-text-muted transition-colors hover:bg-surface-card-hover hover:text-white"
                          aria-label={`Upload results for ${item.title}`}
                          title="Upload results (Excel)"
                        >
                          <FileUp className="h-3.5 w-3.5" />
                          Results
                        </button>
                      )}
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
          {(kind === 'exam' || kind === 'exercise') && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                Paper file (PDF, optional)
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-border-default bg-surface-card px-4 py-3">
                <FileUp className="h-5 w-5 shrink-0 text-blue-300" />
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  onChange={(e) => setPaperFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-blue-500/15 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-300"
                />
              </div>
              <p className="mt-1.5 text-xs text-text-muted">
                {paperFile
                  ? `Selected: ${paperFile.name}`
                  : 'Learners download the paper, then upload their answer script for instructor grading. Combine with typed questions or use the paper alone.'}
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <Input
              label="Passing score (%)"
              type="number"
              min={0}
              max={100}
              value={passing}
              onChange={(e) => setPassing(e.target.value)}
            />
            <Input
              label="Max attempts"
              type="number"
              min={1}
              max={10}
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(e.target.value)}
            />
            <Input
              label="Opens at (optional)"
              type="datetime-local"
              value={opensAt}
              onChange={(e) => setOpensAt(e.target.value)}
            />
            <Input
              label="Closes at (optional)"
              type="datetime-local"
              value={closesAt}
              onChange={(e) => setClosesAt(e.target.value)}
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

const IMPORT_KIND_LABEL: Record<Kind, string> = { quiz: 'Quiz', exercise: 'Exercise', exam: 'Exam' }

/**
 * One obvious place to bulk-upload questions: pick the target assessment,
 * download the fill-in template, then upload the filled file. Template,
 * picker and uploader live together so the flow is never a dead end.
 */
function ImportQuestionsDialog({
  course,
  open,
  onClose,
}: {
  course: CourseFull
  open: boolean
  onClose: () => void
}) {
  const [kind, setKind] = useState<Kind>('quiz')
  const [targetId, setTargetId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const importQuestions = useImportQuestions(course.slug)
  const downloadTemplate = useQuestionsTemplate(course.slug)

  const targets =
    kind === 'quiz' ? course.quizzes : kind === 'exercise' ? course.exercises : course.exams

  function handleUpload() {
    if (!targetId || !file || importQuestions.isPending) return
    importQuestions.mutate(
      { kind, parentId: Number(targetId), file },
      {
        onSuccess: () => {
          setFile(null)
          setTargetId('')
          onClose()
        },
      },
    )
  }

  return (
    <Modal open={open} onClose={onClose} title="Import questions from Excel" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          Download the template, fill in one question per row (options separated by{' '}
          <code className="rounded bg-surface-input px-1 font-mono text-xs">|</code>), then upload
          it here.
        </p>

        <button
          type="button"
          onClick={() => void downloadTemplate()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-300 transition-colors hover:text-blue-200"
        >
          <Download className="h-4 w-4" />
          Download Excel template
        </button>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">Type</label>
            <select
              value={kind}
              onChange={(e) => {
                setKind(e.target.value as Kind)
                setTargetId('')
              }}
              className="w-full rounded-lg border border-border-default bg-surface-input px-3 py-2.5 text-sm text-text-primary focus:border-border-focus focus:outline-none"
            >
              {(['quiz', 'exercise', 'exam'] as Kind[]).map((k) => (
                <option key={k} value={k}>
                  {IMPORT_KIND_LABEL[k]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Into {IMPORT_KIND_LABEL[kind].toLowerCase()}
            </label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full rounded-lg border border-border-default bg-surface-input px-3 py-2.5 text-sm text-text-primary focus:border-border-focus focus:outline-none"
            >
              <option value="">Select...</option>
              {targets.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Filled Excel file
          </label>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-lg border border-border-default bg-surface-input px-3 py-2.5 text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-blue-500/15 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-300"
          />
          {file && <p className="mt-1.5 text-xs text-text-muted">Selected: {file.name}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            loading={importQuestions.isPending}
            disabled={!targetId || !file}
          >
            <Sheet className="h-4 w-4" />
            Upload questions
          </Button>
        </div>
      </div>
    </Modal>
  )
}
const RESULTS_KIND_LABEL: Record<Kind, string> = { quiz: 'Quiz', exercise: 'Exercise', exam: 'Exam' }

/**
 * Bulk instructor results for one assessment: download the fill-in template
 * (learner_email | score | feedback), then upload it. Rows for learners who
 * are not enrolled (or bad scores) are reported back, the rest become graded
 * submissions the learner sees as performance.
 */
function ResultsImportDialog({
  courseSlug,
  kind,
  parentId,
  onClose,
}: {
  courseSlug: string
  kind: Kind
  parentId: number
  onClose: () => void
}) {
  const [file, setFile] = useState<File | null>(null)
  const importResults = useImportResults(courseSlug)
  const downloadTemplate = useResultsTemplate(courseSlug)

  function handleUpload() {
    if (!file || importResults.isPending) return
    importResults.mutate(
      { kind, parentId, file },
      {
        onSuccess: () => {
          setFile(null)
          onClose()
        },
      },
    )
  }

  return (
    <Modal open onClose={onClose} title={`Upload ${RESULTS_KIND_LABEL[kind].toLowerCase()} results`} size="sm">
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          Download the template, fill one row per learner (email, score, grade like A/85%, feedback), then upload
          it here. Each row becomes a graded result the learner can see.
        </p>

        <button
          type="button"
          onClick={() => void downloadTemplate()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-300 transition-colors hover:text-blue-200"
        >
          <Download className="h-4 w-4" />
          Download results template
        </button>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Filled Excel file
          </label>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-lg border border-border-default bg-surface-input px-3 py-2.5 text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-blue-500/15 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-300"
          />
          {file && <p className="mt-1.5 text-xs text-text-muted">Selected: {file.name}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpload} loading={importResults.isPending} disabled={!file}>
            <FileUp className="h-4 w-4" />
            Upload results
          </Button>
        </div>
      </div>
    </Modal>
  )
}
