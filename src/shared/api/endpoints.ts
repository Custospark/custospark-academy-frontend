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
  ACCOUNT: {
    PROFILE: '/account/profile',
    PASSWORD: '/account/password',
    AVATAR: '/account/avatar',
  },
  COURSES: {
    INDEX: '/courses',
    SHOW: (id: number | string) => `/courses/${id}`,
    SCHEDULES: (id: number | string) => `/courses/${id}/schedules`,
  },
  SCHEDULES: {
    MINE: '/schedules/mine',
    STORE: (courseId: string) => `/admin/courses/${courseId}/schedules`,
    UPDATE: (courseId: string, scheduleId: number) =>
      `/admin/courses/${courseId}/schedules/${scheduleId}`,
    DESTROY: (courseId: string, scheduleId: number) =>
      `/admin/courses/${courseId}/schedules/${scheduleId}`,
  },
  ENROLLMENTS: {
    APPLY: '/enrollments',
    MINE: '/enrollments/mine',
    PAY: (id: number, feeType: string) => `/enrollments/${id}/pay/${feeType}`,
    COMPLETE: (id: number) => `/enrollments/${id}/complete`,
    CANCEL: (id: number) => `/enrollments/${id}/cancel`,
  },
  PAYMENTS: {
    INDEX: '/payments',
    VERIFY: (id: number) => `/payments/${id}`,
    RECEIPT: (id: number) => `/payments/${id}/receipt`,
  },
  LEARNER: {
    CONTENT: (courseId: string) => `/courses/${courseId}/content`,
    PROGRESS: (courseId: string) => `/courses/${courseId}/progress`,
    MARK_LESSON: (courseId: string, lessonId: number) => `/courses/${courseId}/lessons/${lessonId}/progress`,
    SUBMIT: (courseId: string, type: string, typeId: number) => `/courses/${courseId}/submit/${type}/${typeId}`,
    ATTEMPT: (courseId: string, type: string, typeId: number) => `/courses/${courseId}/attempt/${type}/${typeId}`,
  },
  CERTIFICATES: {
    MINE: '/certificates/mine',
    ISSUE: (enrollmentId: number) => `/enrollments/${enrollmentId}/certificate`,
    SHOW: (id: number) => `/certificates/${id}`,
    PDF: (id: number) => `/certificates/${id}/pdf`,
    DOWNLOAD: (id: number) => `/certificates/${id}/download`,
    PREVIEW: (courseId: string) => `/courses/${courseId}/certificate-preview`,
  },
  ADMIN: {
    COURSES: {
      INDEX: '/admin/courses',
      STORE: '/admin/courses',
      UPDATE: (id: number) => `/admin/courses/${id}`,
      DESTROY: (id: number) => `/admin/courses/${id}`,
    },
    ENROLLMENTS: '/admin/enrollments',
    ADMIT: (id: number) => `/admin/enrollments/${id}/admit`,
    REJECT: (id: number) => `/admin/enrollments/${id}/reject`,
    ANNOUNCE: (courseId: string) => `/admin/courses/${courseId}/announce`,
    EXPORT_LEARNERS: (courseId: string) => `/admin/courses/${courseId}/learners/export`,
    COMPLETE_LEARNERS: (courseId: string) => `/admin/courses/${courseId}/complete-learners`,
    INSTRUCTORS: {
      INDEX: '/admin/instructors',
      STORE: '/admin/instructors',
      UPDATE: (id: number) => `/admin/instructors/${id}`,
      DESTROY: (id: number) => `/admin/instructors/${id}`,
    },
    STATS: '/admin/stats',
    USERS: {
      INDEX: '/admin/users',
      UPDATE: (id: number) => `/admin/users/${id}`,
    },
    CONTENT: {
      FULL: (courseId: string) => `/admin/courses/${courseId}/content`,
      SECTIONS: {
        STORE: (courseId: string) => `/admin/courses/${courseId}/sections`,
        UPDATE: (courseId: string, id: number) => `/admin/courses/${courseId}/sections/${id}`,
        DESTROY: (courseId: string, id: number) => `/admin/courses/${courseId}/sections/${id}`,
      },
      LESSONS: {
        STORE: (courseId: string) => `/admin/courses/${courseId}/lessons`,
        UPDATE: (courseId: string, id: number) => `/admin/courses/${courseId}/lessons/${id}`,
        DESTROY: (courseId: string, id: number) => `/admin/courses/${courseId}/lessons/${id}`,
      },
      OUTCOMES: {
        STORE: (courseId: string) => `/admin/courses/${courseId}/outcomes`,
        UPDATE: (courseId: string, id: number) => `/admin/courses/${courseId}/outcomes/${id}`,
        DESTROY: (courseId: string, id: number) => `/admin/courses/${courseId}/outcomes/${id}`,
      },
      RESOURCES: {
        STORE: (courseId: string) => `/admin/courses/${courseId}/resources`,
        UPDATE: (courseId: string, id: number) => `/admin/courses/${courseId}/resources/${id}`,
        DESTROY: (courseId: string, id: number) => `/admin/courses/${courseId}/resources/${id}`,
      },
      QUIZZES: {
        STORE: (courseId: string) => `/admin/courses/${courseId}/quizzes`,
        UPDATE: (courseId: string, id: number) => `/admin/courses/${courseId}/quizzes/${id}`,
        DESTROY: (courseId: string, id: number) => `/admin/courses/${courseId}/quizzes/${id}`,
      },
      EXERCISES: {
        STORE: (courseId: string) => `/admin/courses/${courseId}/exercises`,
        UPDATE: (courseId: string, id: number) => `/admin/courses/${courseId}/exercises/${id}`,
        DESTROY: (courseId: string, id: number) => `/admin/courses/${courseId}/exercises/${id}`,
      },
      EXAMS: {
        STORE: (courseId: string) => `/admin/courses/${courseId}/exams`,
        UPDATE: (courseId: string, id: number) => `/admin/courses/${courseId}/exams/${id}`,
        DESTROY: (courseId: string, id: number) => `/admin/courses/${courseId}/exams/${id}`,
      },
      QUESTIONS_TEMPLATE: (courseId: string) => `/admin/courses/${courseId}/questions/template`,
      QUESTIONS_IMPORT: (courseId: string, kind: string, parentId: number) =>
        `/admin/courses/${courseId}/${kind}/${parentId}/questions/import`,
      RESULTS_TEMPLATE: (courseId: string) => `/admin/courses/${courseId}/results/template`,
      RESULTS_IMPORT: (courseId: string, kind: string, parentId: number) =>
        `/admin/courses/${courseId}/${kind}/${parentId}/results/import`,
      ASSIGNMENTS: {
        STORE: (courseId: string) => `/admin/courses/${courseId}/assignments`,
        UPDATE: (courseId: string, id: number) => `/admin/courses/${courseId}/assignments/${id}`,
        DESTROY: (courseId: string, id: number) => `/admin/courses/${courseId}/assignments/${id}`,
      },
    },
  },
} as const