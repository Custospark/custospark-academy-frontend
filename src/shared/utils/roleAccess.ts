import type { UserRole } from '../types'
import { ROUTES } from '../../app/routes/constants/shared.paths'

/**
 * Academy role-based module access.
 *
 * Roles (mirror backend): learner (default), instructor, admin.
 * Admin holds account-upgrade rights; instructors manage courses/schedules;
 * learners browse/enroll. Permissions are enforced on the backend too, but
 * this keeps the frontend (sidebar + routes) consistent.
 */

export type AcademyModule =
  | 'dashboard'
  | 'catalog'
  | 'myCourses'
  | 'schedules'
  | 'payments'
  | 'certificates'
  | 'courseManagement'
  | 'enrollmentManagement'
  | 'instructorManagement'
  | 'platformStats'
  | 'userPermissions'

export const MODULE_DEFAULT_ROUTES: Record<AcademyModule, string> = {
  dashboard: ROUTES.DASHBOARD,
  catalog: ROUTES.APP.CATALOG,
  myCourses: ROUTES.APP.MY_COURSES,
  schedules: ROUTES.APP.SCHEDULES,
  payments: ROUTES.APP.PAYMENTS,
  certificates: ROUTES.APP.CERTIFICATES,
  courseManagement: ROUTES.APP.ADMIN.COURSES,
  enrollmentManagement: ROUTES.APP.ADMIN.ENROLLMENTS,
  instructorManagement: ROUTES.APP.ADMIN.INSTRUCTORS,
  platformStats: ROUTES.APP.ADMIN.STATS,
  userPermissions: ROUTES.APP.ADMIN.PERMISSIONS,
}

export const MODULE_LABELS: Record<AcademyModule, string> = {
  dashboard: 'Dashboard',
  catalog: 'Course Catalog',
  myCourses: 'My Courses',
  schedules: 'Schedules',
  payments: 'My Payments',
  certificates: 'Certificates',
  courseManagement: 'Course Management',
  enrollmentManagement: 'Enrollments',
  instructorManagement: 'Instructors',
  platformStats: 'Platform Stats',
  userPermissions: 'Permissions',
}

/** Modules a given role can access. */
const ROLE_MODULES: Record<UserRole, AcademyModule[]> = {
  learner: [
    'dashboard',
    'catalog',
    'myCourses',
    'schedules',
    'payments',
    'certificates',
  ],
  instructor: [
    'dashboard',
    'catalog',
    'myCourses',
    'schedules',
    'payments',
    'certificates',
    'courseManagement',
  ],
  admin: [
    'dashboard',
    'catalog',
    'myCourses',
    'schedules',
    'payments',
    'certificates',
    'courseManagement',
    'enrollmentManagement',
    'instructorManagement',
    'platformStats',
    'userPermissions',
  ],
}

/** Actions a role may perform, keyed by action (route-level enforcement later). */
export type AcademyAction =
  | 'view.catalog'
  | 'enroll'
  | 'pay'
  | 'view.certificates'
  | 'manage.courses'
  | 'manage.schedules'
  | 'manage.enrollments'
  | 'admit.enrollments'
  | 'reject.enrollments'
  | 'manage.instructors'
  | 'upgrade.account'

const ROLE_ACTIONS: Record<UserRole, AcademyAction[]> = {
  learner: ['view.catalog', 'enroll', 'pay', 'view.certificates'],
  instructor: [
    'view.catalog',
    'enroll',
    'pay',
    'view.certificates',
    'manage.courses',
    'manage.schedules',
  ],
  admin: [
    'view.catalog',
    'enroll',
    'pay',
    'view.certificates',
    'manage.courses',
    'manage.schedules',
    'manage.enrollments',
    'admit.enrollments',
    'reject.enrollments',
    'manage.instructors',
    'upgrade.account',
  ],
}

export function getRoleModules(role?: UserRole | null): AcademyModule[] {
  return ROLE_MODULES[role ?? 'learner'] ?? ROLE_MODULES.learner
}

export function canAccessModule(role: UserRole | null | undefined, module: AcademyModule): boolean {
  return getRoleModules(role).includes(module)
}

export function can(role: UserRole | null | undefined, action: AcademyAction): boolean {
  return ROLE_ACTIONS[role ?? 'learner']?.includes(action) ?? false
}

/** Resolve the default landing route after login (dashboard for all roles). */
export function getDefaultRouteForRole(_role?: UserRole | null): string {
  return MODULE_DEFAULT_ROUTES.dashboard
}