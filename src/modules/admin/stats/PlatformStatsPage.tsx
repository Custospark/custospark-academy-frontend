import { Award, BookOpen, GraduationCap, Users, Wallet, UserSquare2, ShieldCheck, Clock } from 'lucide-react'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { AcademyLoader } from '../../../shared/components/loading/AcademyLoader'
import { usePlatformStats } from '../../../shared/api/admin/AdminQueries'

const STAT_CARDS = [
  { key: 'total_users', label: 'Total Users', icon: Users, color: 'bg-blue-500/15 text-blue-300' },
  { key: 'learners', label: 'Learners', icon: GraduationCap, color: 'bg-orange-500/15 text-orange-400' },
  { key: 'instructors', label: 'Instructors', icon: UserSquare2, color: 'bg-semantic-success/15 text-semantic-success' },
  { key: 'admins', label: 'Admins', icon: ShieldCheck, color: 'bg-academy-purple/15 text-academy-purple' },
  { key: 'total_courses', label: 'Total Courses', icon: BookOpen, color: 'bg-blue-500/15 text-blue-300' },
  { key: 'published_courses', label: 'Published Courses', icon: Award, color: 'bg-orange-500/15 text-orange-400' },
  { key: 'total_enrollments', label: 'Enrollments', icon: Wallet, color: 'bg-semantic-success/15 text-semantic-success' },
  { key: 'pending_applications', label: 'Pending Applications', icon: Clock, color: 'bg-academy-amber/15 text-academy-amber' },
] as const

export default function PlatformStatsPage() {
  const { data: stats, isPending, isError } = usePlatformStats()

  return (
    <div>
      <PageHeader
        title="Platform Stats"
        description="A snapshot of users, courses and enrollments across Custospark Academy."
      />

      {isPending && <AcademyLoader block />}

      {isError && (
        <div className="rounded-2xl border border-semantic-error/40 bg-semantic-error/10 p-8 text-center">
          <p className="text-sm text-semantic-error">Could not load platform stats.</p>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STAT_CARDS.map((card) => {
            const value = stats[card.key as keyof typeof stats]
            return (
              <div
                key={card.key}
                className="rounded-2xl border border-border-subtle bg-surface-card p-5"
              >
                <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <div className="font-display text-3xl font-bold text-white">{value}</div>
                <div className="mt-1 text-sm text-text-secondary">{card.label}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}