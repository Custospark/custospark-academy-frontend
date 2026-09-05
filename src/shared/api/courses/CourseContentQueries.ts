import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { axiosInstance } from '../../../app/api/axiosConfig'
import { ENDPOINTS } from '../endpoints'
import type {
  CourseFull,
  CourseSection,
  LessonItem,
  LearningOutcomeItem,
  ResourceItem,
  QuizItem,
  ExerciseItem,
  ExamItem,
  AssignmentItem,
} from '../../types/courseContent'

export const courseContentKeys = {
  full: (courseId: number) => ['admin', 'course-content', courseId] as const,
}

interface DataResponse<T> {
  data: T
}

export function useCourseContent(courseId: number) {
  return useQuery({
    queryKey: courseContentKeys.full(courseId),
    queryFn: async () => {
      const { data } = await axiosInstance.get<DataResponse<CourseFull>>(
        ENDPOINTS.ADMIN.CONTENT.FULL(courseId),
      )
      return data.data
    },
    enabled: Number.isFinite(courseId),
  })
}

/** Generic helper to build a CRUD mutation for a content sub-resource. */
function useContentMutation<TInput, TOutput>(
  builder: (courseId: number, id?: number) => string,
  courseId: number,
  invalidate: boolean = true,
) {
  const queryClient = useQueryClient()

  return useMutation<TOutput, Error, TInput>({
    mutationFn: async (payload) => {
      const raw = payload as Record<string, unknown>
      const id = raw.id as number | undefined
      const body = { ...raw }
      delete body.id

      // When a File is present, send multipart/form-data.
      const hasFile = Object.values(body).some((v) => v instanceof File)
      let data: FormData | Record<string, unknown>
      if (hasFile) {
        data = new FormData()
        for (const [key, value] of Object.entries(body)) {
          if (value !== null && value !== undefined) {
            data.append(key, value instanceof File ? value : String(value))
          }
        }
      } else {
        data = body
      }

      const url = builder(courseId, id)
      const method = id ? 'put' : 'post'
      const { data: response } = await axiosInstance.request<DataResponse<TOutput>>({
        url,
        method,
        data,
      })
      return response.data
    },
    onSuccess: () => {
      if (invalidate) {
        queryClient.invalidateQueries({ queryKey: courseContentKeys.full(courseId) })
      }
    },
  })
}

export function useCreateSection(courseId: number) {
  return useContentMutation<Partial<CourseSection>, CourseSection>(
    (c) => ENDPOINTS.ADMIN.CONTENT.SECTIONS.STORE(c),
    courseId,
  )
}

export function useUpdateSection(courseId: number) {
  return useContentMutation<Partial<CourseSection>, CourseSection>(
    (c, id) => ENDPOINTS.ADMIN.CONTENT.SECTIONS.UPDATE(c, id!),
    courseId,
  )
}

export function useDeleteSection(courseId: number) {
  const queryClient = useQueryClient()
  return useMutation<{ message: string }, Error, number>({
    mutationFn: async (id) => {
      const { data } = await axiosInstance.delete(
        ENDPOINTS.ADMIN.CONTENT.SECTIONS.DESTROY(courseId, id),
      )
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: courseContentKeys.full(courseId) }),
  })
}

export function useCreateLesson(courseId: number) {
  return useContentMutation<Partial<LessonItem>, LessonItem>(
    (c) => ENDPOINTS.ADMIN.CONTENT.LESSONS.STORE(c),
    courseId,
  )
}

export function useUpdateLesson(courseId: number) {
  return useContentMutation<Partial<LessonItem>, LessonItem>(
    (c, id) => ENDPOINTS.ADMIN.CONTENT.LESSONS.UPDATE(c, id!),
    courseId,
  )
}

export function useDeleteLesson(courseId: number) {
  const queryClient = useQueryClient()
  return useMutation<{ message: string }, Error, number>({
    mutationFn: async (id) => {
      const { data } = await axiosInstance.delete(
        ENDPOINTS.ADMIN.CONTENT.LESSONS.DESTROY(courseId, id),
      )
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: courseContentKeys.full(courseId) }),
  })
}

export function useCreateOutcome(courseId: number) {
  return useContentMutation<{ description: string }, LearningOutcomeItem>(
    (c) => ENDPOINTS.ADMIN.CONTENT.OUTCOMES.STORE(c),
    courseId,
  )
}

export function useDeleteOutcome(courseId: number) {
  const queryClient = useQueryClient()
  return useMutation<{ message: string }, Error, number>({
    mutationFn: async (id) => {
      const { data } = await axiosInstance.delete(
        ENDPOINTS.ADMIN.CONTENT.OUTCOMES.DESTROY(courseId, id),
      )
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: courseContentKeys.full(courseId) }),
  })
}

export function useCreateResource(courseId: number) {
  return useContentMutation<Partial<ResourceItem>, ResourceItem>(
    (c) => ENDPOINTS.ADMIN.CONTENT.RESOURCES.STORE(c),
    courseId,
  )
}

export function useDeleteResource(courseId: number) {
  const queryClient = useQueryClient()
  return useMutation<{ message: string }, Error, number>({
    mutationFn: async (id) => {
      const { data } = await axiosInstance.delete(
        ENDPOINTS.ADMIN.CONTENT.RESOURCES.DESTROY(courseId, id),
      )
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: courseContentKeys.full(courseId) }),
  })
}

export function useCreateQuiz(courseId: number) {
  return useContentMutation<Partial<QuizItem>, QuizItem>(
    (c) => ENDPOINTS.ADMIN.CONTENT.QUIZZES.STORE(c),
    courseId,
  )
}

export function useDeleteQuiz(courseId: number) {
  const queryClient = useQueryClient()
  return useMutation<{ message: string }, Error, number>({
    mutationFn: async (id) => {
      const { data } = await axiosInstance.delete(
        ENDPOINTS.ADMIN.CONTENT.QUIZZES.DESTROY(courseId, id),
      )
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: courseContentKeys.full(courseId) }),
  })
}

export function useCreateExercise(courseId: number) {
  return useContentMutation<Partial<ExerciseItem>, ExerciseItem>(
    (c) => ENDPOINTS.ADMIN.CONTENT.EXERCISES.STORE(c),
    courseId,
  )
}

export function useDeleteExercise(courseId: number) {
  const queryClient = useQueryClient()
  return useMutation<{ message: string }, Error, number>({
    mutationFn: async (id) => {
      const { data } = await axiosInstance.delete(
        ENDPOINTS.ADMIN.CONTENT.EXERCISES.DESTROY(courseId, id),
      )
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: courseContentKeys.full(courseId) }),
  })
}

export function useCreateExam(courseId: number) {
  return useContentMutation<Partial<ExamItem>, ExamItem>(
    (c) => ENDPOINTS.ADMIN.CONTENT.EXAMS.STORE(c),
    courseId,
  )
}

export function useDeleteExam(courseId: number) {
  const queryClient = useQueryClient()
  return useMutation<{ message: string }, Error, number>({
    mutationFn: async (id) => {
      const { data } = await axiosInstance.delete(
        ENDPOINTS.ADMIN.CONTENT.EXAMS.DESTROY(courseId, id),
      )
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: courseContentKeys.full(courseId) }),
  })
}

export function useCreateAssignment(courseId: number) {
  return useContentMutation<Partial<AssignmentItem>, AssignmentItem>(
    (c) => ENDPOINTS.ADMIN.CONTENT.ASSIGNMENTS.STORE(c),
    courseId,
  )
}

export function useDeleteAssignment(courseId: number) {
  const queryClient = useQueryClient()
  return useMutation<{ message: string }, Error, number>({
    mutationFn: async (id) => {
      const { data } = await axiosInstance.delete(
        ENDPOINTS.ADMIN.CONTENT.ASSIGNMENTS.DESTROY(courseId, id),
      )
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: courseContentKeys.full(courseId) }),
  })
}