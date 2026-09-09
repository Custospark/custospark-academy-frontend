import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Award,
  BookOpen,
  ClipboardList,
  Download,
  FileQuestion,
  Inbox,
  Mail,
  NotebookPen,
  Target,
  Users,
  CalendarCheck,
} from 'lucide-react'
import { useCourseContent } from '../../../shared/api/courses/CourseContentQueries'
import { useAnnounce, useExportLearners } from '../../../shared/api/misc/MiscQueries'
import { AcademyLoader } from '../../../shared/components/loading/AcademyLoader'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { Button } from '../../../shared/components/buttons/Button'
import { Input } from '../../../shared/components/inputs/Input'
import { Modal } from '../../../shared/components/modals/Modal'
import { cn } from '../../../shared/utils/cn'
import { useToast } from '../../../app/contexts/useToast'
import { apiErrorMessage } from '../../../shared/utils/apiError'
import { ROUTES } from '../../../app/routes/constants/shared.paths'
import { OutcomesTab } from './tabs/OutcomesTab'
import { CurriculumTab } from './tabs/CurriculumTab'
import { ResourcesTab } from './tabs/ResourcesTab'
import { AssessmentsTab } from './tabs/AssessmentsTab'
import { AssignmentsTab } from './tabs/AssignmentsTab'
import { LearnersTab } from './tabs/LearnersTab'
import { AttendanceTab } from './tabs/AttendanceTab'
import { SubmissionsTab } from './tabs/SubmissionsTab'

const TABS = [
  { id: 'outcomes', label: 'Learning Outcomes', icon: Target },
  { id: 'curriculum', label: 'Curriculum', icon: NotebookPen },
  { id: 'resources', label: 'Resources', icon: BookOpen },
  { id: 'assessments', label: 'Assessments', icon: FileQuestion },
  { id: 'assignments', label: 'Assignments', icon: ClipboardList },
  { id: 'learners', label: 'Learners', icon: Users },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { id: 'submissions', label: 'Submissions', icon: Inbox },
] as const

type TabId = (typeof TABS)[number]['id']

export default function CourseBuilderPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: course, isPending, isError } = useCourseContent(slug ?? '')
  const [activeTab, setActiveTab] = useState<TabId>('outcomes')
  const [announceOpen, setAnnounceOpen] = useState(false)
  const [rosterOpen, setRosterOpen] = useState(false)

  if (!slug) {
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
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setAnnounceOpen(true)}>
                  <Mail className="h-3.5 w-3.5" />
                  Email learners
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setRosterOpen(true)}
                >
                  <Download className="h-3.5 w-3.5" />
                  Roster
                </Button>
              </div>
            }
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
          {activeTab === 'learners' && <LearnersTab course={course} />}
          {activeTab === 'attendance' && <AttendanceTab course={course} />}
          {activeTab === 'submissions' && <SubmissionsTab course={course} />}

          {announceOpen && (
            <AnnounceDialog courseSlug={course.slug} onClose={() => setAnnounceOpen(false)} />
          )}

          {rosterOpen && (
            <RosterDialog courseSlug={course.slug} onClose={() => setRosterOpen(false)} />
          )}
        </>
      )}
    </div>
  )
}

const AUDIENCE_STATUSES = [
  { value: 'applied', label: 'Applied' },
  { value: 'application_fee_paid', label: 'Application fee paid' },
  { value: 'admitted', label: 'Admitted' },
  { value: 'tuition_paid', label: 'Tuition paid' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'certification', label: 'Certification' },
  { value: 'certified', label: 'Certified' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
]

/**
 * Course audience messaging: email the learners on THIS course, optionally
 * limited to enrollment statuses (announcements, meeting links, reminders).
 * Lives on the course builder so instructors (who own their courses) can use
 * it without enrollments-page access.
 */function AnnounceDialog({ courseSlug, onClose }: { courseSlug: string; onClose: () => void }) {
  const announce = useAnnounce(courseSlug)
  const [statuses, setStatuses] = useState<string[]>([])
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  function toggleStatus(value: string) {
    setStatuses((prev) => (prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]))
  }

  function handleSend() {
    if (!subject.trim() || !body.trim() || announce.isPending) return
    announce.mutate(
      { statuses, subject: subject.trim(), body: body.trim() },
      { onSuccess: onClose },
    )
  }

  return (
    <Modal open onClose={onClose} title="Email learners" size="md">
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          {statuses.length === 0
            ? 'The message goes to every learner on this course.'
            : `The message goes to learners with status: ${statuses.join(', ').replace(/_/g, ' ')}.`}
        </p>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">
            Limit to statuses (optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {AUDIENCE_STATUSES.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleStatus(option.value)}
                className={
                  statuses.includes(option.value)
                    ? 'rounded-lg bg-blue-500/15 px-3 py-1.5 text-sm font-semibold text-blue-300'
                    : 'rounded-lg border border-border-default px-3 py-1.5 text-sm font-medium text-text-secondary hover:border-border-strong'
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          placeholder="e.g. Live session link for Saturday"
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">Message</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            placeholder="Write the announcement, meeting link, deadline reminder..."
            className="w-full rounded-lg border border-border-default bg-surface-input px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus/30"
          />
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSend} loading={announce.isPending} disabled={!subject.trim() || !body.trim()}>
            <Mail className="h-4 w-4" />
            Send email
          </Button>
        </div>
      </div>
    </Modal>
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
/**
 * One roster modal: pick a status (or all learners) and the export format
 * (Excel or PDF), then download. Names, email, phone, status and dates.
 */
function RosterDialog({ courseSlug, onClose }: { courseSlug: string; onClose: () => void }) {
  const [status, setStatus] = useState('')
  const [format, setFormat] = useState<'xlsx' | 'pdf'>('xlsx')
  const [busy, setBusy] = useState(false)
  const { showToast } = useToast()
  const exportLearners = useExportLearners(courseSlug)

  async function handleDownload() {
    if (busy) return
    setBusy(true)
    try {
      await exportLearners(format, status || undefined)
      showToast('success', 'Roster downloaded.')
      onClose()
    } catch (err) {
      showToast('error', apiErrorMessage(err, 'Could not export the roster.'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open onClose={onClose} title="Download learner roster" size="sm">
      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-lg border border-border-default bg-surface-input px-3 py-2.5 text-sm text-text-primary focus:border-border-focus focus:outline-none"
          >
            <option value="">All learners</option>
            {AUDIENCE_STATUSES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">Format</label>
          <div className="flex gap-2">
            {(['xlsx', 'pdf'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={
                  format === f
                    ? 'rounded-lg bg-blue-500/15 px-4 py-2 text-sm font-semibold text-blue-300'
                    : 'rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-secondary hover:border-border-strong'
                }
              >
                {f === 'xlsx' ? 'Excel' : 'PDF'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => void handleDownload()} loading={busy}>
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
    </Modal>
  )
}
