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
  SCHEDULES: {
    STORE: (courseId: number) => `/admin/courses/${courseId}/schedules`,
  },
  ENROLLMENTS: {
    APPLY: '/enrollments',
    MINE: '/enrollments/mine',
    PAY: (id: number, feeType: string) => `/enrollments/${id}/pay/${feeType}`,
    COMPLETE: (id: number) => `/enrollments/${id}/complete`,
    CANCEL: (id: number) => `/enrollments/${id}/cancel`,
  },
  LEARNER: {
    CONTENT: (courseId: number) => `/courses/${courseId}/content`,
    PROGRESS: (courseId: number) => `/courses/${courseId}/progress`,
    MARK_LESSON: (courseId: number, lessonId: number) => `/courses/${courseId}/lessons/${lessonId}/progress`,
    SUBMIT: (courseId: number, type: string, typeId: number) => `/courses/${courseId}/submit/${type}/${typeId}`,
    ATTEMPT: (courseId: number, type: string, typeId: number) => `/courses/${courseId}/attempt/${type}/${typeId}`,
  },
  CERTIFICATES: {
    MINE: '/certificates/mine',
    SHOW: (id: number) => `/certificates/${id}`,
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
      FULL: (courseId: number) => `/admin/courses/${courseId}/content`,
      SECTIONS: {
        STORE: (courseId: number) => `/admin/courses/${courseId}/sections`,
        UPDATE: (courseId: number, id: number) => `/admin/courses/${courseId}/sections/${id}`,
        DESTROY: (courseId: number, id: number) => `/admin/courses/${courseId}/sections/${id}`,
      },
      LESSONS: {
        STORE: (courseId: number) => `/admin/courses/${courseId}/lessons`,
        UPDATE: (courseId: number, id: number) => `/admin/courses/${courseId}/lessons/${id}`,
        DESTROY: (courseId: number, id: number) => `/admin/courses/${courseId}/lessons/${id}`,
      },
      OUTCOMES: {
        STORE: (courseId: number) => `/admin/courses/${courseId}/outcomes`,
        DESTROY: (courseId: number, id: number) => `/admin/courses/${courseId}/outcomes/${id}`,
      },
      RESOURCES: {
        STORE: (courseId: number) => `/admin/courses/${courseId}/resources`,
        UPDATE: (courseId: number, id: number) => `/admin/courses/${courseId}/resources/${id}`,
        DESTROY: (courseId: number, id: number) => `/admin/courses/${courseId}/resources/${id}`,
      },
      QUIZZES: {
        STORE: (courseId: number) => `/admin/courses/${courseId}/quizzes`,
        UPDATE: (courseId: number, id: number) => `/admin/courses/${courseId}/quizzes/${id}`,
        DESTROY: (courseId: number, id: number) => `/admin/courses/${courseId}/quizzes/${id}`,
      },
      EXERCISES: {
        STORE: (courseId: number) => `/admin/courses/${courseId}/exercises`,
        UPDATE: (courseId: number, id: number) => `/admin/courses/${courseId}/exercises/${id}`,
        DESTROY: (courseId: number, id: number) => `/admin/courses/${courseId}/exercises/${id}`,
      },
      EXAMS: {
        STORE: (courseId: number) => `/admin/courses/${courseId}/exams`,
        UPDATE: (courseId: number, id: number) => `/admin/courses/${courseId}/exams/${id}`,
        DESTROY: (courseId: number, id: number) => `/admin/courses/${courseId}/exams/${id}`,
      },
      ASSIGNMENTS: {
        STORE: (courseId: number) => `/admin/courses/${courseId}/assignments`,
        UPDATE: (courseId: number, id: number) => `/admin/courses/${courseId}/assignments/${id}`,
        DESTROY: (courseId: number, id: number) => `/admin/courses/${courseId}/assignments/${id}`,
      },
    },
  },
} as const