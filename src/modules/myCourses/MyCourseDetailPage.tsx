import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FileQuestion,
  NotebookPen,
  Target,
} from 'lucide-react'
import { useLearnerCourse, useLearnerProgress } from '../../shared/api/learner/LearnerCourseQueries'
import { AcademyLoader } from '../../shared/components/loading/AcademyLoader'
import { cn } from '../../shared/utils/cn'
import { ROUTES } from '../../app/routes/constants/shared.paths'
import { CurriculumPlayer } from './CurriculumPlayer'
import { ResourcesSection } from './ResourcesSection'
import { AssessmentsSection } from './AssessmentsSection'
import { AssignmentsSection } from './AssignmentsSection'

const TABS = [
  { id: 'curriculum', label: 'Curriculum', icon: NotebookPen },
  { id: 'resources', label: 'Resources', icon: BookOpen },
  { id: 'assessments', label: 'Assessments', icon: FileQuestion },
  { id: 'assignments', label: 'Assignments', icon: ClipboardList },
] as const

type TabId = (typeof TABS)[number]['id']

export default function MyCourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const courseId = Number(id)
  const { data: course, isPending, isError } = useLearnerCourse(courseId)
  const { data: progress } = useLearnerProgress(courseId)
  const [activeTab, setActiveTab] = useState<TabId>('curriculum')

  if (!Number.isFinite(courseId)) {
    return (
      <div className="rounded-2xl border border-semantic-error/40 bg-semantic-error/10 p-10 text-center">
        <p className="text-sm text-semantic-error">Course not found.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link
          to={ROUTES.APP.MY_COURSES}
          className="inline-flex items-center gap-1.5 font-medium text-text-secondary transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          My Courses
        </Link>
        <span className="text-text-muted">/</span>
        <span className="truncate font-semibold text-white">{course?.title ?? 'Course'}</span>
      </div>

      {isPending && <AcademyLoader block />}

      {isError && (
        <div className="rounded-2xl border border-semantic-error/40 bg-semantic-error/10 p-8 text-center">
          <p className="text-sm text-semantic-error">
            Could not load this course. You must be enrolled to view it.
          </p>
          <Link
            to={ROUTES.APP.CATALOG}
            className="mt-4 inline-block text-sm font-medium text-blue-300 hover:underline"
          >
            Browse courses
          </Link>
        </div>
      )}

      {course && (
        <>
          {/* Header + progress */}
          <div className="mb-6 rounded-2xl border border-border-subtle bg-surface-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl font-bold text-white">{course.title}</h1>
                <p className="mt-1 text-sm text-text-secondary">{course.description}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-text-muted">
                  <span className="capitalize">{course.level}</span>
                  <span className="capitalize">{course.delivery_mode.replace('_', ' ')}</span>
                  <span>{course.category}</span>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="font-display text-3xl font-bold text-blue-400">
                  {progress?.percent ?? 0}%
                </div>
                <div className="mt-1 text-xs text-text-muted">
                  {progress?.completed_lessons ?? 0}/{progress?.total_lessons ?? 0} lessons completed
                </div>
                <div className="mt-2 h-2 w-40 overflow-hidden rounded-full bg-surface-input">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${progress?.percent ?? 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Learning outcomes */}
          {course.learning_outcomes.length > 0 && (
            <div className="mb-6 rounded-2xl border border-border-subtle bg-surface-card p-5">
              <h3 className="mb-3 flex items-center gap-2 font-display text-base font-bold text-white">
                <Target className="h-4 w-4 text-blue-400" />
                What you will learn
              </h3>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {course.learning_outcomes.map((outcome) => (
                  <li key={outcome.id} className="flex items-start gap-2 text-sm text-text-secondary">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-academy-teal" />
                    {outcome.description}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6 flex flex-wrap gap-2 border-b border-border-subtle pb-3">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors',
                  activeTab === tab.id
                    ? 'bg-blue-500/15 text-blue-300'
                    : 'text-text-secondary hover:bg-surface-card hover:text-white',
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'curriculum' && <CurriculumPlayer course={course} courseId={courseId} />}
          {activeTab === 'resources' && <ResourcesSection course={course} />}
          {activeTab === 'assessments' && <AssessmentsSection course={course} courseId={courseId} />}
          {activeTab === 'assignments' && <AssignmentsSection course={course} courseId={courseId} />}
        </>
      )}

      {/* Bottom spacer for Award icon */}
      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-text-muted">
        <Award className="h-4 w-4 text-academy-orange" />
        Complete the course to earn your certificate
      </div>
    </div>
  )
}