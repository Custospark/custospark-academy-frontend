import { Link } from 'react-router-dom'
import { ArrowRight, Wallet } from 'lucide-react'
import { useMyEnrollments } from '../../shared/api/learner/LearnerCourseQueries'
import { AcademyLoader } from '../../shared/components/loading/AcademyLoader'
import { PageHeader } from '../../shared/components/layout/PageHeader'
import { ROUTES } from '../../app/routes/constants/shared.paths'

interface PaymentSummary {
  id: number
  fee_type: string
  amount: number
  currency: string
  status: string
  reference: string | null
}

export default function PaymentsPage() {
  const { data: enrollments, isPending, isError } = useMyEnrollments()
  const loading = isPending || (!enrollments && !isError)

  const payments: Array<{ courseTitle: string; payment: PaymentSummary }> = []
  for (const enrollment of enrollments ?? []) {
    const items = enrollment.payments as PaymentSummary[]
    if (Array.isArray(items)) {
      for (const payment of items) {
        payments.push({ courseTitle: enrollment.course_title ?? 'Course', payment })
      }
    }
  }

  return (
    <div>
      <PageHeader
        title="My Payments"
        description="Your payment history, receipts and enrollment fee status."
      />

      {loading && <AcademyLoader block />}

      {isError && (
        <div className="rounded-2xl border border-semantic-error/40 bg-semantic-error/10 p-8 text-center">
          <p className="text-sm text-semantic-error">Could not load your payments.</p>
        </div>
      )}

      {!loading && !isError && payments.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface-card p-12 text-center">
          <Wallet className="mx-auto h-12 w-12 text-blue-400" />
          <h3 className="mt-4 text-lg font-bold text-white">No payments yet</h3>
          <p className="mt-2 text-sm text-text-secondary">
            Enroll in a course to start building your payment history.
          </p>
          <Link to={ROUTES.APP.CATALOG} className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-electric-blue px-4 py-2 text-sm font-semibold text-white">
            Browse courses
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {!loading && !isError && payments.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-section text-xs uppercase tracking-wider text-text-muted">
                <th className="px-5 py-3 font-semibold">Course</th>
                <th className="px-5 py-3 font-semibold">Fee</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Reference</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(({ courseTitle, payment }, index) => (
                <tr key={`${payment.id}-${index}`} className="border-b border-border-subtle last:border-0">
                  <td className="px-5 py-4 font-medium text-white">{courseTitle}</td>
                  <td className="px-5 py-4 capitalize text-text-secondary">{payment.fee_type}</td>
                  <td className="px-5 py-4 text-text-secondary">
                    {new Intl.NumberFormat('en-UG').format(Math.round(payment.amount))} {payment.currency}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        payment.status === 'paid'
                          ? 'rounded-full bg-semantic-success/15 px-2.5 py-0.5 text-xs font-medium text-semantic-success'
                          : 'rounded-full bg-academy-amber/15 px-2.5 py-0.5 text-xs font-medium text-academy-amber'
                      }
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-blue-300">
                    {payment.reference ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}