import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Clock, Eye, GraduationCap, Layers, Target } from 'lucide-react'
import { useCourses } from '../../shared/api/courses/CourseQueries'
import { AcademyLoader } from '../../shared/components/loading/AcademyLoader'
import { PageHeader } from '../../shared/components/layout/PageHeader'
import { SearchInput } from '../../shared/components/inputs/SearchInput'
import { Button } from '../../shared/components/buttons/Button'
import { EnrollmentActionButton, EnrollmentStatusBadge } from '../../shared/components/buttons/EnrollmentActionButton'
import { ApplyModal } from '../../shared/components/modals/ApplyModal'
import { deliveryInfo } from '../../shared/utils/deliveryMode'
import { enrollmentMatrix } from '../../shared/utils/enrollmentMatrix'
import { ROUTES } from '../../app/routes/constants/shared.paths'
import type { Course } from '../../shared/types'

function formatFee(course: Course): string {
  const tuition = course.fees.find((f) => f.fee_type === 'tuition')
  if (!tuition) return 'Waived'
  if (tuition.amount <= 0) return 'Sponsored'
  return new Intl.NumberFormat('en-UG').format(Math.round(tuition.amount)) + ' UGX'
}

function applicationFee(course: Course): number {
  return course.fees.find((f) => f.fee_type === 'application')?.amount ?? 0
}

const LEVEL_LABEL: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

export default function CatalogPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [applyCourse, setApplyCourse] = useState<Course | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const { data: courses, isPending, isError, refetch } = useCourses(search)
  const loading = isPending || (!courses && !isError)

  // Debounce search input -> query term.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const refresh = () => {
    setRefreshKey((k) => k + 1)
    refetch()
  }

  return (
    <div>
      <PageHeader
        title="Course Catalog"
        description="Browse the courses available at Custospark Academy."
        actions={
          <div className="w-full sm:w-72">
            <SearchInput
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onClear={() => {
                setSearchInput('')
                setSearch('')
              }}
              placeholder="Search courses..."
            />
          </div>
        }
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
          const enrolled = course.enrollment
          const entry = enrolled ? enrollmentMatrix(enrolled.status, course.fees) : null
          return (
            <article
              key={`${course.id}-${refreshKey}`}
              className="group flex flex-col rounded-2xl border border-border-subtle bg-surface-card p-6 transition-all hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-card-hover"
            >
              <div className="mb-4 flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${delivery.badge}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${delivery.dot}`} />
                  {delivery.shortLabel}
                </span>
                {enrolled ? (
                  <EnrollmentStatusBadge status={enrolled.status} />
                ) : (
                  <span className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
                    {course.category ?? 'Course'}
                  </span>
                )}
              </div>

              <h3 className="font-display text-xl font-bold text-white">{course.title}</h3>
              {!enrolled && course.category && (
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-text-tertiary">
                  {course.category}
                </p>
              )}
              <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">
                {course.description}
              </p>

              {/* Decision info */}
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {delivery.label}
                </span>
                {course.duration_hours ? (
                  <span className="inline-flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5" />
                    {course.duration_hours} hrs
                  </span>
                ) : null}
                {(course.level ?? '') in LEVEL_LABEL && (
                  <span className="inline-flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" />
                    {LEVEL_LABEL[course.level ?? '']}
                  </span>
                )}
              </div>

              {course.prerequisites && (
                <div className="mt-3 flex items-start gap-1.5 text-xs text-text-muted">
                  <Target className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>Prerequisites: {course.prerequisites}</span>
                </div>
              )}

              {enrolled && entry?.note && (
                <p className="mt-3 rounded-lg border border-border-subtle bg-surface-section px-3 py-2 text-xs text-text-secondary">
                  {entry.note}
                </p>
              )}

              <div className="mt-5 flex items-center justify-between gap-2 border-t border-border-subtle pt-5">
                <div>
                  <div className="text-xs text-text-muted">Tuition</div>
                  <div className="font-display text-lg font-bold text-blue-400">
                    {formatFee(course)}
                  </div>
                </div>
                {enrolled ? (
                  <EnrollmentActionButton
                    courseId={course.id}
                    courseTitle={course.title}
                    enrollmentId={enrolled.id}
                    status={enrolled.status}
                    fees={course.fees}
                    size="sm"
                    onChanged={refresh}
                  />
                ) : (
                  <Button size="sm" onClick={() => setApplyCourse(course)}>
                    Enroll
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <Link
                to={ROUTES.APP.COURSE(course.id)}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-300 transition-colors hover:text-blue-200"
              >
                <Eye className="h-3.5 w-3.5" />
                View course details
              </Link>
            </article>
          )
        })}
      </div>

      <ApplyModal
        open={applyCourse !== null}
        onClose={() => setApplyCourse(null)}
        courseId={applyCourse?.id ?? 0}
        courseTitle={applyCourse?.title ?? ''}
        applicationFee={applyCourse ? applicationFee(applyCourse) : 0}
        onChanged={refresh}
      />
    </div>
  )
}