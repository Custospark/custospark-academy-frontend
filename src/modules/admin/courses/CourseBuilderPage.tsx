import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Award,
  BookOpen,
  ClipboardList,
  FileQuestion,
  NotebookPen,
  Target,
} from 'lucide-react'
import { useCourseContent } from '../../../shared/api/courses/CourseContentQueries'
import { AcademyLoader } from '../../../shared/components/loading/AcademyLoader'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { cn } from '../../../shared/utils/cn'
import { ROUTES } from '../../../app/routes/constants/shared.paths'
import { OutcomesTab } from './tabs/OutcomesTab'
import { CurriculumTab } from './tabs/CurriculumTab'
import { ResourcesTab } from './tabs/ResourcesTab'
import { AssessmentsTab } from './tabs/AssessmentsTab'
import { AssignmentsTab } from './tabs/AssignmentsTab'

const TABS = [
  { id: 'outcomes', label: 'Learning Outcomes', icon: Target },
  { id: 'curriculum', label: 'Curriculum', icon: NotebookPen },
  { id: 'resources', label: 'Resources', icon: BookOpen },
  { id: 'assessments', label: 'Assessments', icon: FileQuestion },
  { id: 'assignments', label: 'Assignments', icon: ClipboardList },
] as const

type TabId = (typeof TABS)[number]['id']

export default function CourseBuilderPage() {
  const { id } = useParams<{ id: string }>()
  const courseId = Number(id)
  const { data: course, isPending, isError } = useCourseContent(courseId)
  const [activeTab, setActiveTab] = useState<TabId>('outcomes')

  if (!Number.isFinite(courseId)) {
    return <CourseNotFound />
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link
          to={ROUTES.APP.ADMIN.COURSES}
          className="inline-flex items-center gap-1.5 font-medium text-text-secondary transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          All courses
        </Link>
        <span className="text-text-muted">/</span>
        <span className="truncate font-semibold text-white">{course?.title ?? 'Course'}</span>
      </div>

      {isPending && <AcademyLoader block />}

      {isError && (
        <div className="rounded-2xl border border-semantic-error/40 bg-semantic-error/10 p-8 text-center">
          <p className="text-sm text-semantic-error">Could not load this course.</p>
        </div>
      )}

      {course && (
        <>
          <PageHeader
            title={course.title}
            description={`${course.category ?? 'Uncategorized'} · ${course.level} · ${course.delivery_mode.replace('_', ' ')}`}
          />

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

          {activeTab === 'outcomes' && <OutcomesTab course={course} />}
          {activeTab === 'curriculum' && <CurriculumTab course={course} />}
          {activeTab === 'resources' && <ResourcesTab course={course} />}
          {activeTab === 'assessments' && <AssessmentsTab course={course} />}
          {activeTab === 'assignments' && <AssignmentsTab course={course} />}
        </>
      )}
    </div>
  )
}

function CourseNotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-semantic-error/40 bg-semantic-error/10 p-10 text-center">
      <Award className="mx-auto h-12 w-12 text-semantic-error" />
      <h2 className="mt-4 text-xl font-bold text-white">Course not found</h2>
      <Link to={ROUTES.APP.ADMIN.COURSES} className="mt-4 text-sm font-medium text-blue-300 hover:underline">
        <span className="inline-flex items-center gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </span>
      </Link>
    </div>
  )
}