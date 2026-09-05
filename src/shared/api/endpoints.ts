/**
 * API endpoint constants (mirrors Custosell endpoints.ts).
 * Never use raw URL strings in queries - reference these objects.
 */

export const ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  COURSES: {
    INDEX: '/courses',
    SHOW: (id: number) => `/courses/${id}`,
    SCHEDULES: (id: number) => `/courses/${id}/schedules`,
  },
  ENROLLMENTS: {
    APPLY: '/enrollments',
    MINE: '/enrollments/mine',
    PAY: (id: number, feeType: string) => `/enrollments/${id}/pay/${feeType}`,
    COMPLETE: (id: number) => `/enrollments/${id}/complete`,
    CANCEL: (id: number) => `/enrollments/${id}/cancel`,
  },
  CERTIFICATES: {
    MINE: '/certificates/mine',
    SHOW: (id: number) => `/certificates/${id}`,
  },
  ADMIN: {
    COURSES: {
      STORE: '/admin/courses',
      UPDATE: (id: number) => `/admin/courses/${id}`,
      DESTROY: (id: number) => `/admin/courses/${id}`,
    },
    ENROLLMENTS: '/admin/enrollments',
    ADMIT: (id: number) => `/admin/enrollments/${id}/admit`,
    REJECT: (id: number) => `/admin/enrollments/${id}/reject`,
  },
} as const