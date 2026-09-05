import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Clock, GraduationCap, Sparkles } from 'lucide-react'
import { useCourses } from '../../shared/api/courses/CourseQueries'
import { Button } from '../../shared/components/buttons/Button'
import { AcademyLoader } from '../../shared/components/loading/AcademyLoader'
import { ROUTES } from '../../app/routes/constants/shared.paths'
import type { Course } from '../../shared/types'
import { deliveryInfo } from '../../shared/utils/deliveryMode'

function formatFee(course: Course): string {
  const tuition = course.fees.find((f) => f.fee_type === 'tuition')
  if (!tuition) return 'Waived'
  if (tuition.amount <= 0) return 'Sponsored'
  return new Intl.NumberFormat('en-UG').format(Math.round(tuition.amount)) + ' UGX'
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
}

export default function CoursesPage() {
  const { data: courses, isPending, isError } = useCourses()

  const loading = isPending || (!courses && !isError)

  return (
    <div className="bg-surface-page">
      {/* Page header */}
      <section className="relative overflow-hidden border-b border-border-subtle bg-surface-section">
        <div className="pointer-events-none absolute -top-32 right-0 h-80 w-80 rounded-full bg-blue-500/15 blur-[100px]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300">
              <Sparkles className="h-3.5 w-3.5" />
              Explore our courses
            </div>
            <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">Find your path</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">
              Hands-on courses across software, AI, mobile and web - with live sessions,
              real projects and recognised certificates.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Courses grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
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
            <GraduationCap className="mx-auto h-12 w-12 text-blue-400" />
            <h3 className="mt-4 text-lg font-bold text-white">No courses yet</h3>
            <p className="mt-2 text-sm text-text-secondary">
              Courses are being prepared. Check back soon.
            </p>
          </div>
        )}

        <motion.div
          initial="hidden"
          animate={courses && courses.length > 0 ? 'visible' : 'hidden'}
          variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {courses?.map((course) => {
            const delivery = deliveryInfo(course)
            return (
              <motion.article
                key={course.id}
                variants={fadeUp}
                className="group flex flex-col rounded-2xl border border-border-subtle bg-surface-card p-6 transition-all hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-card-hover"
              >
                <div className="mb-4 flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${delivery.badge}`}>
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
                  <Link to={ROUTES.COURSE(course.id)}>
                    <Button size="sm">
                      View course
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.article>
            )
          })}
        </motion.div>
      </section>
    </div>
  )
}