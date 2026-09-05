import { GraduationCap } from 'lucide-react'
import { ModulePlaceholder } from '../../shared/components/layout/ModulePlaceholder'
import { PageHeader } from '../../shared/components/layout/PageHeader'

export default function MyCoursesPage() {
  return (
    <div>
      <PageHeader
        title="My Courses"
        description="Courses you are enrolled in, with progress and next steps."
      />
      <ModulePlaceholder title="My Courses" icon={GraduationCap} />
    </div>
  )
}
