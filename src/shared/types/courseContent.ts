import type { CourseFee } from './index'

export interface CourseSection {
  id: number
  course_id: number
  title: string
  description: string | null
  sort_order: number
  lessons: LessonItem[]
}

export interface LessonItem {
  id: number
  course_id: number
  section_id: number | null
  title: string
  content_type: 'text' | 'video' | 'article' | 'embed'
  content: string | null
  video_url: string | null
  duration_minutes: number | null
  sort_order: number
  is_free_preview: boolean
  is_published: boolean
  resources: ResourceItem[]
}

export interface LearningOutcomeItem {
  id: number
  description: string
  sort_order: number
}

export interface ResourceItem {
  id: number
  course_id: number
  lesson_id: number | null
  title: string
  type: 'book' | 'link' | 'video' | 'file' | 'article'
  url: string | null
  file_path: string | null
  description: string | null
  sort_order: number
}

export interface QuestionItem {
  id: number
  question: string
  type: string
  options: string[] | null
  correct_answer: string | null
  points: number
  explanation: string | null
  sort_order: number
}

export interface QuizItem {
  id: number
  course_id: number
  lesson_id: number | null
  title: string
  description: string | null
  passing_score: number
  time_limit_minutes: number | null
  is_published: boolean
  questions: QuestionItem[]
}

export interface ExerciseItem {
  id: number
  course_id: number
  lesson_id: number | null
  title: string
  instructions: string | null
  type: 'quiz' | 'practical'
  max_score: number
  passing_score: number
  time_limit_minutes: number | null
  is_published: boolean
  questions: QuestionItem[]
}

export interface ExamItem {
  id: number
  course_id: number
  title: string
  description: string | null
  max_score: number
  passing_score: number
  time_limit_minutes: number | null
  is_published: boolean
  questions: QuestionItem[]
}

export interface AssignmentItem {
  id: number
  course_id: number
  lesson_id: number | null
  title: string
  instructions: string | null
  submission_type: 'text' | 'file' | 'link'
  due_after_days: number | null
  max_score: number
  is_published: boolean
}

export interface CourseFull {
  id: number
  title: string
  slug: string
  description: string | null
  category: string | null
  cover_url: string | null
  status: 'draft' | 'published' | 'archived'
  level: 'beginner' | 'intermediate' | 'advanced'
  language: string
  duration_hours: number | null
  target_audience: string | null
  prerequisites: string | null
  tags: string[] | null
  delivery_mode: 'live' | 'self_paced' | 'hybrid'
  is_self_paced: boolean
  start_date: string | null
  end_date: string | null
  sections: CourseSection[]
  learning_outcomes: LearningOutcomeItem[]
  resources: ResourceItem[]
  quizzes: QuizItem[]
  exercises: ExerciseItem[]
  exams: ExamItem[]
  assignments: AssignmentItem[]
  fees: CourseFee[]
}