import { Award } from 'lucide-react'
import { useMyCertificates } from '../../shared/api/misc/MiscQueries'
import { AcademyLoader } from '../../shared/components/loading/AcademyLoader'
import { PageHeader } from '../../shared/components/layout/PageHeader'

export default function CertificatesPage() {
  const { data: certificates, isPending, isError } = useMyCertificates()
  const loading = isPending || (!certificates && !isError)

  return (
    <div>
      <PageHeader
        title="Certificates"
        description="Certificates you have earned and can verify."
      />

      {loading && <AcademyLoader block />}

      {isError && (
        <div className="rounded-2xl border border-semantic-error/40 bg-semantic-error/10 p-8 text-center">
          <p className="text-sm text-semantic-error">Could not load your certificates.</p>
        </div>
      )}

      {!loading && !isError && certificates && certificates.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface-card p-12 text-center">
          <Award className="mx-auto h-12 w-12 text-blue-400" />
          <h3 className="mt-4 text-lg font-bold text-white">No certificates yet</h3>
          <p className="mt-2 text-sm text-text-secondary">
            Complete your courses to earn certificates.
          </p>
        </div>
      )}

      {!loading && !isError && certificates && certificates.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate) => (
            <div
              key={certificate.id}
              className="flex flex-col rounded-2xl border border-border-subtle bg-surface-card p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-academy-orange/15 text-academy-orange">
                  <Award className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-semantic-success/15 px-2.5 py-0.5 text-xs font-medium text-semantic-success">
                  Earned
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-white">
                {certificate.course_title ?? 'Course certificate'}
              </h3>
              <p className="mt-1 text-xs text-text-muted">
                {certificate.user_name ?? 'Learner'}
              </p>
              <div className="mt-4 border-t border-border-subtle pt-4">
                <div className="font-mono text-sm text-blue-300">
                  {certificate.certificate_reference}
                </div>
                <div className="mt-1 text-xs text-text-muted">
                  {certificate.issued_at
                    ? `Issued ${new Date(certificate.issued_at).toLocaleDateString('en-UG', { day: 'numeric', month: 'long', year: 'numeric' })}`
                    : 'Issuance pending'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}