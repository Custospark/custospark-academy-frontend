import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { axiosInstance } from '../../../app/api/axiosConfig'
import { ENDPOINTS } from '../endpoints'
import { courseKeys } from '../courses/CourseQueries'
import type { LearnerCourse } from '../../types/learnerCourse'
import type { CourseProgress, Enrollment, PaymentItem } from '../../types'

export const learnerKeys = {
  myCourses: ['learner', 'my-courses'] as const,
  payments: ['learner', 'payments'] as const,
  paymentDetail: (paymentId: number) => ['learner', 'payments', 'detail', paymentId] as const,
  content: (courseId: number) => ['learner', 'content', courseId] as const,
  progress: (courseId: number) => ['learner', 'progress', courseId] as const,
}

export function useMyEnrollments() {
  return useQuery({
    queryKey: learnerKeys.myCourses,
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ data: Enrollment[] }>(ENDPOINTS.ENROLLMENTS.MINE)
      return data.data
    },
  })
}

export function useLearnerCourse(courseId: number) {
  return useQuery({
    queryKey: learnerKeys.content(courseId),
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ data: LearnerCourse }>(
        ENDPOINTS.LEARNER.CONTENT(courseId),
      )
      return data.data
    },
    enabled: Number.isFinite(courseId),
  })
}

export function useLearnerProgress(courseId: number) {
  return useQuery({
    queryKey: learnerKeys.progress(courseId),
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ data: CourseProgress }>(ENDPOINTS.LEARNER.PROGRESS(courseId))
      return data.data
    },
    enabled: Number.isFinite(courseId),
  })
}

export function useMyPayments() {
  return useQuery({
    queryKey: learnerKeys.payments,
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ data: PaymentItem[] }>(ENDPOINTS.PAYMENTS.INDEX)
      return data.data
    },
  })
}

/**
 * Live status of a single payment (GET /payments/{id}). While a payment is
 * pending/processing the backend polls the gateway; this query keeps polling
 * at a short interval and stops once the payment terminal state is reached.
 */
export function usePaymentStatus(paymentId: number | null) {
  return useQuery({
    queryKey: learnerKeys.paymentDetail(paymentId ?? 0),
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ data: PaymentItem }>(
        ENDPOINTS.PAYMENTS.VERIFY(paymentId as number),
      )
      return data.data
    },
    enabled: paymentId !== null && Number.isFinite(paymentId),
    refetchInterval: (query) =>
      query.state.data && ['pending', 'processing'].includes(query.state.data.status) ? 5000 : false,
  })
}

export function useCompleteEnrollment() {
  const queryClient = useQueryClient()

  return useMutation<Enrollment, Error, { enrollmentId: number }>({
    mutationFn: async ({ enrollmentId }) => {
      const { data } = await axiosInstance.post<{ data: Enrollment }>(
        ENDPOINTS.ENROLLMENTS.COMPLETE(enrollmentId),
      )
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learnerKeys.myCourses })
      queryClient.invalidateQueries({ queryKey: courseKeys.all })
    },
  })
}

export function useMarkLesson(courseId: number) {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { lessonId: number; status: string }>({
    mutationFn: async ({ lessonId, status }) => {
      await axiosInstance.post(ENDPOINTS.LEARNER.MARK_LESSON(courseId, lessonId), { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learnerKeys.progress(courseId) })
    },
  })
}

export interface SubmitResult {
  id: number
  status: string
  content: string | null
  file_path: string | null
  score: number | null
  max_score: number | null
  feedback: string | null
}

export function useSubmitWork(courseId: number) {
  return useMutation<SubmitResult, Error, { type: string; typeId: number; content?: string; file?: File }>({
    mutationFn: async ({ type, typeId, content, file }) => {
      const body = new FormData()
      if (content) body.append('content', content)
      if (file) body.append('file', file)
      const { data } = await axiosInstance.post<{ data: SubmitResult }>(
        ENDPOINTS.LEARNER.SUBMIT(courseId, type, typeId),
        body,
      )
      return data.data
    },
  })
}

export interface AttemptResult {
  id: number
  score: number
  max_score: number
  is_passed: boolean
}

export function useSubmitAttempt(courseId: number) {
  return useMutation<AttemptResult, Error, { type: string; typeId: number; answers: Record<number, string> }>({
    mutationFn: async ({ type, typeId, answers }) => {
      const { data } = await axiosInstance.post<{ data: AttemptResult }>(
        ENDPOINTS.LEARNER.ATTEMPT(courseId, type, typeId),
        { answers },
      )
      return data.data
    },
  })
}

export interface ApplyResult {
  id: number
  course_id: number
  course_title: string | null
  status: string
  applied_at: string | null
}

export function useApply() {
  const queryClient = useQueryClient()

  return useMutation<ApplyResult, Error, { courseId: number }>({
    mutationFn: async ({ courseId }) => {
      const { data } = await axiosInstance.post<{ data: ApplyResult }>(ENDPOINTS.ENROLLMENTS.APPLY, {
        course_id: courseId,
      })
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learnerKeys.myCourses })
      queryClient.invalidateQueries({ queryKey: courseKeys.all })
    },
  })
}

export interface PayInitiateResult {
  payment: {
    id: number
    enrollment_id: number
    fee_type: string
    amount: number
    currency: string
    status: string
    method: string
    reference: string | null
    paid_at: string | null
  } | null
  enrollment: {
    id: number
    course_id: number
    status: string
    applied_at: string | null
    admitted_at: string | null
  } | null
  redirect_url: string | null
  type: string
  message: string | null
}

export function usePayFee() {
  const queryClient = useQueryClient()

  return useMutation<PayInitiateResult, Error, { enrollmentId: number; feeType: string }>({
    mutationFn: async ({ enrollmentId, feeType }) => {
      const { data } = await axiosInstance.post<{ data: PayInitiateResult }>(
        ENDPOINTS.ENROLLMENTS.PAY(enrollmentId, feeType),
        {},
      )
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learnerKeys.myCourses })
      queryClient.invalidateQueries({ queryKey: courseKeys.all })
    },
  })
}