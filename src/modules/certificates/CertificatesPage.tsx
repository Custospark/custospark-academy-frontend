import { Award } from 'lucide-react'
import { ModulePlaceholder } from '../../shared/components/layout/ModulePlaceholder'
import { PageHeader } from '../../shared/components/layout/PageHeader'

export default function CertificatesPage() {
  return (
    <div>
      <PageHeader
        title="Certificates"
        description="Certificates you have earned and can verify."
      />
      <ModulePlaceholder title="Certificates" icon={Award} />
    </div>
  )
}
