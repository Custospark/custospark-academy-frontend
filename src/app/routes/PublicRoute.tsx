import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '../store/hooks/useApp'
import { AcademyLoader } from '../../shared/components/loading/AcademyLoader'
import { ROUTES } from './constants/shared.paths'

/**
 * Public (guest) route guard - redirects authenticated users to the dashboard.
 * Mirrors Custosell PublicRoute.
 */
export function PublicRoute() {
  const location = useLocation()
  const token = useAppSelector((state) => state.auth.token)
  const isInitialized = useAppSelector((state) => state.auth.isInitialized)

  if (!isInitialized) {
    return <AcademyLoader fullPage />
  }

  if (token) {
    return <Navigate to={ROUTES.DASHBOARD} replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}