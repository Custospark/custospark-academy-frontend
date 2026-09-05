import { useState } from 'react'
import { CheckCircle2, FileQuestion, XCircle } from 'lucide-react'
import type { LearnerCourse, LearnerQuestion, LearnerQuiz, LearnerExercise, LearnerExam } from '../../shared/types/learnerCourse'
import { Button } from '../../shared/components/buttons/Button'
import { Modal } from '../../shared/components/modals/Modal'
import { useSubmitAttempt, useSubmitWork } from '../../shared/api/learner/LearnerCourseQueries'
import { cn } from '../../shared/utils/cn'

export function AssessmentsSection({ course, courseId }: { course: LearnerCourse; courseId: number }) {
  const [active, setActive] = useState<{ kind: string; quiz?: LearnerQuiz; exercise?: LearnerExercise; exam?: LearnerExam } | null>(null)

  return (
    <div className="max-w-3xl space-y-6">
      <AssessmentGroup
        title="Quizzes"
        items={course.quizzes.map((q) => ({ id: q.id, title: q.title, meta: `${q.questions.length} questions` }))}
        onOpen={(id) => setActive({ kind: 'quiz', quiz: course.quizzes.find((q) => q.id === id) })}
      />
      <AssessmentGroup
        title="Exercises"
        items={course.exercises.map((e) => ({ id: e.id, title: e.title, meta: `${e.questions.length} questions` }))}
        onOpen={(id) => setActive({ kind: 'exercise', exercise: course.exercises.find((e) => e.id === id) })}
      />
      <AssessmentGroup
        title="Exams"
        items={course.exams.map((x) => ({ id: x.id, title: x.title, meta: `${x.questions.length} questions` }))}
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
  items: Array<{ id: number; title: string; meta: string }>
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
                <div className="text-xs text-text-muted">{item.meta}</div>
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
  courseId: number
  kind: string
  quiz?: LearnerQuiz
  exercise?: LearnerExercise
  exam?: LearnerExam
  onClose: () => void
}) {
  const submitAttempt = useSubmitAttempt(courseId)
  const submitWork = useSubmitWork(courseId)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [result, setResult] = useState<{ score: number; max_score: number; is_passed: boolean } | null>(null)

  const assessment = quiz ?? exercise ?? exam
  const title = assessment?.title ?? ''
  const questions: LearnerQuestion[] = assessment?.questions ?? []
  const maxScore = questions.reduce((sum, q) => sum + q.points, 0)

  function handleSubmit() {
    if (!assessment || submitAttempt.isPending || submitWork.isPending) return
    if (kind === 'exam') {
      // Exams are graded by an instructor via the submission endpoint.
      submitWork.mutate(
        {
          type: 'exam',
          typeId: assessment.id,
          content: JSON.stringify(answers),
        },
        {
          onSuccess: () => setResult({ score: 0, max_score: maxScore, is_passed: false }),
        },
      )
      return
    }
    submitAttempt.mutate(
      { type: kind, typeId: assessment.id, answers },
      {
        onSuccess: (data) => setResult(data),
      },
    )
  }

  return (
    <Modal open onClose={onClose} title={title} size="lg" showCloseButton={!submitAttempt.isPending}>
      {result ? (
        <div className="text-center">
          <div
            className={cn(
              'mx-auto flex h-14 w-14 items-center justify-center rounded-full',
              result.is_passed ? 'bg-semantic-success/15 text-semantic-success' : 'bg-semantic-error/15 text-semantic-error',
            )}
          >
            {result.is_passed ? <CheckCircle2 className="h-7 w-7" /> : <XCircle className="h-7 w-7" />}
          </div>
          <h3 className="mt-4 text-lg font-bold text-white">
            {result.is_passed ? 'Passed!' : 'Keep practicing'}
          </h3>
          <p className="mt-2 text-sm text-text-secondary">
            Score: <span className="font-bold text-white">{result.score}</span>/{result.max_score}
          </p>
          <Button className="mt-5" onClick={onClose}>
            Done
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Answer each question below. {kind === 'exam' ? 'Your exam will be graded by an instructor.' : 'Auto-graded on submit.'}
          </p>
          {questions.map((q, index) => (
            <div key={q.id} className="rounded-xl border border-border-subtle bg-surface-section p-4">
              <div className="text-sm font-medium text-white">
                {index + 1}. {q.question}
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
                    placeholder="Your answer"
                    className="w-full rounded-lg border border-border-default bg-surface-input px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none"
                  />
                )}
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-border-subtle pt-4">
            <span className="text-xs text-text-muted">Total: {maxScore} pts</span>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} disabled={submitAttempt.isPending}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} loading={submitAttempt.isPending || submitWork.isPending}>
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}