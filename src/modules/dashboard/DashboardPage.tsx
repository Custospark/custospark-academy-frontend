import { Link } from 'react-router-dom'
import { ArrowRight, Award, BookOpen, GraduationCap, Library, Wallet } from 'lucide-react'
import { useAppSelector } from '../../app/store/hooks/useApp'
import { ROUTES } from '../../app/routes/constants/shared.paths'

const QUICK_LINKS = [
  {
    to: ROUTES.APP.CATALOG,
    icon: BookOpen,
    title: 'Explore Courses',
    description: 'Browse the catalog and find your next course.',
    color: 'bg-blue-500/15 text-blue-300',
  },
  {
    to: ROUTES.APP.MY_COURSES,
    icon: GraduationCap,
    title: 'My Courses',
    description: 'Pick up where you left off in your enrollments.',
    color: 'bg-orange-500/15 text-orange-400',
  },
  {
    to: ROUTES.APP.PAYMENTS,
    icon: Wallet,
    title: 'Payments',
    description: 'Review your fees and payment history.',
    color: 'bg-semantic-success/15 text-semantic-success',
  },
  {
    to: ROUTES.APP.CERTIFICATES,
    icon: Award,
    title: 'Certificates',
    description: 'View and verify the certificates you have earned.',
    color: 'bg-academy-purple/15 text-academy-purple',
  },
]

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user)
  const firstName = user?.name?.split(' ')[0] ?? 'Learner'
  const isAdmin = user?.role === 'admin'

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">
          Welcome back, {firstName}
        </h1>
        <p className="mt-2 text-text-secondary">
          {isAdmin
            ? 'Manage courses, enrollments and learners from your admin console.'
            : 'Continue your learning journey - your courses, progress and certificates are one click away.'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="group flex items-start gap-4 rounded-2xl border border-border-subtle bg-surface-card p-5 transition-all hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-card-hover"
          >
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${link.color}`}>
              <link.icon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-lg font-bold text-white">{link.title}</h3>
                <ArrowRight className="h-4 w-4 shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5" />
              </div>
              <p className="mt-1 text-sm text-text-secondary">{link.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {isAdmin && (
        <div className="mt-8 rounded-2xl border border-border-subtle bg-surface-card p-5">
          <div className="flex items-center gap-2.5">
            <Library className="h-5 w-5 text-blue-400" />
            <h2 className="font-display text-lg font-bold text-white">Administration</h2>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to={ROUTES.APP.ADMIN.COURSES}
              className="rounded-xl border border-border-default px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-border-strong hover:bg-surface-card-hover hover:text-white"
            >
              Course Management
            </Link>
            <Link
              to={ROUTES.APP.ADMIN.ENROLLMENTS}
              className="rounded-xl border border-border-default px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:border-border-strong hover:bg-surface-card-hover hover:text-white"
            >
              Enrollments
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}