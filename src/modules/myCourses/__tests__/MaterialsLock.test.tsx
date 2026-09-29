import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { ToastProvider } from '../../../app/contexts/ToastContext'
import type { LearnerCourse } from '../../../shared/types/learnerCourse'
import type { Enrollment } from '../../../shared/types'

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useParams: () => ({ slug: 'web-development' }),
    Link: ({ children }: { children: ReactNode }) => <>{children}</>,
  }
})

vi.mock('../../../app/store/hooks/useApp', () => ({
  useAppSelector: () => undefined,
}))

vi.mock('../../../shared/components/buttons/EnrollmentActionButton', () => ({
  EnrollmentActionButton: () => <button type="button">Pay application fee</button>,
}))

const courseQuery = vi.hoisted(() => ({ current: {} as Record<string, unknown> }))
const progressQuery = vi.hoisted(() => ({ current: {} as Record<string, unknown> }))
const enrollmentsQuery = vi.hoisted(() => ({ current: {} as Record<string, unknown> }))

vi.mock('../../../shared/api/learner/LearnerCourseQueries', () => ({
  useLearnerCourse: () => courseQuery.current,
  useLearnerProgress: () => progressQuery.current,
  useMyEnrollments: () => enrollmentsQuery.current,
  useMarkLesson: () => ({ mutate: vi.fn(), isPending: false }),
  useCompleteEnrollment: () => ({ mutate: vi.fn(), isPending: false }),
}))

import MyCourseDetailPage from '../MyCourseDetailPage'

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return (
    <QueryClientProvider client={client}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  )
}

function course(overrides: Partial<LearnerCourse> = {}): LearnerCourse {
  return {
    id: 2,
    title: 'Web Development',
    slug: 'web-development',
    enrollment_opens_at: null,
    enrollment_closes_at: null,
    description: 'Build websites',
    category: 'Software & Coding',
    level: 'beginner',
    delivery_mode: 'self_paced',
    is_self_paced: true,
    sections: [],
    learning_outcomes: [],
    resources: [],
    quizzes: [],
    exercises: [],
    exams: [],
    assignments: [],
    materials_locked: false,
    materials_grace_until: null,
    ...overrides,
  }
}

function enrollment(): Enrollment {
  return {
    id: 9,
    course_id: 2,
    course_slug: 'web-development',
    course_title: 'Web Development',
    enrollment_opens_at: null,
    enrollment_closes_at: null,
    user_id: 6,
    user_name: 'Learner',
    status: 'applied',
    applied_at: new Date().toISOString(),
    admitted_at: null,
    completed_at: null,
    certified_at: null,
    application_review_note: null,
    fees: [],
    payments: [],
    certificate: null,
  }
}

describe('materials lock notice', () => {
  afterEach(() => {
    cleanup()
  })
  beforeEach(() => {
    courseQuery.current = { data: undefined, isPending: false, isError: false, refetch: vi.fn() }
    progressQuery.current = { data: undefined }
    enrollmentsQuery.current = { data: [enrollment()], refetch: vi.fn() }
  })

  it('shows a paywall with pay action when materials are locked', () => {
    courseQuery.current = {
      data: course({ materials_locked: true, materials_grace_until: null }),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    }

    render(<MyCourseDetailPage />, { wrapper })

    expect(screen.getByText('Trial study period ended')).toBeTruthy()
    expect(screen.getByText('Pay application fee')).toBeTruthy()
    expect(screen.queryByText('Curriculum')).toBeNull()
  })

  it('shows the learning tabs when materials are open', () => {
    courseQuery.current = {
      data: course({ materials_locked: false }),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    }

    render(<MyCourseDetailPage />, { wrapper })

    expect(screen.getByText('Curriculum')).toBeTruthy()
    expect(screen.queryByText('Trial study period ended')).toBeNull()
  })
})
