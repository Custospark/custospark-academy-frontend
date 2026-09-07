import { useQuery } from '@tanstack/react-query'
import { axiosInstance } from '../../../app/api/axiosConfig'
import { ENDPOINTS } from '../endpoints'
import type { Course } from '../../types'

export const courseKeys = {
  all: ['courses'] as const,
  detail: (id: number | string) => ['courses', id] as const,
  schedules: (id: number) => ['courses', id, 'schedules'] as const,
}

interface CoursesResponse {
  data: Course[]
}

interface CourseResponse {
  data: Course
}

export function useCourses(search?: string) {
  const term = search?.trim() || undefined
  return useQuery({
    queryKey: [...courseKeys.all, term].filter(Boolean) as [string, ...string[]],
    queryFn: async () => {
      const { data } = await axiosInstance.get<CoursesResponse>(ENDPOINTS.COURSES.INDEX, {
        params: term ? { q: term } : undefined,
      })
      return data.data
    },
  })
}

export function useCourse(id: number | string) {
  const key = String(id ?? '')
  return useQuery({
    queryKey: courseKeys.detail(key),
    queryFn: async () => {
      const { data } = await axiosInstance.get<CourseResponse>(ENDPOINTS.COURSES.SHOW(key))
      return data.data
    },
    enabled: key !== '',
  })
}