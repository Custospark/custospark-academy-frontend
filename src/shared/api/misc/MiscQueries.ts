import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { axiosInstance } from '../../../app/api/axiosConfig'
import { ENDPOINTS } from '../endpoints'
import { learnerKeys } from '../learner/LearnerCourseQueries'
import { courseKeys } from '../courses/CourseQueries'
import type { CourseSchedule } from '../../types'

export const miscKeys = {
  certificates: ['certificates', 'mine'] as const,
  certificatePdf: (certificateId: number) => ['certificates', 'pdf', certificateId] as const,
  certificatePreview: (courseId: number) => ['certificates', 'preview', courseId] as const,
  schedules: ['schedules'] as const,
  mySchedules: ['schedules', 'mine'] as const,
  adminEnrollments: ['admin', 'enrollments'] as const,
}

export interface CertificateItem {
  id: number
  enrollment_id: number
  user_id: number
  course_id: number
  course_title: string | null
  user_name: string | null
  certificate_reference: string
  issued_at: string | null
  pdf_path: string | null
  pdf_url: string | null
  download_url: string | null
}

export function useMyCertificates() {
  return useQuery({
    queryKey: miscKeys.certificates,
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ data: CertificateItem[] }>(ENDPOINTS.CERTIFICATES.MINE)
      return data.data
    },
  })
}

export function useIssueCertificate() {
  const queryClient = useQueryClient()

  return useMutation<CertificateItem, Error, { enrollmentId: number }>({
    mutationFn: async ({ enrollmentId }) => {
      const { data } = await axiosInstance.post<{ data: CertificateItem }>(
        ENDPOINTS.CERTIFICATES.ISSUE(enrollmentId),
      )
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: miscKeys.certificates })
      queryClient.invalidateQueries({ queryKey: learnerKeys.myCourses })
      queryClient.invalidateQueries({ queryKey: courseKeys.all })
    },
  })
}

/** Fetches a certificate's rendered PDF as a blob for preview/download. */
export function useCertificatePdf(certificateId: number | null) {
  return useQuery({
    queryKey: miscKeys.certificatePdf(certificateId ?? 0),
    queryFn: async () => {
      const { data } = await axiosInstance.get<Blob>(
        ENDPOINTS.CERTIFICATES.PDF(certificateId as number),
        { responseType: 'blob' },
      )
      return data
    },
    enabled: certificateId !== null && Number.isFinite(certificateId),
    staleTime: Infinity,
  })
}

/**
 * Fetches a course's watermarked certificate SAMPLE as a PDF blob. This is a
 * preview only - the backend never creates a certificate record for it and the
 * sheet is covered in a diagonal PREVIEW watermark, so nothing derived from the
 * blob URL can pass as a real certificate.
 */
export function useCertificatePreview(courseId: number | null) {
  return useQuery({
    queryKey: miscKeys.certificatePreview(courseId ?? 0),
    queryFn: async () => {
      const { data } = await axiosInstance.get<Blob>(
        ENDPOINTS.CERTIFICATES.PREVIEW(courseId as number),
        { responseType: 'blob' },
      )
      return data
    },
    enabled: courseId !== null && Number.isFinite(courseId) && courseId > 0,
    staleTime: Infinity,
  })
}

export function useCourseSchedules(courseId: number) {
  return useQuery({
    queryKey: [...miscKeys.schedules, courseId],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ data: CourseSchedule[] }>(
        ENDPOINTS.COURSES.SCHEDULES(courseId),
      )
      return data.data
    },
    enabled: Number.isFinite(courseId),
  })
}

/** Learner: all sessions across the courses they are actively enrolled in. */
export function useMySchedules() {
  return useQuery({
    queryKey: miscKeys.mySchedules,
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ data: CourseSchedule[] }>(ENDPOINTS.SCHEDULES.MINE)
      return data.data
    },
  })
}

export interface SchedulePayload {
  title?: string
  instructor_id?: number | null
  starts_at?: string
  ends_at?: string
  location?: string | null
  is_online?: boolean
}

export function useCreateSchedule() {
  const queryClient = useQueryClient()

  return useMutation<CourseSchedule, Error, { courseId: number; payload: SchedulePayload }>({
    mutationFn: async ({ courseId, payload }) => {
      const { data } = await axiosInstance.post<{ data: CourseSchedule }>(
        ENDPOINTS.SCHEDULES.STORE(courseId),
        payload,
      )
      return data.data
    },
    onSuccess: (_schedule, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: [...miscKeys.schedules, courseId] })
      queryClient.invalidateQueries({ queryKey: miscKeys.mySchedules })
    },
  })
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient()

  return useMutation<
    CourseSchedule,
    Error,
    { courseId: number; scheduleId: number; payload: SchedulePayload }
  >({
    mutationFn: async ({ courseId, scheduleId, payload }) => {
      const { data } = await axiosInstance.put<{ data: CourseSchedule }>(
        ENDPOINTS.SCHEDULES.UPDATE(courseId, scheduleId),
        payload,
      )
      return data.data
    },
    onSuccess: (_schedule, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: [...miscKeys.schedules, courseId] })
      queryClient.invalidateQueries({ queryKey: miscKeys.mySchedules })
    },
  })
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { courseId: number; scheduleId: number }>({
    mutationFn: async ({ courseId, scheduleId }) => {
      await axiosInstance.delete(ENDPOINTS.SCHEDULES.DESTROY(courseId, scheduleId))
    },
    onSuccess: (_data, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: [...miscKeys.schedules, courseId] })
      queryClient.invalidateQueries({ queryKey: miscKeys.mySchedules })
    },
  })
}

export interface AdminEnrollment {
  id: number
  course_id: number
  course_title: string | null
  user_id: number
  user_name: string | null
  user_email: string | null
  status: string
  has_paid_application: boolean
  has_paid_tuition: boolean
  has_paid_certificate: boolean
  applied_at: string | null
  admitted_at: string | null
  completed_at: string | null
  certified_at: string | null
  application_review_note: string | null
}

export interface AdminEnrollmentFilters {
  courseId?: number | null
  status?: string
  q?: string
}

export function useAdminEnrollments(filters?: AdminEnrollmentFilters) {
  const params: Record<string, string> = {}
  if (filters?.courseId && Number.isFinite(filters.courseId)) params.course_id = String(filters.courseId)
  if (filters?.status) params.status = filters.status
  if (filters?.q?.trim()) params.q = filters.q.trim()

  return useQuery({
    queryKey: [
      ...miscKeys.adminEnrollments,
      params.course_id ?? '',
      params.status ?? '',
      params.q ?? '',
    ],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ data: AdminEnrollment[] }>(
        ENDPOINTS.ADMIN.ENROLLMENTS,
        { params: Object.keys(params).length > 0 ? params : undefined },
      )
      return data.data
    },
  })
}

export function useUpdateEnrollmentStatus(courseId: number) {
  const queryClient = useQueryClient()
  const isAdminEnrollment = courseId <= 0

  return useMutation<{ data: AdminEnrollment }, Error, { id: number; action: 'admit' | 'reject'; note?: string }>({
    mutationFn: async ({ id, action, note }) => {
      const url =
        action === 'admit' ? ENDPOINTS.ADMIN.ADMIT(id) : ENDPOINTS.ADMIN.REJECT(id)
      const { data } = await axiosInstance.post<{ data: AdminEnrollment }>(url, { note })
      return data
    },
    onSuccess: () => {
      if (isAdminEnrollment) {
        queryClient.invalidateQueries({ queryKey: miscKeys.adminEnrollments })
      }
    },
  })
}