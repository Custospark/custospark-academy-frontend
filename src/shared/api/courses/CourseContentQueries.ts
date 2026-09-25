import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AxiosProgressEvent } from 'axios'
import { axiosInstance } from '../../../app/api/axiosConfig'
import { UPLOAD_TIMEOUT } from '../../../app/api/apiConfig'
import { imperativeToast } from '../../../app/contexts/imperativeToast'
import { apiErrorMessage } from '../../utils/apiError'
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
  full: (courseId: string) => ['admin', 'course-content', courseId] as const,
}

interface DataResponse<T> {
  data: T
}

export function useCourseContent(courseId: string) {
  return useQuery({
    queryKey: courseContentKeys.full(courseId),
    queryFn: async () => {
      const { data } = await axiosInstance.get<DataResponse<CourseFull>>(
        ENDPOINTS.ADMIN.CONTENT.FULL(courseId),
      )
      return data.data
    },
    enabled: courseId !== '',
  })
}

/** Generic helper to build a CRUD mutation for a content sub-resource. */
export type UploadProgressHandler = (event: AxiosProgressEvent) => void

function useContentMutation<TInput, TOutput>(
  builder: (courseId: string, id?: number) => string,
  courseId: string,
  invalidate: boolean = true,
) {
  const queryClient = useQueryClient()

  return useMutation<TOutput, Error, TInput & { onUploadProgress?: UploadProgressHandler }>({
    mutationFn: async (payload) => {
      const raw = payload as Record<string, unknown>
      const id = raw.id as number | undefined
      const onUploadProgress = raw.onUploadProgress as UploadProgressHandler | undefined
      const body = { ...raw }
      delete body.id
      delete body.onUploadProgress

      // Slow connections need room: every file upload (video or document)
      // gets up to 1 hour (axios default is far shorter).
      const hasFile = Object.values(body).some((v) => v instanceof File)
      let data: FormData | Record<string, unknown>
      let timeout: number | undefined
      if (hasFile) {
        timeout = UPLOAD_TIMEOUT
        data = new FormData()
        for (const [key, value] of Object.entries(body)) {
          if (value !== null && value !== undefined) {
            if (value instanceof File) {
              data.append(key, value)
            } else if (typeof value === 'boolean') {
              data.append(key, value ? '1' : '0')
            } else {
              data.append(key, String(value))
            }
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
        ...(timeout !== undefined ? { timeout } : {}),
        ...(onUploadProgress ? { onUploadProgress } : {}),
      })
      return response.data
    },
    onSuccess: () => {
      if (invalidate) {
        queryClient.invalidateQueries({ queryKey: courseContentKeys.full(courseId) })
      }
      imperativeToast.show('success', 'Saved.')
    },
    onError: (err) => {
      imperativeToast.show('error', apiErrorMessage(err, 'Could not save changes.'))
    },
  })
}

/** Generic delete mutation: invalidates the builder + confirms via toast. */
function useDeleteContent(courseId: string, destroy: (courseId: string, id: number) => string) {
  const queryClient = useQueryClient()
  return useMutation<{ message: string }, Error, number>({
    mutationFn: async (id) => {
      const { data } = await axiosInstance.delete(destroy(courseId, id))
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseContentKeys.full(courseId) })
      imperativeToast.show('success', 'Removed.')
    },
    onError: (err) => {
      imperativeToast.show('error', apiErrorMessage(err, 'Could not remove.'))
    },
  })
}

export function useCreateSection(courseId: string) {
  return useContentMutation<Partial<CourseSection>, CourseSection>(
    (c) => ENDPOINTS.ADMIN.CONTENT.SECTIONS.STORE(c),
    courseId,
  )
}

export function useUpdateSection(courseId: string) {
  return useContentMutation<Partial<CourseSection>, CourseSection>(
    (c, id) => ENDPOINTS.ADMIN.CONTENT.SECTIONS.UPDATE(c, id!),
    courseId,
  )
}

export function useDeleteSection(courseId: string) {
  return useDeleteContent(courseId, ENDPOINTS.ADMIN.CONTENT.SECTIONS.DESTROY)
}

export function useCreateLesson(courseId: string) {
  return useContentMutation<Partial<LessonItem>, LessonItem>(
    (c) => ENDPOINTS.ADMIN.CONTENT.LESSONS.STORE(c),
    courseId,
  )
}

export function useUpdateLesson(courseId: string) {
  return useContentMutation<Partial<LessonItem>, LessonItem>(
    (c, id) => ENDPOINTS.ADMIN.CONTENT.LESSONS.UPDATE(c, id!),
    courseId,
  )
}

export function useDeleteLesson(courseId: string) {
  return useDeleteContent(courseId, ENDPOINTS.ADMIN.CONTENT.LESSONS.DESTROY)
}

export function useCreateOutcome(courseId: string) {
  return useContentMutation<{ description: string }, LearningOutcomeItem>(
    (c) => ENDPOINTS.ADMIN.CONTENT.OUTCOMES.STORE(c),
    courseId,
  )
}

export function useUpdateOutcome(courseId: string) {
  return useContentMutation<Partial<LearningOutcomeItem> & { id: number }, LearningOutcomeItem>(
    (c, id) => ENDPOINTS.ADMIN.CONTENT.OUTCOMES.UPDATE(c, id!),
    courseId,
  )
}

export function useDeleteOutcome(courseId: string) {
  return useDeleteContent(courseId, ENDPOINTS.ADMIN.CONTENT.OUTCOMES.DESTROY)
}

export function useCreateResource(courseId: string) {
  return useContentMutation<Partial<ResourceItem>, ResourceItem>(
    (c) => ENDPOINTS.ADMIN.CONTENT.RESOURCES.STORE(c),
    courseId,
  )
}

export function useDeleteResource(courseId: string) {
  return useDeleteContent(courseId, ENDPOINTS.ADMIN.CONTENT.RESOURCES.DESTROY)
}

export function useCreateQuiz(courseId: string) {
  return useContentMutation<Partial<QuizItem>, QuizItem>(
    (c) => ENDPOINTS.ADMIN.CONTENT.QUIZZES.STORE(c),
    courseId,
  )
}

export function useDeleteQuiz(courseId: string) {
  return useDeleteContent(courseId, ENDPOINTS.ADMIN.CONTENT.QUIZZES.DESTROY)
}

export function useCreateExercise(courseId: string) {
  return useContentMutation<Partial<ExerciseItem>, ExerciseItem>(
    (c) => ENDPOINTS.ADMIN.CONTENT.EXERCISES.STORE(c),
    courseId,
  )
}

export function useDeleteExercise(courseId: string) {
  return useDeleteContent(courseId, ENDPOINTS.ADMIN.CONTENT.EXERCISES.DESTROY)
}

export function useCreateExam(courseId: string) {
  return useContentMutation<Partial<ExamItem>, ExamItem>(
    (c) => ENDPOINTS.ADMIN.CONTENT.EXAMS.STORE(c),
    courseId,
  )
}

export function useDeleteExam(courseId: string) {
  return useDeleteContent(courseId, ENDPOINTS.ADMIN.CONTENT.EXAMS.DESTROY)
}

export function useCreateAssignment(courseId: string) {
  return useContentMutation<Partial<AssignmentItem>, AssignmentItem>(
    (c) => ENDPOINTS.ADMIN.CONTENT.ASSIGNMENTS.STORE(c),
    courseId,
  )
}

export function useUpdateAssignment(courseId: string) {
  return useContentMutation<Partial<AssignmentItem> & { id: number }, AssignmentItem>(
    (c, id) => ENDPOINTS.ADMIN.CONTENT.ASSIGNMENTS.UPDATE(c, id!),
    courseId,
  )
}

export function useDeleteAssignment(courseId: string) {
  return useDeleteContent(courseId, ENDPOINTS.ADMIN.CONTENT.ASSIGNMENTS.DESTROY)
}

export interface QuestionImportResult {
  imported: number
  total: number
  errors: string[]
}

export function useImportQuestions(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation<QuestionImportResult, Error, { kind: string; parentId: number; file: File; onUploadProgress?: UploadProgressHandler }>({
    mutationFn: async ({ kind, parentId, file, onUploadProgress }) => {
      const body = new FormData()
      body.append('file', file)
      const { data } = await axiosInstance.post<{ data: QuestionImportResult }>(
        ENDPOINTS.ADMIN.CONTENT.QUESTIONS_IMPORT(courseId, kind, parentId),
        body,
        // Spreadsheet parsing runs server-side - give it up to 1 hour.
        { timeout: UPLOAD_TIMEOUT, ...(onUploadProgress ? { onUploadProgress } : {}) },
      )
      return data.data
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: courseContentKeys.full(courseId) })
      const summary =
        result.errors.length > 0
          ? `Imported ${result.imported} of ${result.total} questions. ${result.errors[0]}`
          : `Imported ${result.imported} question${result.imported === 1 ? '' : 's'}.`
      imperativeToast.show(result.errors.length > 0 ? 'warning' : 'success', summary, 8000)
    },
    onError: (err) => {
      imperativeToast.show('error', apiErrorMessage(err, 'Could not import questions.'))
    },
  })
}

/** Download the fill-in Excel template as a file (authed blob download). */
export function useQuestionsTemplate(courseId: string) {
  return async () => {
    const { data } = await axiosInstance.get(
      ENDPOINTS.ADMIN.CONTENT.QUESTIONS_TEMPLATE(courseId),
      { responseType: 'blob' },
    )
    const url = URL.createObjectURL(new Blob([data]))
    const link = document.createElement('a')
    link.href = url
    link.download = 'questions-template.xlsx'
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }
}

export interface ResultsImportResult {
  imported: number
  total: number
  errors: string[]
}

/** Bulk-upload instructor results (exams, exercises, assignments). */
export function useImportResults(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation<ResultsImportResult, Error, { kind: string; parentId: number; file: File; onUploadProgress?: UploadProgressHandler }>({
    mutationFn: async ({ kind, parentId, file, onUploadProgress }) => {
      const body = new FormData()
      body.append('file', file)
      const { data } = await axiosInstance.post<{ data: ResultsImportResult }>(
        ENDPOINTS.ADMIN.CONTENT.RESULTS_IMPORT(courseId, kind, parentId),
        body,
        // Spreadsheet parsing runs server-side - give it up to 1 hour.
        { timeout: UPLOAD_TIMEOUT, ...(onUploadProgress ? { onUploadProgress } : {}) },
      )
      return data.data
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: courseContentKeys.full(courseId) })
      const summary =
        result.errors.length > 0
          ? `Recorded ${result.imported} of ${result.total} results. ${result.errors[0]}`
          : `Recorded ${result.imported} result${result.imported === 1 ? '' : 's'}.`
      imperativeToast.show(result.errors.length > 0 ? 'warning' : 'success', summary, 8000)
    },
    onError: (err) => {
      imperativeToast.show('error', apiErrorMessage(err, 'Could not import results.'))
    },
  })
}

/** Download the fill-in results template as a file (authed blob download). */
export function useResultsTemplate(courseId: string) {
  return async () => {
    const { data } = await axiosInstance.get(
      ENDPOINTS.ADMIN.CONTENT.RESULTS_TEMPLATE(courseId),
      { responseType: 'blob' },
    )
    const url = URL.createObjectURL(new Blob([data]))
    const link = document.createElement('a')
    link.href = url
    link.download = 'results-template.xlsx'
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }
}
export interface InstructorSubmission {
  id: number
  user_id: number
  learner_name: string
  learner_email: string
  assessment_type: string
  assessment_id: number
  assessment_title: string
  content: string | null
  file_path: string | null
  status: string
  score: number | null
  grade: string | null
  max_score: number | null
  feedback: string | null
  submitted_at: string | null
  graded_at: string | null
}

/** Instructor grading inbox for a course, filterable by status/type. */
export function useSubmissions(courseId: string, status?: string, type?: string) {
  return useQuery({
    queryKey: [...courseContentKeys.full(courseId), 'submissions', status ?? '', type ?? ''],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ data: InstructorSubmission[] }>(
        ENDPOINTS.ADMIN.CONTENT.SUBMISSIONS(courseId),
        { params: { status: status || undefined, type: type || undefined } },
      )
      return data.data
    },
    enabled: courseId !== '',
  })
}

export function useGradeSubmission(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation<unknown, Error, { submissionId: number; score?: number; grade?: string; feedback?: string }>({
    mutationFn: async ({ submissionId, score, grade, feedback }) => {
      const { data } = await axiosInstance.put(
        ENDPOINTS.ADMIN.CONTENT.GRADE_SUBMISSION(courseId, submissionId),
        { score: score ?? null, grade: grade || null, feedback: feedback || null },
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...courseContentKeys.full(courseId), 'submissions'] })
      imperativeToast.show('success', 'Grade saved.')
    },
    onError: (err) => {
      imperativeToast.show('error', apiErrorMessage(err, 'Could not save the grade.'))
    },
  })
}
