import { CalendarDays } from 'lucide-react'
import { useMyEnrollments } from '../../shared/api/learner/LearnerCourseQueries'
import { AcademyLoader } from '../../shared/components/loading/AcademyLoader'
import { PageHeader } from '../../shared/components/layout/PageHeader'

export default function SchedulesPage() {
  const { data: enrollments, isPending, isError } = useMyEnrollments()
  const loading = isPending || (!enrollments && !isError)

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

      {!loading && !isError && enrollments && enrollments.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface-card p-12 text-center">
          <CalendarDays className="mx-auto h-12 w-12 text-blue-400" />
          <h3 className="mt-4 text-lg font-bold text-white">No schedules yet</h3>
          <p className="mt-2 text-sm text-text-secondary">
            Enroll in a course with live sessions to see your schedule here.
          </p>
        </div>
      )}

      {!loading && !isError && enrollments && enrollments.length > 0 && (
        <div className="rounded-2xl border border-border-subtle bg-surface-card p-6">
          <p className="text-sm text-text-secondary">
            You have {enrollments.length} enrolled course{enrollments.length === 1 ? '' : 's'}. Session
            schedules for each course appear on the course page. This page will aggregate live
            session dates once schedules are assigned.
          </p>
        </div>
      )}
    </div>
  )
}

