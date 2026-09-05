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

export interface Course {
  id: number
  title: string
  slug: string
  description: string | null
  category: string | null
  cover_url: string | null
  status: 'draft' | 'published' | 'archived'
  start_date: string | null
  end_date: string | null
  is_self_paced: boolean
  fees: CourseFee[]
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
  payments: unknown[]
  certificate: unknown
}