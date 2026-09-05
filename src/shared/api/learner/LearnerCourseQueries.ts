import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { axiosInstance } from '../../../app/api/axiosConfig'
import { ENDPOINTS } from '../endpoints'
import type { LearnerCourse } from '../../types/learnerCourse'
import type { Enrollment } from '../../types'

export const learnerKeys = {
  myCourses: ['learner', 'my-courses'] as const,
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
      const { data } = await axiosInstance.get<{
        data: { total_lessons: number; completed_lessons: number; percent: number }
      }>(ENDPOINTS.LEARNER.PROGRESS(courseId))
      return data.data
    },
    enabled: Number.isFinite(courseId),
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