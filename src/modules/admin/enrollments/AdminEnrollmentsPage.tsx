import { useEffect, useState } from 'react'
import { CheckCircle2, UserSquare2, XCircle } from 'lucide-react'
import { useAdminEnrollments, useUpdateEnrollmentStatus } from '../../../shared/api/misc/MiscQueries'
import { useAdminCourses } from '../../../shared/api/admin/AdminQueries'
import { AcademyLoader } from '../../../shared/components/loading/AcademyLoader'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { Button } from '../../../shared/components/buttons/Button'
import { ConfirmDialog } from '../../../shared/components/modals/ConfirmDialog'
import { SearchInput } from '../../../shared/components/inputs/SearchInput'

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

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'applied', label: 'Applied' },
  { value: 'application_fee_paid', label: 'Application fee paid' },
  { value: 'admitted', label: 'Admitted' },
  { value: 'tuition_paid', label: 'Tuition paid' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'certification', label: 'Certification' },
  { value: 'certified', label: 'Certified' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
]

const selectClass =
  'rounded-lg border border-border-default bg-surface-input px-3 py-2 text-sm text-text-primary focus:border-border-focus focus:outline-none'

export default function AdminEnrollmentsPage() {
  const [courseId, setCourseId] = useState<number | ''>('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const { data: courses } = useAdminCourses()
  const { data: enrollments, isPending, isError, refetch } = useAdminEnrollments({
    courseId: courseId === '' ? null : courseId,
    status: statusFilter || undefined,
    q: search || undefined,
  })
  const updateStatus = useUpdateEnrollmentStatus(0)
  const [confirm, setConfirm] = useState<{ id: number; action: 'admit' | 'reject' } | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const loading = isPending || (!enrollments && !isError)
  const filterActive = courseId !== '' || statusFilter !== '' || search !== ''

  function handleConfirm() {
    if (!confirm) return
    updateStatus.mutate(
      { id: confirm.id, action: confirm.action },
      {
        onSettled: () => {
          setConfirm(null)
          refetch()
        },
      },
    )
  }

  return (
    <div>
      <PageHeader
        title="Enrollments"
        description="Review applications, admit learners and manage enrollment status."
      />

      <div className="mb-5 flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-72">
          <SearchInput
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onClear={() => {
              setSearchInput('')
              setSearch('')
            }}
            placeholder="Search learner or course..."
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-text-muted">
            Course
          </label>
          <select
            value={courseId === '' ? '' : String(courseId)}
            onChange={(e) => setCourseId(e.target.value === '' ? '' : Number(e.target.value))}
            className={selectClass}
          >
            <option value="">All courses</option>
            {courses?.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-text-muted">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={selectClass}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {filterActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCourseId('')
              setStatusFilter('')
              setSearchInput('')
              setSearch('')
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {loading && <AcademyLoader block />}

      {isError && (
        <div className="rounded-2xl border border-semantic-error/40 bg-semantic-error/10 p-8 text-center">
          <p className="text-sm text-semantic-error">Could not load enrollments.</p>
        </div>
      )}

      {!loading && !isError && enrollments && enrollments.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface-card p-12 text-center">
          <UserSquare2 className="mx-auto h-12 w-12 text-blue-400" />
          <h3 className="mt-4 text-lg font-bold text-white">
            {filterActive ? 'No enrollments match your filters' : 'No enrollments yet'}
          </h3>
          <p className="mt-2 text-sm text-text-secondary">
            {filterActive
              ? 'Try adjusting the course, status or search filters.'
              : 'Applications will appear here for review.'}
          </p>
        </div>
      )}

      {!loading && !isError && enrollments && enrollments.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-section text-xs uppercase tracking-wider text-text-muted">
                <th className="px-5 py-3 font-semibold">Learner</th>
                <th className="px-5 py-3 font-semibold">Course</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enrollment) => {
                const isPendingReview =
                  enrollment.status === 'applied' || enrollment.status === 'application_fee_paid'
                return (
                  <tr key={enrollment.id} className="border-b border-border-subtle last:border-0">
                    <td className="px-5 py-4">
                      <div className="font-medium text-white">{enrollment.user_name ?? 'Learner'}</div>
                      <div className="text-xs text-text-muted">
                        {enrollment.user_email ?? ''}
                      </div>
                      <div className="text-xs text-text-muted">
                        {enrollment.applied_at
                          ? `Applied ${new Date(enrollment.applied_at).toLocaleDateString('en-UG')}`
                          : ''}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-text-secondary">{enrollment.course_title ?? '—'}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_STYLE[enrollment.status] ?? 'bg-blue-500/15 text-blue-300'
                        }`}
                      >
                        {enrollment.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        {isPendingReview && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => setConfirm({ id: enrollment.id, action: 'admit' })}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Admit
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => setConfirm({ id: enrollment.id, action: 'reject' })}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={confirm?.action === 'admit' ? 'Admit learner' : 'Reject application'}
        tone={confirm?.action === 'admit' ? 'success' : 'danger'}
        confirmLabel={confirm?.action === 'admit' ? 'Admit' : 'Reject'}
        message={
          confirm?.action === 'admit'
            ? 'Admit this learner to the course. They can then proceed to tuition payment.'
            : 'Reject this application. The learner will not be admitted to the course.'
        }
        isConfirming={updateStatus.isPending}
        onConfirm={handleConfirm}
      />
    </div>
  )
}