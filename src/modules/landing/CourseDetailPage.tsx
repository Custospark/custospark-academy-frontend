import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  GraduationCap,
  MapPin,
  ScrollText,
  Users,
  Video,
} from 'lucide-react'
import { useCourse } from '../../shared/api/courses/CourseQueries'
import { Button } from '../../shared/components/buttons/Button'
import {
  EnrollmentActionButton,
  EnrollmentStatusBadge,
} from '../../shared/components/buttons/EnrollmentActionButton'
import { ApplyModal } from '../../shared/components/modals/ApplyModal'
import { CertificatePreviewModal } from '../../shared/components/certificates/CertificatePreviewModal'
import { AcademyLoader } from '../../shared/components/loading/AcademyLoader'
import { ROUTES } from '../../app/routes/constants/shared.paths'
import { useAppSelector } from '../../app/store/hooks/useApp'
import type { CourseFee } from '../../shared/types'
import { deliveryInfo } from '../../shared/utils/deliveryMode'
import { enrollmentMatrix } from '../../shared/utils/enrollmentMatrix'

const CATEGORY_DOT: Record<string, string> = {
  'Software & Coding': 'bg-cat-software',
  'Design & UI/UX': 'bg-cat-design',
  'AI & Technology': 'bg-cat-ai',
  Business: 'bg-cat-business',
  'Mobile Development': 'bg-cat-mobile',
  Entrepreneurship: 'bg-cat-entrepreneurship',
}

const FEE_LABELS: Record<string, string> = {
  application: 'Application fee',
  tuition: 'Tuition',
  certificate: 'Certificate',
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat('en-UG').format(Math.round(amount)) + ' UGX'
}

/**
 * Zero-fee handling: we avoid "Free" (users read it as low value). Tuition is
 * "Sponsored" when zero; other fees (application/certificate) are "Waived".
 */
function feeAmountLabel(fee: CourseFee): string {
  if (fee.amount > 0) return formatMoney(fee.amount)
  return fee.fee_type === 'tuition' ? 'Sponsored' : 'Waived'
}

function feeTotal(fees: CourseFee[]): number {
  return fees.reduce((sum, fee) => sum + fee.amount, 0)
}

function isSponsored(fees: CourseFee[]): boolean {
  return fees.every((fee) => fee.amount <= 0)
}

function formatDate(date: string | null): string | null {
  if (!date) return null
  return new Date(date).toLocaleDateString('en-UG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)
  const [applyOpen, setApplyOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const { data: course, isPending, isError, refetch } = useCourse(id ?? '')

  // Keep the loader visible until we actually have data (not just until the
  // query transitions out of its initial pending state). This prevents the
  // loader from vanishing before the fetched content is ready to render.
  if (isPending || (!course && !isError)) {
    return (
      <div className="min-h-[60vh] bg-surface-page">
        <AcademyLoader block />
      </div>
    )
  }

  if (isError || !course) {
    return (
      <div className="min-h-[60vh] bg-surface-page px-6 py-24">
        <div className="mx-auto max-w-md rounded-2xl border border-semantic-error/40 bg-semantic-error/10 p-8 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-semantic-error" />
          <h1 className="mt-4 text-xl font-bold text-white">Course not found</h1>
          <p className="mt-2 text-sm text-text-secondary">
            This course may have been removed or is no longer available.
          </p>
          <Link to={isAuthenticated ? ROUTES.APP.CATALOG : ROUTES.COURSES}>
            <Button variant="outline" size="md" className="mt-6">
              <ArrowLeft className="h-4 w-4" />
              Back to courses
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const dot = CATEGORY_DOT[course.category ?? ''] ?? 'bg-cat-software'
  const delivery = deliveryInfo(course)
  const startDate = formatDate(course.start_date)
  const endDate = formatDate(course.end_date)
  const tuition = course.fees.find((f) => f.fee_type === 'tuition')
  const total = feeTotal(course.fees)
  const enrolled = course.enrollment
  const entry = enrolled ? enrollmentMatrix(enrolled.status, course.fees) : null

  return (
    <div className="bg-surface-page">
      {/* Breadcrumb */}
      <div className="border-b border-border-subtle bg-surface-section">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <nav className="flex min-w-0 items-center gap-2 text-sm" aria-label="Breadcrumb">
            <Link to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME} className="font-medium text-text-secondary transition-colors hover:text-white">
              {isAuthenticated ? 'Dashboard' : 'Home'}
            </Link>
            <span className="hidden text-text-muted sm:inline">/</span>
            <span className="hidden sm:contents">
              <Link
                to={isAuthenticated ? ROUTES.APP.CATALOG : ROUTES.COURSES}
                className="hidden font-medium text-text-secondary transition-colors hover:text-white sm:inline"
              >
                Courses
              </Link>
              <span className="hidden text-text-muted sm:inline">/</span>
            </span>
            <span className="truncate font-semibold text-white">{course.title}</span>
          </nav>
          <Link
            to={isAuthenticated ? ROUTES.APP.CATALOG : ROUTES.COURSES}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border-default px-3 py-2 text-xs font-semibold text-text-secondary transition-colors hover:border-border-strong hover:bg-surface-card hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">All courses</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border-subtle bg-surface-section">
        <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-blue-500/15 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-32 left-0 h-72 w-72 rounded-full bg-orange-500/10 blur-[100px]" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${delivery.badge}`}>
                <span className={`h-2 w-2 rounded-full ${delivery.dot}`} />
                {delivery.label}
              </span>
              <span className="inline-flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                <span className="text-sm font-medium uppercase tracking-wide text-text-tertiary">
                  {course.category}
                </span>
              </span>
            </div>
            <h1 className="max-w-3xl font-display text-4xl font-bold text-white sm:text-5xl">
              {course.title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-text-secondary">{course.description}</p>

            <div className="mt-6 rounded-xl border border-border-subtle bg-surface-card/60 px-5 py-4 text-sm text-text-secondary">
              {delivery.description}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-text-secondary">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-blue-400" />
                {delivery.label}
              </span>
              {startDate && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-blue-400" />
                  Starts {startDate}
                </span>
              )}
              {endDate && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-blue-400" />
                  Ends {endDate}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-10 lg:col-span-2">
            {/* Fees */}
            <div>
              <h2 className="font-display text-2xl font-bold text-white">Course fees</h2>
              <div className="mt-5 space-y-3">
                {course.fees.map((fee) => (
                  <div
                    key={fee.fee_type}
                    className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-card px-5 py-4"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-academy-teal" />
                      <div>
                        <div className="font-medium text-white">{FEE_LABELS[fee.fee_type]}</div>
                        <div className="text-xs text-text-muted">{fee.currency}</div>
                      </div>
                    </div>
                    <div
                      className={`font-display text-lg font-bold ${
                        fee.amount <= 0 ? 'text-academy-teal' : 'text-blue-400'
                      }`}
                    >
                      {feeAmountLabel(fee)}
                    </div>
                  </div>
                ))}
                {isSponsored(course.fees) ? (
                  <div className="flex items-center justify-between rounded-xl border border-border-strong bg-surface-card-hover px-5 py-4">
                    <div className="font-medium text-white">Investment</div>
                    <div className="font-display text-xl font-bold text-academy-teal">Sponsored</div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between rounded-xl border border-border-strong bg-surface-card-hover px-5 py-4">
                    <div className="font-medium text-white">Total investment</div>
                    <div className="font-display text-xl font-bold text-blue-300">{formatMoney(total)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Schedules */}
            <div>
              <h2 className="font-display text-2xl font-bold text-white">Schedule</h2>
              {course.schedules && course.schedules.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {course.schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between rounded-xl border border-border-subtle bg-surface-card px-5 py-4"
                    >
                      <div>
                        <div className="font-medium text-white">{schedule.title}</div>
                        <div className="mt-1 flex items-center gap-4 text-xs text-text-muted">
                          {schedule.starts_at && (
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {formatDate(schedule.starts_at)}
                            </span>
                          )}
                          {schedule.location && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {schedule.location}
                            </span>
                          )}
                          {schedule.is_online && (
                            <span className="inline-flex items-center gap-1">
                              <Video className="h-3.5 w-3.5" />
                              Online
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-text-secondary">{delivery.description}</p>
              )}
            </div>
          </div>

          {/* Enroll card */}
          <aside className="h-fit rounded-2xl border border-border-subtle bg-surface-card p-6 lg:sticky lg:top-24">
            <div className="text-xs text-text-muted">Tuition</div>
            <div className="font-display text-3xl font-bold text-white">
              {tuition ? (tuition.amount <= 0 ? 'Sponsored' : formatMoney(tuition.amount)) : 'Waived'}
            </div>
            <div className="mt-1 text-xs text-text-muted">
              {isSponsored(course.fees) ? 'All fees sponsored for this cohort' : `Total: ${formatMoney(total)}`}
            </div>

            <div className="mt-5 border-t border-border-subtle pt-5">
              {enrolled ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Your status</span>
                    <EnrollmentStatusBadge status={enrolled.status} />
                  </div>
                  {entry?.note && (
                    <p className="text-xs leading-relaxed text-text-secondary">{entry.note}</p>
                  )}
                  <EnrollmentActionButton
                    courseId={course.id}
                    courseTitle={course.title}
                    enrollmentId={enrolled.id}
                    status={enrolled.status}
                    fees={course.fees}
                    size="lg"
                    className="w-full"
                  />
                </div>
              ) : (
                <div>
                  {isAuthenticated ? (
                    <Button size="lg" className="w-full" onClick={() => setApplyOpen(true)}>
                      Enroll now
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <>
                      <Link to={ROUTES.REGISTER} className="block">
                        <Button size="lg" className="w-full">
                          Enroll now
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to={ROUTES.LOGIN} className="mt-3 block">
                        <Button variant="outline" size="lg" className="w-full">
                          Sign in to enroll
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="mt-5 space-y-2 border-t border-border-subtle pt-5 text-xs text-text-muted">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Learn with a community
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Certificate on completion
              </div>
              {course.status === 'published' && (
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-academy-amber transition-colors hover:text-academy-amber/80"
                >
                  <ScrollText className="h-4 w-4" />
                  Preview certificate
                </button>
              )}
            </div>
          </aside>
        </div>
      </section>

      <ApplyModal
        open={applyOpen}
        onClose={() => setApplyOpen(false)}
        courseId={course.id}
        courseTitle={course.title}
        applicationFee={course.fees.find((f) => f.fee_type === 'application')?.amount ?? 0}
        onChanged={() => {
          setApplyOpen(false)
          refetch()
        }}
      />

      <CertificatePreviewModal
        courseId={previewOpen ? course.id : null}
        courseTitle={course.title}
        onClose={() => setPreviewOpen(false)}
      />
    </div>
  )
}