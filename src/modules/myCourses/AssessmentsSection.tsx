import { useEffect, useState } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight, Download, FileQuestion, FileUp, XCircle } from 'lucide-react'
import type { LearnerCourse, LearnerQuestion, LearnerQuiz, LearnerExercise, LearnerExam } from '../../shared/types/learnerCourse'
import { Button } from '../../shared/components/buttons/Button'
import { Modal } from '../../shared/components/modals/Modal'
import { useSubmitAttempt, useSubmitWork } from '../../shared/api/learner/LearnerCourseQueries'
import { useAppSelector } from '../../app/store/hooks/useApp'
import { useToast } from '../../app/contexts/useToast'
import { apiErrorMessage } from '../../shared/utils/apiError'
import { storageUrl } from '../../shared/utils/storageUrl'
import { windowBlockedReason } from '../../shared/utils/assessmentWindows'
import { AssessmentBadges } from './assessmentMeta'
import { cn } from '../../shared/utils/cn'

const PAGE_SIZE = 5

/** Percent score standard: 3/4 -> 75%. */
export function percentOf(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0
  return Math.round((score / maxScore) * 100)
}

/** Draft answers autosaved per learner + assessment so work is never lost. */
function useAttemptDraft(key: string | null) {
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    if (!key) return {}
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as Record<number, string>) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    if (!key) return
    try {
      localStorage.setItem(key, JSON.stringify(answers))
    } catch {
      // Storage full/blocked - the in-memory answers still work.
    }
  }, [key, answers])

  function clear() {
    if (key) {
      try {
        localStorage.removeItem(key)
      } catch {
        // Ignore.
      }
    }
    setAnswers({})
  }

  return [answers, setAnswers, clear] as const
}

export function AssessmentsSection({ course, courseId }: { course: LearnerCourse; courseId: string }) {
  const [active, setActive] = useState<{ kind: string; quiz?: LearnerQuiz; exercise?: LearnerExercise; exam?: LearnerExam } | null>(null)

  return (
    <div className="max-w-3xl space-y-6">
      <AssessmentGroup
        title="Quizzes"
        items={course.quizzes.map((q) => ({ id: q.id, title: q.title, meta: `${q.questions.length} questions`, item: q }))}
        onOpen={(id) => setActive({ kind: 'quiz', quiz: course.quizzes.find((q) => q.id === id) })}
      />
      <AssessmentGroup
        title="Exercises"
        items={course.exercises.map((e) => ({
          id: e.id,
          title: e.title,
          meta: e.file_path
            ? `${e.questions.length} questions · paper attached`
            : `${e.questions.length} questions`,
          item: e,
        }))}
        onOpen={(id) => setActive({ kind: 'exercise', exercise: course.exercises.find((e) => e.id === id) })}
      />
      <AssessmentGroup
        title="Exams"
        items={course.exams.map((x) => ({
          id: x.id,
          title: x.title,
          meta: x.file_path
            ? `${x.questions.length} questions · paper attached`
            : `${x.questions.length} questions`,
          item: x,
        }))}
        onOpen={(id) => setActive({ kind: 'exam', exam: course.exams.find((x) => x.id === id) })}
      />

      {active && (
        <AttemptModal
          courseId={courseId}
          kind={active.kind}
          quiz={active.quiz}
          exercise={active.exercise}
          exam={active.exam}
          onClose={() => setActive(null)}
        />
      )}
    </div>
  )
}

function AssessmentGroup({
  title,
  items,
  onOpen,
}: {
  title: string
  items: Array<{ id: number; title: string; meta: string; item: LearnerQuiz | LearnerExercise | LearnerExam }>
  onOpen: (id: number) => void
}) {
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-2 font-display text-base font-bold text-white">
        <FileQuestion className="h-4 w-4 text-blue-400" />
        {title}
        <span className="text-xs font-normal text-text-muted">({items.length})</span>
      </h3>
      {items.length === 0 ? (
        <p className="mb-3 text-sm text-text-muted">None yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpen(item.id)}
              className="flex w-full items-center gap-3 rounded-xl border border-border-subtle bg-surface-card px-4 py-3 text-left transition-colors hover:border-border-strong"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-white">{item.title}</div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-text-muted">
                  <span>{item.meta}</span>
                  <AssessmentBadges item={item.item} />
                </div>
              </div>
              <span className="text-sm font-medium text-blue-300">Take</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function AttemptModal({
  courseId,
  kind,
  quiz,
  exercise,
  exam,
  onClose,
}: {
  courseId: string
  kind: string
  quiz?: LearnerQuiz
  exercise?: LearnerExercise
  exam?: LearnerExam
  onClose: () => void
}) {
  const submitAttempt = useSubmitAttempt(courseId)
  const submitWork = useSubmitWork(courseId)
  const userId = useAppSelector((s) => s.auth.user?.id ?? 'guest')
  const [answerFile, setAnswerFile] = useState<File | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<{ score: number; max_score: number; is_passed: boolean } | null>(null)
  const [examSubmitted, setExamSubmitted] = useState(false)
  const [page, setPage] = useState(0)
  const { showToast } = useToast()

  const assessment = quiz ?? exercise ?? exam
  const assessmentId = assessment?.id ?? 0
  const title = assessment?.title ?? ''
  const questions: LearnerQuestion[] = assessment?.questions ?? []
  const maxScore = questions.reduce((sum, q) => sum + q.points, 0)
  const blockedReason = assessment
    ? windowBlockedReason(assessment.opens_at, assessment.closes_at)
    : null
  const examPaperUrl = kind === 'exam' ? storageUrl(exam?.file_path) : null
  const exercisePaperUrl = kind === 'exercise' ? storageUrl(exercise?.file_path) : null
  const paperUrl = examPaperUrl ?? exercisePaperUrl
  // File-backed assessments are graded by an instructor via submissions.
  const manualGrading = kind === 'exam' || exercisePaperUrl !== null
  const paperNeedsFile = paperUrl !== null && questions.length === 0

  // Attempt budget (auto-graded path only): default 2, settable per quiz/exercise.
  const maxAttempts = kind === 'quiz' ? (quiz?.max_attempts ?? 2) : kind === 'exercise' && !manualGrading ? (exercise?.max_attempts ?? 2) : null
  const usedAttempts =
    kind === 'quiz'
      ? (quiz?.my_status?.attempts_used ?? 0)
      : kind === 'exercise' && !manualGrading
        ? ((exercise?.my_status && 'attempts_used' in exercise.my_status ? exercise.my_status.attempts_used : 0) ?? 0)
        : 0
  const exhausted = !manualGrading && maxAttempts !== null && usedAttempts >= maxAttempts

  // Draft answers autosave under learner + assessment so work survives refresh.
  const draftKey = assessment ? `academy:draft:${userId}:${courseId}:${kind}:${assessmentId}` : null
  const [answers, setAnswers, clearDraft] = useAttemptDraft(draftKey)

  const pageCount = Math.max(1, Math.ceil(questions.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const pageQuestions = questions.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)
  const answeredCount = questions.filter((q) => (answers[q.id] ?? '').trim() !== '').length

  function handleSubmit() {
    if (!assessment || submitAttempt.isPending || submitWork.isPending || blockedReason || exhausted) return
    setSubmitError(null)
    if (manualGrading) {
      // Paper-only assessments require an uploaded answer script.
      if (paperNeedsFile && !answerFile) {
        setSubmitError('Upload your answer script to submit.')
        return
      }
      submitWork.mutate(
        {
          type: kind,
          typeId: assessment.id,
          content: JSON.stringify(answers),
          file: answerFile ?? undefined,
        },
        {
          onSuccess: () => {
            clearDraft()
            setExamSubmitted(true)
            showToast('success', 'Submitted for grading.')
          },
          onError: (err) => {
            const message = apiErrorMessage(err, 'Could not submit.')
            setSubmitError(message)
            showToast('error', message)
          },
        },
      )
      return
    }
    submitAttempt.mutate(
      { type: kind, typeId: assessment.id, answers },
      {
        onSuccess: (data) => {
          clearDraft()
          setResult(data)
        },
        onError: (err) => {
          const message = apiErrorMessage(err, 'Could not submit your answers.')
          setSubmitError(message)
          showToast('error', message)
        },
      },
    )
  }

  return (
    <Modal open onClose={onClose} title={title} size="xl" showCloseButton={!submitAttempt.isPending}>
      {examSubmitted ? (
        <div className="py-4 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-semantic-success" />
          <h3 className="mt-4 text-lg font-bold text-white">Submitted</h3>
          <p className="mt-1.5 text-sm text-text-secondary">
            Your answers are with the instructor for grading. You will see your score here once graded.
          </p>
          <Button className="mt-5" onClick={onClose}>
            Done
          </Button>
        </div>
      ) : result ? (
        <div className="py-4 text-center">
          <div
            className={cn(
              'mx-auto flex h-20 w-20 items-center justify-center rounded-full',
              result.is_passed ? 'bg-semantic-success/15 text-semantic-success' : 'bg-semantic-error/15 text-semantic-error',
            )}
          >
            {result.is_passed ? <CheckCircle2 className="h-10 w-10" /> : <XCircle className="h-10 w-10" />}
          </div>
          <div className="mt-4 font-display text-5xl font-bold text-white">
            {percentOf(result.score, result.max_score)}
            <span className="text-2xl text-text-muted">%</span>
          </div>
          <h3 className="mt-2 text-lg font-bold text-white">
            {result.is_passed ? 'Passed!' : 'Keep practicing'}
          </h3>
          <p className="mt-1.5 text-sm text-text-secondary">
            Score: <span className="font-bold text-white">{result.score}</span>/{result.max_score}
            {maxAttempts !== null && ` · Attempt ${usedAttempts + 1} of ${maxAttempts}`}
          </p>
          <Button className="mt-5" onClick={onClose}>
            Done
          </Button>
        </div>
      ) : exhausted ? (
        <div className="py-4 text-center">
          <XCircle className="mx-auto h-12 w-12 text-semantic-error" />
          <h3 className="mt-4 text-lg font-bold text-white">No attempts left</h3>
          <p className="mt-1.5 text-sm text-text-secondary">
            You have used all {maxAttempts} attempt{maxAttempts === 1 ? '' : 's'} for this{' '}
            {kind}. Contact your instructor if you need another chance.
          </p>
          <Button className="mt-5" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {blockedReason && (
            <p className="rounded-lg border border-semantic-error/40 bg-semantic-error/10 px-4 py-3 text-sm text-semantic-error">
              {blockedReason}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-text-secondary">
              {questions.length > 0 ? (
                <>
                  Answer each question below.{' '}
                  {manualGrading ? 'This will be graded by an instructor.' : 'Auto-graded on submit.'}
                </>
              ) : (
                'Download the paper file, complete it, then upload your answer script.'
              )}
            </p>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              {maxAttempts !== null && (
                <span className="rounded-full bg-surface-section px-2.5 py-1 font-medium">
                  Attempt {usedAttempts + 1} of {maxAttempts}
                </span>
              )}
              {questions.length > 0 && (
                <span className="rounded-full bg-surface-section px-2.5 py-1 font-medium">
                  {answeredCount}/{questions.length} answered
                </span>
              )}
            </div>
          </div>
          {paperUrl && (
            <a
              href={paperUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-3 transition-colors hover:border-blue-500"
            >
              <Download className="h-5 w-5 shrink-0 text-blue-300" />
              <span className="text-sm font-medium text-white">Download paper</span>
            </a>
          )}
          {pageQuestions.map((q) => {
            const number = questions.findIndex((item) => item.id === q.id) + 1
            return (
              <div key={q.id} className="rounded-xl border border-border-subtle bg-surface-section p-4">
                <div className="text-sm font-medium text-white">
                  {number}. {q.question}
                  <span className="ml-2 text-xs font-normal text-text-muted">({q.points} pts)</span>
                </div>
                <div className="mt-3 space-y-2">
                  {q.options?.map((option) => (
                    <label
                      key={option}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-border-default px-3 py-2 text-sm text-text-secondary transition-colors has-[:checked]:border-blue-500 has-[:checked]:bg-blue-500/10"
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={option}
                        checked={answers[q.id] === option}
                        onChange={() => setAnswers((a) => ({ ...a, [q.id]: option }))}
                        className="h-4 w-4 accent-electric-blue"
                      />
                      {option}
                    </label>
                  ))}
                  {!q.options && (
                    <input
                      type="text"
                      value={answers[q.id] ?? ''}
                      onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                      placeholder="Your answer (saved automatically)"
                      className="w-full rounded-lg border border-border-default bg-surface-input px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none"
                    />
                  )}
                </div>
              </div>
            )
          })}
          {pageCount > 1 && (
            <div className="flex items-center justify-between pt-1">
              <Button
                variant="outline"
                size="sm"
                disabled={safePage === 0}
                onClick={() => setPage(safePage - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-xs text-text-muted">
                Page {safePage + 1} of {pageCount} · answers save automatically
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={safePage >= pageCount - 1}
                onClick={() => setPage(safePage + 1)}
              >
                Save &amp; next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          {manualGrading && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                Upload answer script{paperNeedsFile ? ' (required)' : ' (optional)'}
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-border-default bg-surface-card px-4 py-3">
                <FileUp className="h-5 w-5 shrink-0 text-blue-300" />
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  onChange={(e) => setAnswerFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-blue-500/15 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-300"
                />
              </div>
              {answerFile && (
                <p className="mt-1.5 text-xs text-text-muted">Selected: {answerFile.name}</p>
              )}
            </div>
          )}
          {submitError && (
            <p className="rounded-lg border border-semantic-error/40 bg-semantic-error/10 px-4 py-3 text-sm text-semantic-error">
              {submitError}
            </p>
          )}
          <div className="flex items-center justify-between border-t border-border-subtle pt-4">
            <span className="text-xs text-text-muted">
              Total: {maxScore} pts · {answeredCount}/{questions.length} answered
              {maxAttempts !== null && ` · Attempt ${usedAttempts + 1} of ${maxAttempts}`}
            </span>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} disabled={submitAttempt.isPending}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} loading={submitAttempt.isPending || submitWork.isPending} disabled={blockedReason !== null}>
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}