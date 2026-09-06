import { useState } from 'react'
import { CalendarClock, MapPin, Pencil, Plus, Trash2, Video } from 'lucide-react'
import { Modal } from '../modals/Modal'
import { Button } from '../buttons/Button'
import { Input } from '../inputs/Input'
import { AcademyLoader } from '../loading/AcademyLoader'
import {
  useCourseSchedules,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
} from '../../api/misc/MiscQueries'
import { apiErrorMessage } from '../../utils/apiError'
import type { CourseSchedule } from '../../types'

interface ScheduleForm {
  title: string
  starts_at: string
  ends_at: string
  location: string
  is_online: boolean
}

const EMPTY_FORM: ScheduleForm = {
  title: '',
  starts_at: '',
  ends_at: '',
  location: '',
  is_online: false,
}

function toDateTimeLocal(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`
}

function formatWhen(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  return date.toLocaleString('en-UG', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

interface AdminScheduleManagerProps {
  courseId: number | null
  courseTitle: string
  onClose: () => void
}

export function AdminScheduleManager({
  courseId,
  courseTitle,
  onClose,
}: AdminScheduleManagerProps) {
  const open = courseId !== null
  const { data: schedules, isPending, isError } = useCourseSchedules(courseId ?? 0)
  const createMutation = useCreateSchedule()
  const updateMutation = useUpdateSchedule()
  const deleteMutation = useDeleteSchedule()

  const [form, setForm] = useState<ScheduleForm>(EMPTY_FORM)
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditId(null)
    setError(null)
  }

  function startEdit(schedule: CourseSchedule) {
    setEditId(schedule.id)
    setForm({
      title: schedule.title ?? '',
      starts_at: toDateTimeLocal(schedule.starts_at),
      ends_at: toDateTimeLocal(schedule.ends_at),
      location: schedule.location ?? '',
      is_online: schedule.is_online,
    })
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (courseId === null) return
    setError(null)
    setSaving(true)
    try {
      const startsAt = form.starts_at ? new Date(form.starts_at).toISOString() : ''
      const endsAt = form.ends_at ? new Date(form.ends_at).toISOString() : ''
      const payload = {
        title: form.title.trim() || undefined,
        starts_at: startsAt || undefined,
        ends_at: endsAt || undefined,
        location: form.location.trim() || null,
        is_online: form.is_online,
      }
      if (editId !== null) {
        await updateMutation.mutateAsync({
          courseId,
          scheduleId: editId,
          payload,
        })
      } else {
        await createMutation.mutateAsync({ courseId, payload })
      }
      resetForm()
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save the schedule entry.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(scheduleId: number) {
    if (courseId === null) return
    setError(null)
    try {
      await deleteMutation.mutateAsync({ courseId, scheduleId })
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not remove the schedule entry.'))
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        onClose()
        resetForm()
      }}
      title="Schedules"
      subtitle={`Live sessions and deadlines for ${courseTitle}.`}
      size="lg"
    >
      {isPending && <AcademyLoader block />}

      {isError && (
        <div className="rounded-2xl border border-semantic-error/40 bg-semantic-error/10 p-8 text-center">
          <p className="text-sm text-semantic-error">Could not load the course schedule.</p>
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-semantic-error/40 bg-semantic-error/10 px-4 py-3 text-sm text-semantic-error">
          {error}
        </p>
      )}

      {!isPending && !isError && (schedules?.length ?? 0) === 0 && (
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface-section p-8 text-center">
          <CalendarClock className="mx-auto h-10 w-10 text-blue-400" />
          <p className="mt-3 text-sm text-text-secondary">
            No schedule entries yet. Add the first live session below.
          </p>
        </div>
      )}

      {!isPending && !isError && (schedules?.length ?? 0) > 0 && (
        <div className="space-y-2.5">
          {schedules?.map((schedule) => (
            <div
              key={schedule.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-section px-4 py-3"
            >
              <div>
                <div className="flex items-center gap-2 font-medium text-white">
                  {schedule.title}
                  {schedule.is_online && (
                    <Video className="h-3.5 w-3.5 text-blue-400" aria-label="Online" />
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                  {schedule.starts_at && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {formatWhen(schedule.starts_at)}
                    </span>
                  )}
                  {schedule.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {schedule.location}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => startEdit(schedule)}
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  type="button"
                  loading={deleteMutation.isPending}
                  onClick={() => handleDelete(schedule.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 border-t border-border-subtle pt-5">
        <div className="mb-3 flex items-center gap-2">
          {editId !== null ? <Pencil className="h-4 w-4 text-blue-400" /> : <Plus className="h-4 w-4 text-blue-400" />}
          <h3 className="font-medium text-white">
            {editId !== null ? 'Edit schedule entry' : 'Add schedule entry'}
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Title (optional)"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Week 1 kickoff session"
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Delivery
            </label>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, is_online: !f.is_online }))}
              className={`flex w-full items-center justify-between rounded-lg border px-3.5 py-2.5 text-sm transition-colors ${
                form.is_online
                  ? 'border-border-focus bg-surface-card text-white'
                  : 'border-border-default bg-surface-input text-text-secondary'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {form.is_online ? <Video className="h-4 w-4 text-blue-400" /> : <MapPin className="h-4 w-4" />}
                {form.is_online ? 'Online session' : 'Physical session'}
              </span>
              <span
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  form.is_online ? 'bg-blue-600' : 'bg-surface-card-hover'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                    form.is_online ? 'left-[18px]' : 'left-0.5'
                  }`}
                />
              </span>
            </button>
          </div>
          <Input
            label="Starts at"
            type="datetime-local"
            value={form.starts_at}
            onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
            required
          />
          <Input
            label="Ends at"
            type="datetime-local"
            value={form.ends_at}
            onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value }))}
            required
          />
          <Input
            label="Location (optional)"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            placeholder={form.is_online ? 'e.g. Zoom / Google Meet link' : 'e.g. Room 4, Kampala campus'}
          />
        </div>

        <div className="mt-4 flex justify-end gap-3">
          {editId !== null && (
            <Button type="button" variant="ghost" onClick={resetForm}>
              Cancel edit
            </Button>
          )}
          <Button type="submit" loading={saving}>
            {editId !== null ? 'Save changes' : 'Add schedule entry'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}