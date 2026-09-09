import { useEffect, useState, type FormEvent } from 'react'
import { ChevronDown, FolderPlus, NotebookPen, Pencil, Plus, Trash2, Video, FileText } from 'lucide-react'
import type { CourseFull, CourseSection, LessonItem } from '../../../../shared/types/courseContent'
import { Button } from '../../../../shared/components/buttons/Button'
import { Input } from '../../../../shared/components/inputs/Input'
import { Modal } from '../../../../shared/components/modals/Modal'
import {
  useCreateSection,
  useDeleteSection,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
} from '../../../../shared/api/courses/CourseContentQueries'

const CONTENT_TYPE_ICON = { video: Video, text: FileText, article: FileText, embed: FileText }

export function CurriculumTab({ course }: { course: CourseFull }) {
  const [openSection, setOpenSection] = useState<number | null>(course.sections[0]?.id ?? null)
  const [lessonModal, setLessonModal] = useState<{
    sectionId: number | null
    sectionTitle: string
    lesson?: LessonItem
  } | null>(null)
  const [sectionModalOpen, setSectionModalOpen] = useState(false)

  const deleteSection = useDeleteSection(course.slug)

  return (
    <div className="max-w-3xl">
      <p className="mb-4 text-sm text-text-secondary">
        Organise the course into sections, each containing lessons (text, video, article or embed).
      </p>

      {/* Add section */}
      <div className="mb-6">
        <Button onClick={() => setSectionModalOpen(true)} className="shrink-0">
          <FolderPlus className="h-4 w-4" />
          Add section
        </Button>
      </div>

      {course.sections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface-card p-10 text-center">
          <NotebookPen className="mx-auto h-10 w-10 text-blue-400" />
          <p className="mt-3 text-sm text-text-secondary">
            No sections yet. Add a section to start building the curriculum.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {course.sections.map((section) => (
            <SectionBlock
              key={section.id}
              section={section}
              courseSlug={course.slug}
              open={openSection === section.id}
              onToggle={() => setOpenSection(openSection === section.id ? null : section.id)}
              onAddLesson={() => setLessonModal({ sectionId: section.id, sectionTitle: section.title })}
              onEditLesson={(lesson) =>
                setLessonModal({ sectionId: section.id, sectionTitle: section.title, lesson })
              }
              onDelete={() => deleteSection.mutate(section.id)}
            />
          ))}
        </div>
      )}

      <AddLessonModal
        course={course}
        modal={lessonModal}
        onClose={() => setLessonModal(null)}
      />

      <AddSectionModal
        courseId={course.slug}
        open={sectionModalOpen}
        onClose={() => setSectionModalOpen(false)}
        onCreated={(sectionId) => {
          setSectionModalOpen(false)
          setOpenSection(sectionId)
        }}
      />
    </div>
  )
}

function AddSectionModal({
  courseId,
  open,
  onClose,
  onCreated,
}: {
  courseId: string
  open: boolean
  onClose: () => void
  onCreated: (sectionId: number) => void
}) {
  const createSection = useCreateSection(courseId)
  const [sectionTitle, setSectionTitle] = useState('')
  const [error, setError] = useState<string | null>(null)

  function addSection(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!sectionTitle.trim() || createSection.isPending) return
    createSection.mutate(
      { title: sectionTitle.trim() },
      {
        onSuccess: (section) => {
          setSectionTitle('')
          onCreated(section.id)
        },
        onError: (err) => setError(err.message || 'Could not create section.'),
      },
    )
  }

  return (
    <Modal open={open} onClose={onClose} title="Add section" size="sm">
      <form onSubmit={addSection} className="space-y-4">
        {error && (
          <p className="rounded-lg border border-semantic-error/40 bg-semantic-error/10 px-4 py-3 text-sm text-semantic-error">
            {error}
          </p>
        )}
        <Input
          label="Section title"
          value={sectionTitle}
          onChange={(e) => setSectionTitle(e.target.value)}
          required
          autoFocus
          placeholder="e.g. Module 1 - Foundations"
        />
        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="outline" onClick={onClose} disabled={createSection.isPending}>
            Cancel
          </Button>
          <Button type="submit" loading={createSection.isPending}>
            <FolderPlus className="h-4 w-4" />
            Add section
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function SectionBlock({
  section,
  courseSlug,
  open,
  onToggle,
  onAddLesson,
  onEditLesson,
  onDelete,
}: {
  section: CourseSection
  courseSlug: string
  open: boolean
  onToggle: () => void
  onAddLesson: () => void
  onEditLesson: (lesson: LessonItem) => void
  onDelete: () => void
}) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-card">
      <div className="flex items-center gap-3 px-4 py-3">
        <button type="button" onClick={onToggle} className="flex flex-1 items-center gap-2 text-left">
          <ChevronDown className={`h-4 w-4 text-text-muted transition-transform ${open ? '' : '-rotate-90'}`} />
          <span className="font-semibold text-white">{section.title}</span>
          <span className="text-xs text-text-muted">{section.lessons.length} lessons</span>
        </button>
        <button
          type="button"
          onClick={onAddLesson}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border-default px-2.5 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:border-border-strong hover:text-white"
        >
          <Plus className="h-3.5 w-3.5" />
          Lesson
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-card-hover hover:text-semantic-error"
          aria-label="Delete section"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {open && (
        <div className="space-y-1.5 border-t border-border-subtle px-4 py-3">
          {section.lessons.length === 0 ? (
            <p className="py-2 text-sm text-text-muted">No lessons in this section yet.</p>
          ) : (
            section.lessons.map((lesson) => (
            <LessonRow
                key={lesson.id}
                lesson={lesson}
                courseId={courseSlug}
                onEdit={() => onEditLesson(lesson)}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

function LessonRow({ lesson, courseId, onEdit }: { lesson: LessonItem; courseId: string; onEdit: () => void }) {
  const deleteLesson = useDeleteLesson(courseId)
  const Icon = CONTENT_TYPE_ICON[lesson.content_type] ?? FileText

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-section px-3 py-2.5">
      <Icon className="h-4 w-4 shrink-0 text-blue-400" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-white">{lesson.title}</div>
        <div className="text-xs text-text-muted">
          {lesson.content_type}
          {lesson.duration_minutes ? ` · ${lesson.duration_minutes} min` : ''}
          {lesson.is_free_preview ? ' · preview' : ''}
        </div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-card-hover hover:text-white"
        aria-label="Edit lesson"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => deleteLesson.mutate(lesson.id)}
        className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-card-hover hover:text-semantic-error"
        aria-label="Delete lesson"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

function AddLessonModal({
  course,
  modal,
  onClose,
}: {
  course: CourseFull
  modal: { sectionId: number | null; sectionTitle: string; lesson?: LessonItem } | null
  onClose: () => void
}) {
  const createLesson = useCreateLesson(course.slug)
  const updateLesson = useUpdateLesson(course.slug)
  const editing = modal?.lesson ?? null
  const [form, setForm] = useState({
    title: '',
    content_type: 'text' as LessonItem['content_type'],
    content: '',
    video_url: '',
    duration_minutes: '',
    is_free_preview: false,
  })
  const [lessonError, setLessonError] = useState<string | null>(null)

  // Prefill when editing; reset when opening a blank form.
  useEffect(() => {
    if (modal?.lesson) {
      const lesson = modal.lesson
      setForm({
        title: lesson.title,
        content_type: lesson.content_type,
        content: lesson.content ?? '',
        video_url: lesson.video_url ?? '',
        duration_minutes: lesson.duration_minutes ? String(lesson.duration_minutes) : '',
        is_free_preview: lesson.is_free_preview,
      })
    } else if (modal) {
      setForm({
        title: '',
        content_type: 'text',
        content: '',
        video_url: '',
        duration_minutes: '',
        is_free_preview: false,
      })
    }
    setLessonError(null)
  }, [modal])

  const busy = createLesson.isPending || updateLesson.isPending

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLessonError(null)
    if (!form.title.trim() || !modal || busy) return
    const payload = {
      section_id: modal.sectionId,
      title: form.title.trim(),
      content_type: form.content_type,
      content: form.content || null,
      video_url: form.video_url || null,
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
      is_free_preview: form.is_free_preview,
    }
    if (editing) {
      updateLesson.mutate(
        { ...payload, id: editing.id },
        {
          onSuccess: onClose,
          onError: (err) => setLessonError(err.message || 'Could not update lesson.'),
        },
      )
      return
    }
    createLesson.mutate(payload, {
      onSuccess: onClose,
      onError: (err) => setLessonError(err.message || 'Could not create lesson.'),
    })
  }

  return (
    <Modal
      open={modal !== null}
      onClose={onClose}
      title={editing ? `Edit lesson` : `Add lesson${modal ? ` to ${modal.sectionTitle}` : ''}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {lessonError && (
          <p className="rounded-lg border border-semantic-error/40 bg-semantic-error/10 px-4 py-3 text-sm text-semantic-error">
            {lessonError}
          </p>
        )}
        <Input
          label="Lesson title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
          placeholder="e.g. Introduction to Variables"
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">Content type</label>
          <div className="flex flex-wrap gap-2">
              {(['text', 'video', 'article', 'embed'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      content_type: type,
                      // Stale values from another type must never leak into the payload.
                      content: type === 'text' || type === 'article' ? f.content : '',
                      video_url: type === 'video' || type === 'embed' ? f.video_url : '',
                    }))
                  }
                className={
                  form.content_type === type
                    ? 'rounded-lg bg-blue-500/15 px-3 py-1.5 text-sm font-semibold text-blue-300'
                    : 'rounded-lg border border-border-default px-3 py-1.5 text-sm font-medium text-text-secondary hover:border-border-strong'
                }
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {form.content_type === 'video' && (
          <Input
            label="Video URL"
            value={form.video_url}
            onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))}
            placeholder="https://youtube.com/watch?v=..."
          />
        )}

        {form.content_type === 'embed' && (
          <Input
            label="Embed URL or code"
            value={form.video_url}
            onChange={(e) => setForm((f) => ({ ...f, video_url: e.target.value }))}
            placeholder="https://... or <iframe ...></iframe>"
          />
        )}

        {(form.content_type === 'text' || form.content_type === 'article') && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">Content</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={6}
              placeholder="Write the lesson content here..."
              className="w-full rounded-lg border border-border-default bg-surface-input px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus/30"
            />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Duration (minutes)"
            type="number"
            min={0}
            value={form.duration_minutes}
            onChange={(e) => setForm((f) => ({ ...f, duration_minutes: e.target.value }))}
            placeholder="30"
          />
          <label className="flex items-end gap-2 pb-2.5">
            <input
              type="checkbox"
              checked={form.is_free_preview}
              onChange={(e) => setForm((f) => ({ ...f, is_free_preview: e.target.checked }))}
              className="h-4 w-4 rounded border-border-default bg-surface-input text-electric-blue focus:ring-electric-blue"
            />
            <span className="text-sm text-text-secondary">Free preview</span>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            {editing ? 'Save changes' : 'Add lesson'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}