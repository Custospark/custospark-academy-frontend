import { useState, type FormEvent } from 'react'
import { ChevronDown, FolderPlus, NotebookPen, Plus, Trash2, Video, FileText } from 'lucide-react'
import type { CourseFull, CourseSection, LessonItem } from '../../../../shared/types/courseContent'
import { Button } from '../../../../shared/components/buttons/Button'
import { Input } from '../../../../shared/components/inputs/Input'
import { Modal } from '../../../../shared/components/modals/Modal'
import {
  useCreateSection,
  useDeleteSection,
  useCreateLesson,
  useDeleteLesson,
} from '../../../../shared/api/courses/CourseContentQueries'

const CONTENT_TYPE_ICON = { video: Video, text: FileText, article: FileText, embed: FileText }

export function CurriculumTab({ course }: { course: CourseFull }) {
  const [sectionTitle, setSectionTitle] = useState('')
  const [openSection, setOpenSection] = useState<number | null>(course.sections[0]?.id ?? null)
  const [lessonModal, setLessonModal] = useState<{ sectionId: number | null; sectionTitle: string } | null>(null)

  const createSection = useCreateSection(course.id)
  const deleteSection = useDeleteSection(course.id)

  function addSection(e: FormEvent) {
    e.preventDefault()
    if (!sectionTitle.trim() || createSection.isPending) return
    createSection.mutate(
      { title: sectionTitle.trim() },
      {
        onSuccess: () => setSectionTitle(''),
      },
    )
  }

  return (
    <div className="max-w-3xl">
      <p className="mb-4 text-sm text-text-secondary">
        Organise the course into sections, each containing lessons (text, video, article or embed).
      </p>

      {/* Add section */}
      <form onSubmit={addSection} className="mb-6 flex items-start gap-3">
        <Input
          value={sectionTitle}
          onChange={(e) => setSectionTitle(e.target.value)}
          placeholder="New section title, e.g. Module 1 - Foundations"
          className="flex-1"
        />
        <Button type="submit" loading={createSection.isPending} className="shrink-0">
          <FolderPlus className="h-4 w-4" />
          Add section
        </Button>
      </form>

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
              open={openSection === section.id}
              onToggle={() => setOpenSection(openSection === section.id ? null : section.id)}
              onAddLesson={() => setLessonModal({ sectionId: section.id, sectionTitle: section.title })}
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
    </div>
  )
}

function SectionBlock({
  section,
  open,
  onToggle,
  onAddLesson,
  onDelete,
}: {
  section: CourseSection
  open: boolean
  onToggle: () => void
  onAddLesson: () => void
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
            section.lessons.map((lesson) => <LessonRow key={lesson.id} lesson={lesson} courseId={section.course_id} />)
          )}
        </div>
      )}
    </div>
  )
}

function LessonRow({ lesson, courseId }: { lesson: LessonItem; courseId: number }) {
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
  modal: { sectionId: number | null; sectionTitle: string } | null
  onClose: () => void
}) {
  const createLesson = useCreateLesson(course.id)
  const [form, setForm] = useState({
    title: '',
    content_type: 'text' as LessonItem['content_type'],
    content: '',
    video_url: '',
    duration_minutes: '',
    is_free_preview: false,
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !modal || createLesson.isPending) return
    createLesson.mutate(
      {
        section_id: modal.sectionId,
        title: form.title.trim(),
        content_type: form.content_type,
        content: form.content || null,
        video_url: form.video_url || null,
        duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
        is_free_preview: form.is_free_preview,
      },
      { onSuccess: onClose },
    )
  }

  return (
    <Modal
      open={modal !== null}
      onClose={onClose}
      title={`Add lesson${modal ? ` to ${modal.sectionTitle}` : ''}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
                onClick={() => setForm((f) => ({ ...f, content_type: type }))}
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
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={createLesson.isPending}>
            Add lesson
          </Button>
        </div>
      </form>
    </Modal>
  )
}