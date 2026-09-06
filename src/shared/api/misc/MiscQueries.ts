import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { axiosInstance } from '../../../app/api/axiosConfig'
import { ENDPOINTS } from '../endpoints'
import { learnerKeys } from '../learner/LearnerCourseQueries'
import { courseKeys } from '../courses/CourseQueries'
import type { CourseSchedule } from '../../types'

export const miscKeys = {
  certificates: ['certificates', 'mine'] as const,
  certificatePdf: (certificateId: number) => ['certificates', 'pdf', certificateId] as const,
  schedules: ['schedules'] as const,
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

export function useAllSchedules() {
  return useQuery({
    queryKey: miscKeys.schedules,
    queryFn: async () => {
      // Aggregate schedules across enrolled courses via their content.
      const { data } = await axiosInstance.get<{ data: CourseSchedule[] }>(ENDPOINTS.ADMIN.CONTENT.FULL(0))
      return data.data ?? []
    },
  })
}

export interface AdminEnrollment {
  id: number
  course_id: number
  course_title: string | null
  user_id: number
  user_name: string | null
  status: string
  applied_at: string | null
  admitted_at: string | null
  application_review_note: string | null
}

export function useAdminEnrollments(filters?: { status?: string }) {
  return useQuery({
    queryKey: [...miscKeys.adminEnrollments, filters?.status ?? ''],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ data: AdminEnrollment[] }>(
        ENDPOINTS.ADMIN.ENROLLMENTS,
        { params: filters?.status ? { status: filters.status } : undefined },
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