import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { PublicRoute } from './PublicRoute'
import { AuthMiddlewareRoute } from './middleware/AuthMiddlewareRoute'
import { ROUTES } from './constants/shared.paths'
import { AcademyLoader } from '../../shared/components/loading/AcademyLoader'

const LandingLayout = lazy(() => import('../../modules/landing/LandingLayout'))
const LandingPage = lazy(() => import('../../modules/landing/LandingPage'))
const CoursesPage = lazy(() => import('../../modules/landing/CoursesPage'))
const CourseDetailPage = lazy(() => import('../../modules/landing/CourseDetailPage'))
const LoginPage = lazy(() => import('../../modules/auth/LoginPage'))
const RegisterPage = lazy(() => import('../../modules/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('../../modules/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('../../modules/auth/ResetPasswordPage'))
const DashboardPage = lazy(() => import('../../modules/dashboard/DashboardPage'))

function withSuspense(node: React.ReactNode) {
  return <Suspense fallback={<AcademyLoader fullPage />}>{node}</Suspense>
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public guest routes */}
      <Route element={<PublicRoute />}>
        <Route element={withSuspense(<LandingLayout />)}>
          <Route index element={withSuspense(<LandingPage />)} />
          <Route path={ROUTES.COURSES} element={withSuspense(<CoursesPage />)} />
          <Route path="courses/:id" element={withSuspense(<CourseDetailPage />)} />
        </Route>
        <Route path={ROUTES.LOGIN} element={withSuspense(<LoginPage />)} />
        <Route path={ROUTES.REGISTER} element={withSuspense(<RegisterPage />)} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={withSuspense(<ForgotPasswordPage />)} />
        <Route path={ROUTES.RESET_PASSWORD} element={withSuspense(<ResetPasswordPage />)} />
      </Route>

      {/* Authenticated app routes */}
      <Route element={<AuthMiddlewareRoute />}>
        <Route path={ROUTES.DASHBOARD} element={withSuspense(<DashboardPage />)} />
      </Route>
    </Routes>
  )
}