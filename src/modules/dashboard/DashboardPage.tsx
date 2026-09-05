import { GraduationCap, LogOut } from 'lucide-react'
import { Button } from '../../shared/components/buttons/Button'
import { useLogout } from '../../shared/api/account/AccountQueries'
import { useAppSelector } from '../../app/store/hooks/useApp'

/**
 * Placeholder dashboard - full dashboard layout ships in a later iteration.
 */
export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user)
  const logoutMutation = useLogout()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl cta-gradient text-white shadow-md shadow-electric-blue/20">
        <GraduationCap className="h-8 w-8" />
      </div>
      <h1 className="font-display text-2xl font-bold text-gray-900">
        Welcome back, {user?.name?.split(' ')[0] || 'Learner'}
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Your dashboard is on the way - this is where courses, progress and certificates will live.
      </p>
      <Button
        variant="outline"
        size="md"
        className="mt-8"
        onClick={() => logoutMutation.mutate()}
        loading={logoutMutation.isPending}
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </div>
  )
}