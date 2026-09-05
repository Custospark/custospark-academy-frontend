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
  DASHBOARD: '/dashboard',
  COURSES: '/courses',
  COURSE: (id: number | string) => `/courses/${id}`,
} as const