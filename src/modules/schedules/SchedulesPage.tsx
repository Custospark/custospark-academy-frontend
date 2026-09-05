import { CalendarDays } from 'lucide-react'
import { ModulePlaceholder } from '../../shared/components/layout/ModulePlaceholder'
import { PageHeader } from '../../shared/components/layout/PageHeader'

export default function SchedulesPage() {
  return (
    <div>
      <PageHeader
        title="Schedules"
        description="Upcoming live sessions for the courses you are enrolled in."
      />
      <ModulePlaceholder title="Schedules" icon={CalendarDays} />
    </div>
  )
}
