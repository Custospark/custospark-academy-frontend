import { ChartColumn } from 'lucide-react'
import type { LearnerCourse } from '../../shared/types/learnerCourse'
import { windowLabel } from '../../shared/utils/assessmentWindows'

/**
 * Learner performance across every assessment in the course: windows,
 * submission state, scores and instructor feedback in one table.
 */
export function PerformanceSection({ course }: { course: LearnerCourse }) {
  const rows: Array<{
    kind: string
    title: string
    opens: string | null
    closes: string | null
    status: string
    score: string
    feedback: string | null
  }> = []

  for (const q of course.quizzes) {
    const s = q.my_status
    rows.push({
      kind: 'Quiz',
      title: q.title,
      opens: q.opens_at,
      closes: q.closes_at,
      status: !s ? 'Not attempted' : s.is_passed ? 'Passed' : 'Attempted',
      score: s ? `${s.score}/${s.max_score}` : '-',
      feedback: null,
    })
  }
  for (const e of course.exercises) {
    const s = e.my_status
    rows.push({
      kind: 'Exercise',
      title: e.title,
      opens: e.opens_at,
      closes: e.closes_at,
      status: !s ? 'Not submitted' : 'is_passed' in s ? (s.is_passed ? 'Passed' : 'Attempted') : s.status === 'graded' ? 'Graded' : 'Submitted for grading',
      score: !s ? '-' : 'is_passed' in s ? `${s.score}/${s.max_score}` : (s.score !== null ? `${s.score}` : '-'),
      feedback: !s || 'is_passed' in s ? null : s.feedback,
    })
  }
  for (const x of course.exams) {
    const s = x.my_status
    rows.push({
      kind: 'Exam',
      title: x.title,
      opens: x.opens_at,
      closes: x.closes_at,
      status: !s ? 'Not submitted' : s.status === 'graded' ? 'Graded' : 'Submitted for grading',
      score: s?.score !== null && s?.score !== undefined ? `${s.score}` : '-',
      feedback: s?.feedback ?? null,
    })
  }
  for (const a of course.assignments) {
    const s = a.my_status
    rows.push({
      kind: 'Assignment',
      title: a.title,
      opens: a.opens_at,
      closes: a.closes_at,
      status: !s ? 'Not submitted' : s.status === 'graded' ? 'Graded' : 'Submitted for grading',
      score: s?.score !== null && s?.score !== undefined ? `${s.score}` : '-',
      feedback: s?.feedback ?? null,
    })
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border-strong bg-surface-card p-10 text-center">
        <ChartColumn className="mx-auto h-10 w-10 text-blue-400" />
        <p className="mt-3 text-sm text-text-secondary">No graded work in this course yet.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl overflow-hidden rounded-2xl border border-border-subtle bg-surface-card">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border-subtle bg-surface-section text-xs uppercase tracking-wider text-text-muted">
            <th className="px-5 py-3 font-semibold">Item</th>
            <th className="px-5 py-3 font-semibold">Window</th>
            <th className="px-5 py-3 font-semibold">Status</th>
            <th className="px-5 py-3 font-semibold">Score</th>
            <th className="px-5 py-3 font-semibold">Feedback</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={`${row.kind}-${i}`} className="border-b border-border-subtle last:border-0">
              <td className="px-5 py-3">
                <div className="font-medium text-white">{row.title}</div>
                <div className="text-xs text-text-muted">{row.kind}</div>
              </td>
              <td className="px-5 py-3 text-xs text-text-muted">
                {windowLabel(row.opens, row.closes) ?? 'Always open'}
              </td>
              <td className="px-5 py-3 text-xs text-text-secondary">{row.status}</td>
              <td className="px-5 py-3 text-xs font-semibold text-white">{row.score}</td>
              <td className="max-w-[220px] truncate px-5 py-3 text-xs text-text-secondary" title={row.feedback ?? ''}>
                {row.feedback ?? '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
