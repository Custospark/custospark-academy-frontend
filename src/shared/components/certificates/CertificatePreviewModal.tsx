import { useEffect, useMemo } from 'react'
import { ShieldAlert } from 'lucide-react'
import { Modal } from '../modals/Modal'
import { AcademyLoader } from '../loading/AcademyLoader'
import { useCertificatePreview } from '../../api/misc/MiscQueries'

interface CertificatePreviewModalProps {
  courseId: number | null
  courseTitle: string
  onClose: () => void
}

/**
 * Sealed watermarked certificate sample viewer. The backend endpoint renders a
 * PREVIEW-only sheet (placeholder learner, no reference, no QR, tiled diagonal
 * watermark) and never touches a real certificate record. This modal streams it
 * into an object URL that is revoked on close - there is deliberately no
 * download button or persisted copy anywhere in the view.
 */
export function CertificatePreviewModal({
  courseId,
  courseTitle,
  onClose,
}: CertificatePreviewModalProps) {
  const open = courseId !== null
  const { data: pdfBlob, isPending, isError } = useCertificatePreview(courseId)

  const objectUrl = useMemo(() => {
    if (!pdfBlob) return null
    return window.URL.createObjectURL(pdfBlob)
  }, [pdfBlob])

  useEffect(() => {
    return () => {
      if (objectUrl) window.URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Certificate preview"
      subtitle={`Sample certificate design for ${courseTitle} — for illustration only.`}
      size="lg"
      panelClassName="max-w-4xl"
    >
      {isPending && !pdfBlob && <AcademyLoader block />}

      {isError && (
        <div className="rounded-2xl border border-semantic-error/40 bg-semantic-error/10 p-8 text-center">
          <p className="text-sm text-semantic-error">Could not load the certificate preview.</p>
        </div>
      )}

      {objectUrl && (
        <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface-section">
          <iframe
            title={`Certificate preview for ${courseTitle}`}
            src={objectUrl}
            className="h-[68vh] w-full"
          />
        </div>
      )}

      <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-academy-amber/30 bg-academy-amber/10 px-4 py-3 text-xs text-text-secondary">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-academy-amber" />
        <p>
          This is a watermarked sample of the certificate design, shown with your name exactly
          as it will appear on the real thing. It is not a real certificate, carries no registry
          reference or QR code, and cannot be downloaded from here. A verified
          certificate is issued only after you complete the course.
        </p>
      </div>
    </Modal>
  )
}