import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Clock } from 'lucide-react'
import { useCourses } from '../../shared/api/courses/CourseQueries'
import { AcademyLoader } from '../../shared/components/loading/AcademyLoader'
import { PageHeader } from '../../shared/components/layout/PageHeader'
import { Button } from '../../shared/components/buttons/Button'
import { deliveryInfo } from '../../shared/utils/deliveryMode'
import { ROUTES } from '../../app/routes/constants/shared.paths'
import type { Course } from '../../shared/types'

function formatFee(course: Course): string {
  const tuition = course.fees.find((f) => f.fee_type === 'tuition')
  if (!tuition) return 'Waived'
  if (tuition.amount <= 0) return 'Sponsored'
  return new Intl.NumberFormat('en-UG').format(Math.round(tuition.amount)) + ' UGX'
}

export default function CatalogPage() {
  const { data: courses, isPending, isError } = useCourses()
  const loading = isPending || (!courses && !isError)

  return (
    <div>
      <PageHeader
        title="Course Catalog"
        description="Browse the courses available at Custospark Academy."
      />

      {loading && <AcademyLoader block />}

      {isError && (
        <div className="rounded-2xl border border-semantic-error/40 bg-semantic-error/10 p-8 text-center">
          <h3 className="text-lg font-bold text-white">Could not load courses</h3>
          <p className="mt-2 text-sm text-text-secondary">
            Something went wrong while fetching courses. Please try again later.
          </p>
        </div>
      )}

      {!loading && !isError && courses && courses.length === 0 && (
        <div className="rounded-2xl border border-border-subtle bg-surface-card p-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-blue-400" />
          <h3 className="mt-4 text-lg font-bold text-white">No courses yet</h3>
          <p className="mt-2 text-sm text-text-secondary">
            Courses are being prepared. Check back soon.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses?.map((course) => {
          const delivery = deliveryInfo(course)
          return (
            <article
              key={course.id}
              className="group flex flex-col rounded-2xl border border-border-subtle bg-surface-card p-6 transition-all hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-card-hover"
            >
              <div className="mb-4 flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${delivery.badge}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${delivery.dot}`} />
                  {delivery.shortLabel}
                </span>
                <span className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
                  {course.category ?? 'Course'}
                </span>
              </div>

              <h3 className="font-display text-xl font-bold text-white">{course.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">
                {course.description}
              </p>

              <div className="mt-4 flex items-center gap-1.5 text-xs text-text-muted">
                <Clock className="h-3.5 w-3.5" />
                {delivery.label}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-border-subtle pt-5">
                <div>
                  <div className="text-xs text-text-muted">Tuition</div>
                  <div className="font-display text-lg font-bold text-blue-400">
                    {formatFee(course)}
                  </div>
                </div>
                <Link to={ROUTES.APP.MY_COURSE(course.id)}>
                  <Button size="sm">
                    Enroll
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}