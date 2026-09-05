import { useQuery } from '@tanstack/react-query'
import { axiosInstance } from '../../../app/api/axiosConfig'
import { ENDPOINTS } from '../endpoints'
import type { Course } from '../../types'

export const courseKeys = {
  all: ['courses'] as const,
  detail: (id: number) => ['courses', id] as const,
  schedules: (id: number) => ['courses', id, 'schedules'] as const,
}

interface CoursesResponse {
  data: Course[]
}

interface CourseResponse {
  data: Course
}

export function useCourses() {
  return useQuery({
    queryKey: courseKeys.all,
    queryFn: async () => {
      const { data } = await axiosInstance.get<CoursesResponse>(ENDPOINTS.COURSES.INDEX)
      return data.data
    },
  })
}

export function useCourse(id: number | string) {
  return useQuery({
    queryKey: courseKeys.detail(Number(id)),
    queryFn: async () => {
      const { data } = await axiosInstance.get<CourseResponse>(ENDPOINTS.COURSES.SHOW(Number(id)))
      return data.data
    },
    enabled: Number.isFinite(Number(id)),
  })
}