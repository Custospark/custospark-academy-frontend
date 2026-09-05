import { describe, expect, it } from 'vitest'
import { ENDPOINTS } from '../endpoints'

/**
 * Locks the course-content endpoint contracts the builder UI depends on.
 * If these change, the tabs (sections/lessons/outcomes/resources/
 * assessments/assignments) and the learner player break silently.
 */
describe('course content endpoints', () => {
  it('builds section, lesson, outcome and resource URLs', () => {
    expect(ENDPOINTS.ADMIN.CONTENT.FULL(7)).toBe('/admin/courses/7/content')
    expect(ENDPOINTS.ADMIN.CONTENT.SECTIONS.STORE(7)).toBe('/admin/courses/7/sections')
    expect(ENDPOINTS.ADMIN.CONTENT.SECTIONS.UPDATE(7, 3)).toBe('/admin/courses/7/sections/3')
    expect(ENDPOINTS.ADMIN.CONTENT.LESSONS.STORE(7)).toBe('/admin/courses/7/lessons')
    expect(ENDPOINTS.ADMIN.CONTENT.OUTCOMES.STORE(7)).toBe('/admin/courses/7/outcomes')
    expect(ENDPOINTS.ADMIN.CONTENT.RESOURCES.STORE(7)).toBe('/admin/courses/7/resources')
  })

  it('builds quiz, exercise, exam and assignment URLs', () => {
    expect(ENDPOINTS.ADMIN.CONTENT.QUIZZES.STORE(7)).toBe('/admin/courses/7/quizzes')
    expect(ENDPOINTS.ADMIN.CONTENT.EXERCISES.STORE(7)).toBe('/admin/courses/7/exercises')
    expect(ENDPOINTS.ADMIN.CONTENT.EXAMS.STORE(7)).toBe('/admin/courses/7/exams')
    expect(ENDPOINTS.ADMIN.CONTENT.ASSIGNMENTS.STORE(7)).toBe('/admin/courses/7/assignments')
    expect(ENDPOINTS.ADMIN.CONTENT.QUIZZES.DESTROY(7, 3)).toBe('/admin/courses/7/quizzes/3')
  })

  it('builds learner endpoints for the course player', () => {
    expect(ENDPOINTS.LEARNER.CONTENT(7)).toBe('/courses/7/content')
    expect(ENDPOINTS.LEARNER.PROGRESS(7)).toBe('/courses/7/progress')
    expect(ENDPOINTS.LEARNER.MARK_LESSON(7, 3)).toBe('/courses/7/lessons/3/progress')
    expect(ENDPOINTS.LEARNER.SUBMIT(7, 'assignment', 5)).toBe('/courses/7/submit/assignment/5')
    expect(ENDPOINTS.LEARNER.ATTEMPT(7, 'quiz', 2)).toBe('/courses/7/attempt/quiz/2')
  })

  it('builds course management and admin URLs', () => {
    expect(ENDPOINTS.ADMIN.COURSES.INDEX).toBe('/admin/courses')
    expect(ENDPOINTS.ADMIN.COURSES.UPDATE(9)).toBe('/admin/courses/9')
    expect(ENDPOINTS.ADMIN.INSTRUCTORS.INDEX).toBe('/admin/instructors')
    expect(ENDPOINTS.ADMIN.STATS).toBe('/admin/stats')
    expect(ENDPOINTS.ADMIN.USERS.UPDATE(4)).toBe('/admin/users/4')
  })
})