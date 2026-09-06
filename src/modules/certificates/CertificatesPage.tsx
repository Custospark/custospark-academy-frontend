import { useEffect, useMemo, useState } from 'react'
import { Award, Download, Eye } from 'lucide-react'
import { useCertificatePdf, useMyCertificates } from '../../shared/api/misc/MiscQueries'
import { ENDPOINTS } from '../../shared/api/endpoints'
import { AcademyLoader } from '../../shared/components/loading/AcademyLoader'
import { PageHeader } from '../../shared/components/layout/PageHeader'
import { Button } from '../../shared/components/buttons/Button'
import { Modal } from '../../shared/components/modals/Modal'
import { downloadFile } from '../../shared/utils/download'

export default function CertificatesPage() {
  const { data: certificates, isPending, isError } = useMyCertificates()
  const [previewId, setPreviewId] = useState<number | null>(null)
  const { data: pdfBlob, isFetching } = useCertificatePdf(previewId)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const loading = isPending || (!certificates && !isError)

  const previewCertificate = certificates?.find((c) => c.id === previewId) ?? null

  const objectUrl = useMemo(() => {
    if (!pdfBlob) return null
    return window.URL.createObjectURL(pdfBlob)
  }, [pdfBlob])

  useEffect(() => {
    return () => {
      if (objectUrl) window.URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  async function downloadCertificate(certificateId: number, reference: string) {
    setDownloadingId(certificateId)
    try {
      await downloadFile(
        ENDPOINTS.CERTIFICATES.DOWNLOAD(certificateId),
        `certificate-${reference.replace(/[^A-Za-z0-9_-]/g, '-')}.pdf`,
      )
    } finally {
      setDownloadingId(null)
    }
  }

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
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setPreviewId(certificate.id)}>
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => downloadCertificate(certificate.id, certificate.certificate_reference)}
                  loading={downloadingId === certificate.id}
                  disabled={downloadingId !== null}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={previewId !== null}
        onClose={() => setPreviewId(null)}
        title={previewCertificate?.course_title ?? 'Certificate preview'}
        subtitle={previewCertificate?.certificate_reference}
        size="lg"
      >
        {isFetching && <div className="flex h-[70vh] items-center justify-center"><AcademyLoader /></div>}
        {!isFetching && objectUrl && (
          <iframe
            title="Certificate preview"
            src={objectUrl}
            className="h-[70vh] w-full rounded-xl border border-border-subtle"
          />
        )}
        {!isFetching && !objectUrl && (
          <div className="flex h-[70vh] items-center justify-center rounded-xl border border-semantic-error/40 bg-semantic-error/10">
            <p className="text-sm text-semantic-error">Could not load the certificate preview.</p>
          </div>
        )}
      </Modal>
    </div>
  )
}