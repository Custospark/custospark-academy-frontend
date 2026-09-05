import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { PublicRoute } from './PublicRoute'
import { AuthMiddlewareRoute } from './middleware/AuthMiddlewareRoute'
import { RoleAccessMiddleware } from './middleware/RoleAccessMiddleware'
import { ROUTES } from './constants/shared.paths'
import { AcademyLoader } from '../../shared/components/loading/AcademyLoader'
import { AppLayout } from '../../shared/components/layout/AppLayout'

const LandingLayout = lazy(() => import('../../modules/landing/LandingLayout'))
const LandingPage = lazy(() => import('../../modules/landing/LandingPage'))
const CoursesPage = lazy(() => import('../../modules/landing/CoursesPage'))
const CourseDetailPage = lazy(() => import('../../modules/landing/CourseDetailPage'))
const PrivacyPage = lazy(() => import('../../modules/landing/PrivacyPage'))
const LoginPage = lazy(() => import('../../modules/auth/LoginPage'))
const RegisterPage = lazy(() => import('../../modules/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('../../modules/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('../../modules/auth/ResetPasswordPage'))

const DashboardPage = lazy(() => import('../../modules/dashboard/DashboardPage'))
const CatalogPage = lazy(() => import('../../modules/catalog/CatalogPage'))
const MyCoursesPage = lazy(() => import('../../modules/myCourses/MyCoursesPage'))
const MyCourseDetailPage = lazy(() => import('../../modules/myCourses/MyCourseDetailPage'))
const SchedulesPage = lazy(() => import('../../modules/schedules/SchedulesPage'))
const PaymentsPage = lazy(() => import('../../modules/payments/PaymentsPage'))
const CertificatesPage = lazy(() => import('../../modules/certificates/CertificatesPage'))
const AdminCoursesPage = lazy(() => import('../../modules/admin/courses/AdminCoursesPage'))
const CourseBuilderPage = lazy(() => import('../../modules/admin/courses/CourseBuilderPage'))
const AdminEnrollmentsPage = lazy(() => import('../../modules/admin/enrollments/AdminEnrollmentsPage'))
const InstructorManagementPage = lazy(() => import('../../modules/admin/instructors/InstructorManagementPage'))
const PlatformStatsPage = lazy(() => import('../../modules/admin/stats/PlatformStatsPage'))
const PermissionsPage = lazy(() => import('../../modules/admin/permissions/PermissionsPage'))

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
          <Route path={ROUTES.PRIVACY} element={withSuspense(<PrivacyPage />)} />
        </Route>
        <Route path={ROUTES.LOGIN} element={withSuspense(<LoginPage />)} />
        <Route path={ROUTES.REGISTER} element={withSuspense(<RegisterPage />)} />
        <Route path={ROUTES.FORGOT_PASSWORD} element={withSuspense(<ForgotPasswordPage />)} />
        <Route path={ROUTES.RESET_PASSWORD} element={withSuspense(<ResetPasswordPage />)} />
      </Route>

      {/* Authenticated app routes - protected shell */}
      <Route element={<AuthMiddlewareRoute />}>
        <Route element={withSuspense(<AppLayout />)}>
          <Route path={ROUTES.DASHBOARD} element={withSuspense(<DashboardPage />)} />
          <Route path={ROUTES.APP.CATALOG} element={withSuspense(<CatalogPage />)} />
          <Route path={ROUTES.APP.MY_COURSES} element={withSuspense(<MyCoursesPage />)} />
          <Route path="app/my-courses/:id" element={withSuspense(<MyCourseDetailPage />)} />
          <Route path={ROUTES.APP.SCHEDULES} element={withSuspense(<SchedulesPage />)} />
          <Route path={ROUTES.APP.PAYMENTS} element={withSuspense(<PaymentsPage />)} />
          <Route path={ROUTES.APP.CERTIFICATES} element={withSuspense(<CertificatesPage />)} />
        </Route>

{/* Instructor/admin: course management */}
      <Route element={<RoleAccessMiddleware module="courseManagement" />}>
        <Route element={withSuspense(<AppLayout />)}>
          <Route path={ROUTES.APP.ADMIN.COURSES} element={withSuspense(<AdminCoursesPage />)} />
          <Route path="app/admin/courses/:id" element={withSuspense(<CourseBuilderPage />)} />
        </Route>
      </Route>

      {/* Admin only: enrollment, instructor, stats, permissions */}
      <Route element={<RoleAccessMiddleware module="enrollmentManagement" />}>
        <Route element={withSuspense(<AppLayout />)}>
          <Route path={ROUTES.APP.ADMIN.ENROLLMENTS} element={withSuspense(<AdminEnrollmentsPage />)} />
          <Route path={ROUTES.APP.ADMIN.INSTRUCTORS} element={withSuspense(<InstructorManagementPage />)} />
          <Route path={ROUTES.APP.ADMIN.STATS} element={withSuspense(<PlatformStatsPage />)} />
          <Route path={ROUTES.APP.ADMIN.PERMISSIONS} element={withSuspense(<PermissionsPage />)} />
        </Route>
      </Route>
      </Route>
    </Routes>
  )
}