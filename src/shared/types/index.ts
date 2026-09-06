export type UserRole = 'learner' | 'admin' | 'instructor'
export type UserStatus = 'active' | 'suspended'

export interface AuthUser {
  id: number
  name: string
  email: string
  phone: string | null
  role: UserRole
  status: UserStatus
  avatar_url: string | null
}

export interface AuthResponse {
  data: {
    token: string
    user: AuthUser
  }
}

export interface MeResponse {
  data: AuthUser
}

export interface ApiErrorPayload {
  message: string
  errors?: Record<string, string[]>
}

export interface CourseFee {
  fee_type: 'application' | 'tuition' | 'certificate'
  amount: number
  currency: string
  is_required: boolean
}

export type PaymentFeeType = 'application' | 'tuition' | 'certificate'
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded'

export interface PaymentItem {
  id: number
  enrollment_id: number
  course_title: string | null
  fee_type: PaymentFeeType
  amount: number
  currency: string
  status: PaymentStatus
  method: string | null
  reference: string | null
  invoice_number: string | null
  paid_at: string | null
  created_at: string | null
  receipt_url: string | null
}

export interface EnrollmentPaymentSummary {
  id: number
  fee_type: PaymentFeeType
  amount: number
  currency: string
  status: PaymentStatus
  reference: string | null
  paid_at: string | null
}

export interface CompletionCategory {
  key: string
  label: string
  grading: 'learner' | 'auto' | 'instructor'
  total: number
  completed: number
  percent: number
}

export interface PendingInstructorItem {
  type: string
  id: number
  title: string | null
  status: string
}

export interface CompletionManifest {
  total_required: number
  completed_required: number
  percent: number
  is_complete: boolean
  delivery_mode: string
  auto_completes: boolean
  categories: CompletionCategory[]
  pending_instructor: PendingInstructorItem[]
}

export interface CourseProgress {
  total_lessons: number
  completed_lessons: number
  percent: number
  completion: CompletionManifest
}

export interface CourseSchedule {
  id: number
  title: string
  starts_at: string | null
  ends_at: string | null
  location: string | null
  is_online: boolean
}

export interface Course {
  id: number
  title: string
  slug: string
  course_code: string | null
  description: string | null
  category: string | null
  cover_url: string | null
  status: 'draft' | 'published' | 'archived'
  start_date: string | null
  end_date: string | null
  is_self_paced: boolean
  delivery_mode: 'live' | 'self_paced' | 'hybrid'
  level: 'beginner' | 'intermediate' | 'advanced'
  language: string
  duration_hours: number | null
  target_audience: string | null
  prerequisites: string | null
  tags: string[] | null
  fees: CourseFee[]
  enrollment?: CourseEnrollment | null
  schedules?: CourseSchedule[] | null
}

export interface CourseEnrollment {
  id: number
  course_id: number
  status: string
  applied_at: string | null
  admitted_at: string | null
  completed_at: string | null
  certified_at: string | null
}

export interface Enrollment {
  id: number
  course_id: number
  course_title: string | null
  user_id: number
  user_name: string | null
  status: string
  applied_at: string | null
  admitted_at: string | null
  completed_at: string | null
  certified_at: string | null
  application_review_note: string | null
  fees: CourseFee[]
  payments: EnrollmentPaymentSummary[]
  certificate: unknown
}