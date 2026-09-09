import { useEffect, useState } from 'react'
import { CalendarCheck, Users } from 'lucide-react'
import type { CourseFull } from '../../../../shared/types/courseContent'
import { Button } from '../../../../shared/components/buttons/Button'
import { Input } from '../../../../shared/components/inputs/Input'
import { AcademyLoader } from '../../../../shared/components/loading/AcademyLoader'
import {
  useAttendanceRoster,
  useMarkAllAttendance,
  useMarkAttendance,
  type AttendanceStatus,
} from '../../../../shared/api/misc/MiscQueries'
import { cn } from '../../../../shared/utils/cn'

const STATUSES: Array<{ value: AttendanceStatus; label: string }> = [
  { value: 'present', label: 'Present' },
  { value: 'late', label: 'Late' },
  { value: 'absent', label: 'Absent' },
  { value: 'excused', label: 'Excused' },
]

const STATUS_STYLE: Record<AttendanceStatus, string> = {
  present: 'bg-semantic-success/15 text-semantic-success',
  late: 'bg-academy-amber/15 text-academy-amber',
  absent: 'bg-semantic-error/15 text-semantic-error',
  excused: 'bg-blue-500/15 text-blue-300',
}

function todayInput(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/**
 * Digital class register: pick a date, mark each admitted learner (or the
 * whole class at once), and watch each learner's auto-calculated rate.
 */
export function AttendanceTab({ course }: { course: CourseFull }) {
  const [date, setDate] = useState(todayInput)
  const { data: roster, isPending } = useAttendanceRoster(course.slug, date)
  const mark = useMarkAttendance(course.slug)
  const markAll = useMarkAllAttendance(course.slug)
  const [marks, setMarks] = useState<Record<number, AttendanceStatus>>({})

  useEffect(() => {
    const next: Record<number, AttendanceStatus> = {}
    for (const row of roster ?? []) {
      if (row.status) next[row.user_id] = row.status
    }
    setMarks(next)
  }, [roster, date])

  const busy = mark.isPending || markAll.isPending

  function handleSave() {
    const records = Object.entries(marks).map(([user_id, status]) => ({
      user_id: Number(user_id),
      status,
    }))
    if (records.length === 0 || busy) return
    mark.mutate({ date, records })
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-48">
          <Input
            label="Session date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          loading={markAll.isPending}
          onClick={() => markAll.mutate({ date, status: 'present' })}
        >
          <Users className="h-4 w-4" />
          Mark all present
        </Button>
        <Button size="sm" disabled={busy} loading={mark.isPending} onClick={handleSave}>
          <CalendarCheck className="h-4 w-4" />
          Save register
        </Button>
      </div>

      {isPending && <AcademyLoader block />}

      {!isPending && (roster ?? []).length === 0 && (
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface-card p-10 text-center">
          <Users className="mx-auto h-10 w-10 text-blue-400" />
          <p className="mt-3 text-sm text-text-secondary">
            No learners with a live enrollment on this course yet.
          </p>
        </div>
      )}

      <ul className="space-y-2">
        {(roster ?? []).map((row) => (
          <li
            key={row.user_id}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-border-subtle bg-surface-card px-4 py-3"
          >
            <div className="min-w-0 flex-1 basis-48">
              <div className="truncate font-medium text-white">{row.name}</div>
              <div className="truncate text-xs text-text-muted">
                {row.email} · {row.rate}% attendance
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMarks((m) => ({ ...m, [row.user_id]: option.value }))}
                  className={cn(
                    'rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors',
                    marks[row.user_id] === option.value
                      ? STATUS_STYLE[option.value]
                      : 'border border-border-default text-text-muted hover:border-border-strong hover:text-white',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
