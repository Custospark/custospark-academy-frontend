import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  Library,
  Pencil,
  Plus,
} from 'lucide-react'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { AcademyLoader } from '../../../shared/components/loading/AcademyLoader'
import { SearchInput } from '../../../shared/components/inputs/SearchInput'
import { Button } from '../../../shared/components/buttons/Button'
import { Input } from '../../../shared/components/inputs/Input'
import { Modal } from '../../../shared/components/modals/Modal'
import { AdminScheduleManager } from '../../../shared/components/schedules/AdminScheduleManager'
import { useAdminCourses } from '../../../shared/api/admin/AdminQueries'
import { axiosInstance } from '../../../app/api/axiosConfig'
import { ENDPOINTS } from '../../../shared/api/endpoints'
import { apiErrorMessage } from '../../../shared/utils/apiError'
import { ROUTES } from '../../../app/routes/constants/shared.paths'
import type { Course } from '../../../shared/types'

interface CourseForm {
  title: string
  description: string
  course_code: string
  category: string
  level: string
  language: string
  duration_hours: string
  prerequisites: string
  target_audience: string
  tags: string
  status: string
  application_fee: string
  tuition_fee: string
  certificate_fee: string
}

const EMPTY_FORM: CourseForm = {
  title: '',
  description: '',
  course_code: '',
  category: '',
  level: 'beginner',
  language: 'en',
  duration_hours: '',
  prerequisites: '',
  target_audience: '',
  tags: '',
  status: 'draft',
  application_fee: '',
  tuition_fee: '',
  certificate_fee: '',
}

export default function AdminCoursesPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editCourse, setEditCourse] = useState<Course | null>(null)
  const [scheduleCourse, setScheduleCourse] = useState<Course | null>(null)
  const [form, setForm] = useState<CourseForm>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

  const { data: courses, isPending, isError, refetch } = useAdminCourses()

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const filtered = courses?.filter((c) =>
    search ? `${c.title} ${c.category ?? ''}`.toLowerCase().includes(search.toLowerCase()) : true,
  )

  const loading = isPending || (!courses && !isError)

  function openCreate() {
    setForm(EMPTY_FORM)
    setFormError(null)
    setShowCreate(true)
  }

  function openEdit(course: Course) {
    const feeValue = (type: string) =>
      String(course.fees.find((f) => f.fee_type === type)?.amount ?? '')
    setForm({
      title: course.title,
      description: course.description ?? '',
      course_code: course.course_code ?? '',
      category: course.category ?? '',
      level: course.level ?? 'beginner',
      language: course.language ?? 'en',
      duration_hours: course.duration_hours ? String(course.duration_hours) : '',
      prerequisites: course.prerequisites ?? '',
      target_audience: course.target_audience ?? '',
      tags: (course.tags ?? []).join(', '),
      status: course.status,
      application_fee: feeValue('application'),
      tuition_fee: feeValue('tuition'),
      certificate_fee: feeValue('certificate'),
    })
    setFormError(null)
    setEditCourse(course)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        category: form.category.trim() || null,
        course_code: form.course_code.trim() || null,
        level: form.level,
        language: form.language,
        duration_hours: form.duration_hours ? Number(form.duration_hours) : null,
        prerequisites: form.prerequisites.trim() || null,
        target_audience: form.target_audience.trim() || null,
        tags: form.tags
          ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : null,
        status: form.status,
        application_fee: form.application_fee ? Number(form.application_fee) : 0,
        tuition_fee: form.tuition_fee ? Number(form.tuition_fee) : 0,
        certificate_fee: form.certificate_fee ? Number(form.certificate_fee) : 0,
      }

      if (editCourse) {
        await axiosInstance.put<{ data: Course }>(
          ENDPOINTS.ADMIN.COURSES.UPDATE(editCourse.id),
          payload,
        )
      } else {
        const { data } = await axiosInstance.post<{ data: Course }>(
          ENDPOINTS.ADMIN.COURSES.STORE,
          payload,
        )
        refetch()
        setShowCreate(false)
        navigate(ROUTES.APP.ADMIN.COURSE(data.data.id))
        setSaving(false)
        return
      }

      refetch()
      setEditCourse(null)
    } catch (err) {
      setFormError(apiErrorMessage(err, 'Could not save course.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Course Management"
        description="Create and edit courses, their content, and assessments."
        actions={
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <div className="w-full sm:w-72">
              <SearchInput
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onClear={() => {
                  setSearchInput('')
                  setSearch('')
                }}
                placeholder="Search courses..."
              />
            </div>
            <Button onClick={openCreate} className="shrink-0">
              <Plus className="h-4 w-4" />
              New course
            </Button>
          </div>
        }
      />

      {loading && <AcademyLoader block />}

      {isError && (
        <div className="rounded-2xl border border-semantic-error/40 bg-semantic-error/10 p-8 text-center">
          <p className="text-sm text-semantic-error">Could not load courses.</p>
        </div>
      )}

      {!loading && !isError && filtered && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface-card p-12 text-center">
          <Library className="mx-auto h-12 w-12 text-blue-400" />
          <h3 className="mt-4 text-lg font-bold text-white">
            {search ? 'No courses match your search' : 'No courses yet'}
          </h3>
          <p className="mt-2 text-sm text-text-secondary">
            {search ? 'Try a different term.' : 'Create your first course to start building content.'}
          </p>
        </div>
      )}

      {!loading && !isError && filtered && filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <div
              key={course.id}
              className="group flex flex-col rounded-2xl border border-border-subtle bg-surface-card p-6 transition-all hover:border-border-strong hover:bg-surface-card-hover"
            >
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    course.status === 'published'
                      ? 'bg-semantic-success/15 text-semantic-success'
                      : 'bg-academy-amber/15 text-academy-amber'
                  }`}
                >
                  {course.status}
                </span>
                <BookOpen className="h-4 w-4 text-blue-400" />
              </div>
              <h3 className="font-display text-lg font-bold text-white">{course.title}</h3>
              {course.course_code && (
                <span className="mt-1 inline-block w-fit rounded bg-surface-input px-1.5 py-0.5 font-mono text-xs text-blue-300">
                  {course.course_code}
                </span>
              )}
              <p className="mt-2 line-clamp-2 flex-1 text-sm text-text-secondary">
                {course.description}
              </p>
              {course.enrollment_summary && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-border-subtle bg-surface-section px-2.5 py-2 text-center">
                    <div className="font-display text-lg font-bold text-white">
                      {course.enrollment_summary.enrolled}
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-text-muted">Enrolled</div>
                  </div>
                  <div className="rounded-lg border border-border-subtle bg-surface-section px-2.5 py-2 text-center">
                    <div className="font-display text-lg font-bold text-academy-teal">
                      {course.enrollment_summary.tuition_paid}
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-text-muted">Tuition paid</div>
                  </div>
                  <div className="rounded-lg border border-border-subtle bg-surface-section px-2.5 py-2 text-center">
                    <div className="font-display text-lg font-bold text-blue-400">
                      {course.enrollment_summary.certified}
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-text-muted">Certified</div>
                  </div>
                </div>
              )}
              <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-4">
                <span className="text-xs text-text-muted">{course.category ?? 'Uncategorized'}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setScheduleCourse(course)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border-default px-2.5 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:border-border-strong hover:text-white"
                  >
                    <CalendarClock className="h-3 w-3" />
                    Schedules
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(course)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border-default px-2.5 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:border-border-strong hover:text-white"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </button>
                  <Link
                    to={ROUTES.APP.ADMIN.COURSE(course.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border-default px-2.5 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:border-border-strong hover:text-white"
                  >
                    Manage
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / edit modal */}
      <Modal
        open={showCreate || editCourse !== null}
        onClose={() => {
          setShowCreate(false)
          setEditCourse(null)
        }}
        title={editCourse ? 'Edit course' : 'Create course'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <p className="rounded-lg border border-semantic-error/40 bg-semantic-error/10 px-4 py-3 text-sm text-semantic-error">
              {formError}
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Course title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
                placeholder="e.g. Data Science Bootcamp"
              />
            </div>
            <Input
              label="Course code (optional)"
              value={form.course_code}
              onChange={(e) => setForm((f) => ({ ...f, course_code: e.target.value }))}
              placeholder="e.g. DS-101"
            />
            <Input
              label="Category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="e.g. Software & Coding"
            />
            <div className="sm:col-span-2">
              <Input
                label="Short description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="What is this course about?"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">Level</label>
              <select
                value={form.level}
                onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
                className="w-full rounded-lg border border-border-default bg-surface-input px-3 py-2.5 text-sm text-text-primary focus:border-border-focus focus:outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">Language</label>
              <select
                value={form.language}
                onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
                className="w-full rounded-lg border border-border-default bg-surface-input px-3 py-2.5 text-sm text-text-primary focus:border-border-focus focus:outline-none"
              >
                <option value="en">English</option>
                <option value="sw">Swahili</option>
                <option value="fr">French</option>
                <option value="ar">Arabic</option>
              </select>
            </div>
            <Input
              label="Duration (hours)"
              type="number"
              min={0}
              value={form.duration_hours}
              onChange={(e) => setForm((f) => ({ ...f, duration_hours: e.target.value }))}
              placeholder="40"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Prerequisites"
              value={form.prerequisites}
              onChange={(e) => setForm((f) => ({ ...f, prerequisites: e.target.value }))}
              placeholder="e.g. Basic Python or equivalent"
            />
            <Input
              label="Target audience"
              value={form.target_audience}
              onChange={(e) => setForm((f) => ({ ...f, target_audience: e.target.value }))}
              placeholder="e.g. Aspiring data scientists"
            />
          </div>

          <Input
            label="Tags (comma separated)"
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            placeholder="data, python, analytics"
          />

          <div className="rounded-xl border border-border-subtle bg-surface-section p-4">
            <label className="mb-2 block text-sm font-medium text-text-secondary">
              Course fees <span className="text-xs text-text-muted">(0 or blank = sponsored/waived)</span>
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                label="Application fee"
                type="number"
                min={0}
                value={form.application_fee}
                onChange={(e) => setForm((f) => ({ ...f, application_fee: e.target.value }))}
                placeholder="0"
              />
              <Input
                label="Tuition fee"
                type="number"
                min={0}
                value={form.tuition_fee}
                onChange={(e) => setForm((f) => ({ ...f, tuition_fee: e.target.value }))}
                placeholder="0"
              />
              <Input
                label="Certificate fee"
                type="number"
                min={0}
                value={form.certificate_fee}
                onChange={(e) => setForm((f) => ({ ...f, certificate_fee: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full rounded-lg border border-border-default bg-surface-input px-3 py-2.5 text-sm text-text-primary focus:border-border-focus focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreate(false)
                setEditCourse(null)
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editCourse ? 'Save changes' : 'Create course'}
            </Button>
          </div>
        </form>
      </Modal>

      <AdminScheduleManager
        courseId={scheduleCourse?.id ?? null}
        courseTitle={scheduleCourse?.title ?? ''}
        onClose={() => setScheduleCourse(null)}
      />
    </div>
  )
}