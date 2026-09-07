import { describe, expect, it } from 'vitest'
import { ENDPOINTS } from '../endpoints'

/**
 * Locks the course-content endpoint contracts the builder UI depends on.
 * If these change, the tabs (sections/lessons/outcomes/resources/
 * assessments/assignments) and the learner player break silently.
 */
describe('course content endpoints', () => {
  it('builds section, lesson, outcome and resource URLs', () => {
    expect(ENDPOINTS.ADMIN.CONTENT.FULL('data-science')).toBe('/admin/courses/data-science/content')
    expect(ENDPOINTS.ADMIN.CONTENT.SECTIONS.STORE('data-science')).toBe('/admin/courses/data-science/sections')
    expect(ENDPOINTS.ADMIN.CONTENT.SECTIONS.UPDATE('data-science', 3)).toBe('/admin/courses/data-science/sections/3')
    expect(ENDPOINTS.ADMIN.CONTENT.LESSONS.STORE('data-science')).toBe('/admin/courses/data-science/lessons')
    expect(ENDPOINTS.ADMIN.CONTENT.OUTCOMES.STORE('data-science')).toBe('/admin/courses/data-science/outcomes')
    expect(ENDPOINTS.ADMIN.CONTENT.RESOURCES.STORE('data-science')).toBe('/admin/courses/data-science/resources')
  })

  it('builds quiz, exercise, exam and assignment URLs', () => {
    expect(ENDPOINTS.ADMIN.CONTENT.QUIZZES.STORE('data-science')).toBe('/admin/courses/data-science/quizzes')
    expect(ENDPOINTS.ADMIN.CONTENT.EXERCISES.STORE('data-science')).toBe('/admin/courses/data-science/exercises')
    expect(ENDPOINTS.ADMIN.CONTENT.EXAMS.STORE('data-science')).toBe('/admin/courses/data-science/exams')
    expect(ENDPOINTS.ADMIN.CONTENT.ASSIGNMENTS.STORE('data-science')).toBe('/admin/courses/data-science/assignments')
    expect(ENDPOINTS.ADMIN.CONTENT.QUIZZES.DESTROY('data-science', 3)).toBe('/admin/courses/data-science/quizzes/3')
  })

  it('builds learner endpoints for the course player', () => {
    expect(ENDPOINTS.LEARNER.CONTENT('data-science')).toBe('/courses/data-science/content')
    expect(ENDPOINTS.LEARNER.PROGRESS('data-science')).toBe('/courses/data-science/progress')
    expect(ENDPOINTS.LEARNER.MARK_LESSON('data-science', 3)).toBe('/courses/data-science/lessons/3/progress')
    expect(ENDPOINTS.LEARNER.SUBMIT('data-science', 'assignment', 5)).toBe('/courses/data-science/submit/assignment/5')
    expect(ENDPOINTS.LEARNER.ATTEMPT('data-science', 'quiz', 2)).toBe('/courses/data-science/attempt/quiz/2')
  })

  it('builds course management and admin URLs', () => {
    expect(ENDPOINTS.ADMIN.COURSES.INDEX).toBe('/admin/courses')
    expect(ENDPOINTS.ADMIN.COURSES.UPDATE(9)).toBe('/admin/courses/9')
    expect(ENDPOINTS.ADMIN.INSTRUCTORS.INDEX).toBe('/admin/instructors')
    expect(ENDPOINTS.ADMIN.STATS).toBe('/admin/stats')
    expect(ENDPOINTS.ADMIN.USERS.UPDATE(4)).toBe('/admin/users/4')
  })

  it('builds enrollment action URLs', () => {
    expect(ENDPOINTS.ENROLLMENTS.PAY(3, 'application')).toBe('/enrollments/3/pay/application')
    expect(ENDPOINTS.ENROLLMENTS.COMPLETE(3)).toBe('/enrollments/3/complete')
    expect(ENDPOINTS.ENROLLMENTS.CANCEL(3)).toBe('/enrollments/3/cancel')
  })

  it('builds payment history, verify and receipt URLs', () => {
    expect(ENDPOINTS.PAYMENTS.INDEX).toBe('/payments')
    expect(ENDPOINTS.PAYMENTS.VERIFY(5)).toBe('/payments/5')
    expect(ENDPOINTS.PAYMENTS.RECEIPT(5)).toBe('/payments/5/receipt')
  })

  it('builds certificate pdf and download URLs', () => {
    expect(ENDPOINTS.CERTIFICATES.MINE).toBe('/certificates/mine')
    expect(ENDPOINTS.CERTIFICATES.ISSUE(3)).toBe('/enrollments/3/certificate')
    expect(ENDPOINTS.CERTIFICATES.SHOW(2)).toBe('/certificates/2')
    expect(ENDPOINTS.CERTIFICATES.PDF(2)).toBe('/certificates/2/pdf')
    expect(ENDPOINTS.CERTIFICATES.DOWNLOAD(2)).toBe('/certificates/2/download')
  })

  it('builds schedule and certificate preview URLs', () => {
    expect(ENDPOINTS.SCHEDULES.MINE).toBe('/schedules/mine')
    expect(ENDPOINTS.SCHEDULES.STORE('data-science')).toBe('/admin/courses/data-science/schedules')
    expect(ENDPOINTS.SCHEDULES.UPDATE('data-science', 3)).toBe('/admin/courses/data-science/schedules/3')
    expect(ENDPOINTS.SCHEDULES.DESTROY('data-science', 3)).toBe('/admin/courses/data-science/schedules/3')
    expect(ENDPOINTS.CERTIFICATES.PREVIEW('data-science')).toBe('/courses/data-science/certificate-preview')
  })
})