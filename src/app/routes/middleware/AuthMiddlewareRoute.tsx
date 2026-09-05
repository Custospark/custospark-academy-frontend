import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../store/hooks/useApp'
import { AcademyLoader } from '../../../shared/components/loading/AcademyLoader'
import { ROUTES } from '../constants/shared.paths'

/**
 * Authenticated route guard - redirects anonymous users to /login.
 * Preserves the intended destination in state.from. Mirrors Custosell AuthMiddlewareRoute.
 */
export function AuthMiddlewareRoute() {
  const token = useAppSelector((state) => state.auth.token)
  const isInitialized = useAppSelector((state) => state.auth.isInitialized)
  const location = useLocation()

  if (!isInitialized) {
    return <AcademyLoader fullPage />
  }

  if (!token) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  return <Outlet />
}