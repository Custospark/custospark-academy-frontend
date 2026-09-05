import { UserSquare2 } from 'lucide-react'
import { ModulePlaceholder } from '../../../shared/components/layout/ModulePlaceholder'
import { PageHeader } from '../../../shared/components/layout/PageHeader'

export default function AdminEnrollmentsPage() {
  return (
    <div>
      <PageHeader
        title="Enrollments"
        description="Review applications, admit learners and manage enrollment status."
      />
      <ModulePlaceholder title="Enrollment Management" icon={UserSquare2} />
    </div>
  )
}
