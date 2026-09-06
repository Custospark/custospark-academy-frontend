import { CalendarDays, MapPin, Video } from 'lucide-react'
import { useMySchedules } from '../../shared/api/misc/MiscQueries'
import { AcademyLoader } from '../../shared/components/loading/AcademyLoader'
import { PageHeader } from '../../shared/components/layout/PageHeader'
import type { CourseSchedule } from '../../shared/types'

function formatWhen(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-UG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function groupByCourse(schedules: CourseSchedule[]): Map<string, CourseSchedule[]> {
  const groups = new Map<string, CourseSchedule[]>()
  for (const schedule of schedules) {
    const key = schedule.course_title ?? `Course ${schedule.course_id ?? 'unknown'}`
    const bucket = groups.get(key) ?? []
    bucket.push(schedule)
    groups.set(key, bucket)
  }
  return groups
}

export default function SchedulesPage() {
  const { data: schedules, isPending, isError } = useMySchedules()
  const loading = isPending || (!schedules && !isError)
  const groups = schedules ? groupByCourse(schedules) : new Map<string, CourseSchedule[]>()

  return (
    <div>
      <PageHeader
        title="Schedules"
        description="Upcoming live sessions for the courses you are enrolled in."
      />

      {loading && <AcademyLoader block />}

      {isError && (
        <div className="rounded-2xl border border-semantic-error/40 bg-semantic-error/10 p-8 text-center">
          <p className="text-sm text-semantic-error">Could not load your schedules.</p>
        </div>
      )}

      {!loading && !isError && (schedules?.length ?? 0) === 0 && (
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface-card p-12 text-center">
          <CalendarDays className="mx-auto h-12 w-12 text-blue-400" />
          <h3 className="mt-4 text-lg font-bold text-white">No schedules yet</h3>
          <p className="mt-2 text-sm text-text-secondary">
            Enroll in a course with live sessions to see your schedule here.
          </p>
        </div>
      )}

      {!loading && !isError && (schedules?.length ?? 0) > 0 && (
        <div className="space-y-6">
          {Array.from(groups.entries()).map(([courseTitle, courseSchedules]) => (
            <div key={courseTitle}>
              <h2 className="font-display text-lg font-bold text-white">{courseTitle}</h2>
              <div className="mt-3 space-y-2.5">
                {courseSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-card px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 shrink-0 text-blue-400" />
                      <div>
                        <div className="font-medium text-white">
                          {schedule.title || 'Session'}
                        </div>
                        <div className="text-xs text-text-muted">{formatWhen(schedule.starts_at)}</div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-xs text-text-muted">
                      {schedule.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {schedule.location}
                        </span>
                      )}
                      {schedule.is_online && (
                        <span className="inline-flex items-center gap-1 text-blue-300">
                          <Video className="h-3.5 w-3.5" />
                          Online
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}