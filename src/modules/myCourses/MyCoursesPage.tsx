import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, GraduationCap } from 'lucide-react'
import { useMyEnrollments } from '../../shared/api/learner/LearnerCourseQueries'
import { AcademyLoader } from '../../shared/components/loading/AcademyLoader'
import { PageHeader } from '../../shared/components/layout/PageHeader'
import { ROUTES } from '../../app/routes/constants/shared.paths'

const STATUS_STYLE: Record<string, string> = {
  applied: 'bg-blue-500/15 text-blue-300',
  application_fee_paid: 'bg-blue-500/15 text-blue-300',
  admitted: 'bg-semantic-success/15 text-semantic-success',
  tuition_paid: 'bg-semantic-success/15 text-semantic-success',
  in_progress: 'bg-academy-amber/15 text-academy-amber',
  completed: 'bg-academy-teal/15 text-academy-teal',
  certification: 'bg-academy-purple/15 text-academy-purple',
  certified: 'bg-semantic-success/15 text-semantic-success',
  rejected: 'bg-semantic-error/15 text-semantic-error',
  cancelled: 'bg-text-muted/15 text-text-muted',
}

export default function MyCoursesPage() {
  const { data: enrollments, isPending, isError } = useMyEnrollments()
  const loading = isPending || (!enrollments && !isError)

  return (
    <div>
      <PageHeader
        title="My Courses"
        description="Courses you are enrolled in, with progress and next steps."
      />

      {loading && <AcademyLoader block />}

      {isError && (
        <div className="rounded-2xl border border-semantic-error/40 bg-semantic-error/10 p-8 text-center">
          <p className="text-sm text-semantic-error">Could not load your courses.</p>
        </div>
      )}

      {!loading && !isError && enrollments && enrollments.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface-card p-12 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-blue-400" />
          <h3 className="mt-4 text-lg font-bold text-white">You are not enrolled in any courses yet</h3>
          <p className="mt-2 text-sm text-text-secondary">
            Browse the catalog and enroll to start learning.
          </p>
          <Link to={ROUTES.APP.CATALOG}>
            <span className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-electric-blue px-4 py-2 text-sm font-semibold text-white">
              Browse courses
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      )}

      {!loading && !isError && enrollments && enrollments.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => (
            <Link
              key={enrollment.id}
              to={ROUTES.APP.MY_COURSE(enrollment.course_id)}
              className="group flex flex-col rounded-2xl border border-border-subtle bg-surface-card p-6 transition-all hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-card-hover"
            >
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    STATUS_STYLE[enrollment.status] ?? 'bg-blue-500/15 text-blue-300'
                  }`}
                >
                  {enrollment.status.replace(/_/g, ' ')}
                </span>
                <BookOpen className="h-4 w-4 text-blue-400" />
              </div>
              <h3 className="font-display text-lg font-bold text-white">
                {enrollment.course_title}
              </h3>
              <p className="mt-1 text-xs text-text-muted">
                {enrollment.applied_at
                  ? `Enrolled ${new Date(enrollment.applied_at).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' })}`
                  : 'Enrollment pending'}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-4">
                <span className="inline-flex items-center gap-1 text-sm font-medium text-blue-300">
                  Continue
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}