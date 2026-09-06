/**
 * Central route path constants (mirrors Custosell shared.paths.ts).
 * Never hardcode route strings - reference ROUTES.
 */

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  COURSES: '/courses',
  COURSE: (id: number | string) => `/courses/${id}`,
  DASHBOARD: '/dashboard',
  APP: {
    CATALOG: '/catalog',
    COURSE: (id: number | string) => `/catalog/${id}`,
    MY_COURSES: '/my-courses',
    MY_COURSE: (id: number | string) => `/my-courses/${id}`,
    PAYMENTS: '/payments',
    CERTIFICATES: '/certificates',
    SCHEDULES: '/schedules',
    ACCOUNT: {
      PROFILE: '/account/profile',
      SECURITY: '/account/security',
    },
    ADMIN: {
      COURSES: '/admin/courses',
      COURSE: (id: number | string) => `/admin/courses/${id}`,
      ENROLLMENTS: '/admin/enrollments',
      INSTRUCTORS: '/admin/instructors',
      STATS: '/admin/stats',
      PERMISSIONS: '/admin/permissions',
    },
  },
} as const
