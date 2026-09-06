import { Link } from 'react-router-dom'
import { BookOpen, GraduationCap } from 'lucide-react'
import { useMyEnrollments } from '../../shared/api/learner/LearnerCourseQueries'
import { AcademyLoader } from '../../shared/components/loading/AcademyLoader'
import { PageHeader } from '../../shared/components/layout/PageHeader'
import {
  EnrollmentActionButton,
  EnrollmentStatusBadge,
} from '../../shared/components/buttons/EnrollmentActionButton'
import { enrollmentMatrix } from '../../shared/utils/enrollmentMatrix'
import { ROUTES } from '../../app/routes/constants/shared.paths'

export default function MyCoursesPage() {
  const { data: enrollments, isPending, isError, refetch } = useMyEnrollments()
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
              <BookOpen className="h-4 w-4" />
            </span>
          </Link>
        </div>
      )}

      {!loading && !isError && enrollments && enrollments.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => {
            const entry = enrollmentMatrix(enrollment.status, enrollment.fees)
            return (
              <div
                key={enrollment.id}
                className="group flex flex-col rounded-2xl border border-border-subtle bg-surface-card p-6 transition-all hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-card-hover"
              >
                <div className="mb-3 flex items-center justify-between">
                  <EnrollmentStatusBadge status={enrollment.status} />
                  <BookOpen className="h-4 w-4 text-blue-400" />
                </div>
                <Link to={ROUTES.APP.MY_COURSE(enrollment.course_id)}>
                  <h3 className="font-display text-lg font-bold text-white transition-colors group-hover:text-blue-200">
                    {enrollment.course_title}
                  </h3>
                </Link>
                <p className="mt-1 text-xs text-text-muted">
                  {enrollment.applied_at
                    ? `Enrolled ${new Date(enrollment.applied_at).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' })}`
                    : 'Enrollment pending'}
                </p>

                {entry.note && (
                  <p className="mt-3 text-xs text-text-secondary">{entry.note}</p>
                )}

                <div className="mt-4 flex items-center gap-3 border-t border-border-subtle pt-4">
                  <EnrollmentActionButton
                    courseId={enrollment.course_id}
                    courseTitle={enrollment.course_title ?? 'Course'}
                    enrollmentId={enrollment.id}
                    status={enrollment.status}
                    fees={enrollment.fees}
                    size="sm"
                    onChanged={refetch}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}