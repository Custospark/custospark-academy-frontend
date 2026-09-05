import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks/useApp'
import { canAccessModule, type AcademyModule } from '../../../shared/utils/roleAccess'
import { ROUTES } from '../constants/shared.paths'

interface RoleAccessMiddlewareProps {
  module: AcademyModule
}

/**
 * Role gate for a route: renders the outlet only if the current user's role
 * can access the module, otherwise redirects to the dashboard.
 */
export function RoleAccessMiddleware({ module }: RoleAccessMiddlewareProps) {
  const user = useAppSelector((state) => state.auth.user)

  if (!canAccessModule(user?.role, module)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <Outlet />
}