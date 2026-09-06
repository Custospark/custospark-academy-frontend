import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Download, Wallet } from 'lucide-react'
import { useMyPayments } from '../../shared/api/learner/LearnerCourseQueries'
import { ENDPOINTS } from '../../shared/api/endpoints'
import { AcademyLoader } from '../../shared/components/loading/AcademyLoader'
import { PageHeader } from '../../shared/components/layout/PageHeader'
import { Button } from '../../shared/components/buttons/Button'
import { downloadFile } from '../../shared/utils/download'
import { ROUTES } from '../../app/routes/constants/shared.paths'
import { cn } from '../../shared/utils/cn'
import type { PaymentItem, PaymentStatus } from '../../shared/types'

const STATUS_STYLES: Record<PaymentStatus, string> = {
  paid: 'bg-semantic-success/15 text-semantic-success',
  processing: 'bg-blue-500/15 text-blue-300',
  pending: 'bg-academy-amber/15 text-academy-amber',
  failed: 'bg-semantic-error/15 text-semantic-error',
  refunded: 'bg-text-muted/15 text-text-muted',
}

export default function PaymentsPage() {
  const { data: payments, isPending, isError } = useMyPayments()
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const loading = isPending || (!payments && !isError)

  async function downloadReceipt(payment: PaymentItem) {
    if (!payment.receipt_url) return
    setDownloadingId(payment.id)
    try {
      const invoice = payment.invoice_number ?? payment.reference ?? `payment-${payment.id}`
      await downloadFile(
        ENDPOINTS.PAYMENTS.RECEIPT(payment.id),
        `receipt-${invoice.replace(/[^A-Za-z0-9_-]/g, '-')}.pdf`,
      )
    } finally {
      setDownloadingId(null)
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

      {!loading && !isError && payments && payments.length === 0 && (
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

      {!loading && !isError && payments && payments.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-section text-xs uppercase tracking-wider text-text-muted">
                <th className="px-5 py-3 font-semibold">Course</th>
                <th className="px-5 py-3 font-semibold">Fee</th>
                <th className="px-5 py-3 font-semibold">Invoice</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Reference</th>
                <th className="px-5 py-3 text-right font-semibold">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-b border-border-subtle last:border-0">
                  <td className="px-5 py-4 font-medium text-white">
                    {payment.course_title ?? 'Course'}
                  </td>
                  <td className="px-5 py-4 capitalize text-text-secondary">{payment.fee_type}</td>
                  <td className="px-5 py-4 font-mono text-xs text-blue-300">
                    {payment.invoice_number ?? '—'}
                  </td>
                  <td className="px-5 py-4 text-text-secondary">
                    {new Intl.NumberFormat('en-UG').format(Math.round(payment.amount))} {payment.currency}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-medium',
                        STATUS_STYLES[payment.status] ?? 'bg-academy-amber/15 text-academy-amber',
                      )}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-blue-300">
                    {payment.reference ?? '—'}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {payment.receipt_url ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => downloadReceipt(payment)}
                        loading={downloadingId === payment.id}
                        disabled={downloadingId !== null}
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </Button>
                    ) : (
                      <span className="text-xs text-text-muted">—</span>
                    )}
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