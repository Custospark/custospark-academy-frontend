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
    CATALOG: '/app/catalog',
    MY_COURSES: '/app/my-courses',
    MY_COURSE: (id: number | string) => `/app/my-courses/${id}`,
    PAYMENTS: '/app/payments',
    CERTIFICATES: '/app/certificates',
    SCHEDULES: '/app/schedules',
    ADMIN: {
      COURSES: '/app/admin/courses',
      COURSE: (id: number | string) => `/app/admin/courses/${id}`,
      ENROLLMENTS: '/app/admin/enrollments',
    },
  },
} as const
