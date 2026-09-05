import { Library } from 'lucide-react'
import { ModulePlaceholder } from '../../../shared/components/layout/ModulePlaceholder'
import { PageHeader } from '../../../shared/components/layout/PageHeader'

export default function AdminCoursesPage() {
  return (
    <div>
      <PageHeader
        title="Course Management"
        description="Create, edit and publish courses and their fees."
      />
      <ModulePlaceholder title="Course Management" icon={Library} />
    </div>
  )
}
