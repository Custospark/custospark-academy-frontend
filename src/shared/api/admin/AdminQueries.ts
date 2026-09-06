import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { axiosInstance } from '../../../app/api/axiosConfig'
import { ENDPOINTS } from '../endpoints'
import type { UserRole } from '../../types'
import type { Course } from '../../types'

export const adminKeys = {
  stats: ['admin', 'stats'] as const,
  users: ['admin', 'users'] as const,
  instructors: ['admin', 'instructors'] as const,
  courses: ['admin', 'courses'] as const,
}

export interface PlatformStats {
  total_users: number
  learners: number
  instructors: number
  admins: number
  total_courses: number
  published_courses: number
  total_enrollments: number
  pending_applications: number
}

export interface AdminUser {
  id: number
  name: string
  email: string
  phone: string | null
  role: UserRole
  status: 'active' | 'suspended' | 'pending'
  course_count: number
  created_at: string | null
}

interface ListResponse<T> {
  data: T[]
}

export function usePlatformStats() {
  return useQuery({
    queryKey: adminKeys.stats,
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ data: PlatformStats }>(ENDPOINTS.ADMIN.STATS)
      return data.data
    },
  })
}

/**
 * Course management listing: admins see every course, instructors only the
 * ones they created. Includes per-course enrolment counters (enrollment_summary)
 * and created_by for the management grid.
 */
export function useAdminCourses() {
  return useQuery({
    queryKey: adminKeys.courses,
    queryFn: async () => {
      const { data } = await axiosInstance.get<ListResponse<Course>>(ENDPOINTS.ADMIN.COURSES.INDEX)
      return data.data
    },
  })
}

export function useAdminUsers() {
  return useQuery({
    queryKey: adminKeys.users,
    queryFn: async () => {
      const { data } = await axiosInstance.get<ListResponse<AdminUser>>(ENDPOINTS.ADMIN.USERS.INDEX)
      return data.data
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation<AdminUser, Error, { id: number; role?: UserRole; status?: string }>({
    mutationFn: async (payload) => {
      const { id, ...body } = payload
      const { data } = await axiosInstance.put<{ data: AdminUser }>(
        ENDPOINTS.ADMIN.USERS.UPDATE(id),
        body,
      )
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users })
      queryClient.invalidateQueries({ queryKey: adminKeys.stats })
    },
  })
}

export function useInstructors(search?: string) {
  const term = search?.trim() || undefined
  return useQuery({
    queryKey: [...adminKeys.instructors, term].filter(Boolean) as [string, ...string[]],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ListResponse<AdminUser>>(
        ENDPOINTS.ADMIN.INSTRUCTORS.INDEX,
        { params: term ? { q: term } : undefined },
      )
      return data.data
    },
  })
}

export function useCreateInstructor() {
  const queryClient = useQueryClient()

  return useMutation<AdminUser, Error, { name: string; email: string; phone?: string; password: string }>({
    mutationFn: async (payload) => {
      const { data } = await axiosInstance.post<{ data: AdminUser }>(
        ENDPOINTS.ADMIN.INSTRUCTORS.STORE,
        payload,
      )
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.instructors })
      queryClient.invalidateQueries({ queryKey: adminKeys.users })
    },
  })
}

export function useDeleteInstructor() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, number>({
    mutationFn: async (id) => {
      await axiosInstance.delete(ENDPOINTS.ADMIN.INSTRUCTORS.DESTROY(id))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.instructors })
      queryClient.invalidateQueries({ queryKey: adminKeys.users })
    },
  })
}