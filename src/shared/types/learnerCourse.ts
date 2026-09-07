import type { CourseSection } from './courseContent'

export interface LearnerLesson {
  id: number
  section_id: number | null
  title: string
  content_type: string
  content: string | null
  video_url: string | null
  duration_minutes: number | null
  sort_order: number
  is_free_preview: boolean
}

export interface LearnerQuestion {
  id: number
  question: string
  type: string
  options: string[] | null
  points: number
}

export interface LearnerQuiz {
  id: number
  title: string
  description: string | null
  passing_score: number
  time_limit_minutes: number | null
  opens_at: string | null
  closes_at: string | null
  questions: LearnerQuestion[]
  my_status: LearnerAttemptStatus | null
}

export interface LearnerExercise {
  id: number
  title: string
  instructions: string | null
  file_path: string | null
  type: string
  opens_at: string | null
  closes_at: string | null
  max_score: number
  passing_score: number
  questions: LearnerQuestion[]
  my_status: LearnerAttemptStatus | LearnerSubmissionStatus | null
}

export interface LearnerExam {
  id: number
  title: string
  description: string | null
  file_path: string | null
  max_score: number
  passing_score: number
  time_limit_minutes: number | null
  opens_at: string | null
  closes_at: string | null
  questions: LearnerQuestion[]
  my_status: LearnerSubmissionStatus | null
}

export interface LearnerAssignment {
  id: number
  title: string
  instructions: string | null
  submission_type: 'text' | 'file' | 'link'
  max_score: number
  opens_at: string | null
  closes_at: string | null
  my_status: LearnerSubmissionStatus | null
}

export interface LearnerAttemptStatus {
  submitted: boolean
  score: number
  max_score: number
  is_passed: boolean
  submitted_at: string | null
}

export interface LearnerSubmissionStatus {
  submitted: boolean
  status: string
  score: number | null
  feedback: string | null
  submitted_at: string | null
  graded_at: string | null
}

export interface LearnerResource {
  id: number
  title: string
  type: string
  url: string | null
  file_path: string | null
  description: string | null
}

export interface LearnerCourse {
  id: number
  title: string
  slug: string
  description: string | null
  category: string | null
  level: string
  delivery_mode: string
  is_self_paced: boolean
  sections: Array<
    Omit<CourseSection, 'lessons' | 'course_id'> & { lessons: LearnerLesson[] }
  >
  learning_outcomes: Array<{ id: number; description: string }>
  resources: LearnerResource[]
  quizzes: LearnerQuiz[]
  exercises: LearnerExercise[]
  exams: LearnerExam[]
  assignments: LearnerAssignment[]
}