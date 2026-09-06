import { useState, type FormEvent } from 'react'
import { BookOpen, Download, Link2, Plus, Trash2, Video, File, FileText } from 'lucide-react'
import type { CourseFull, ResourceItem } from '../../../../shared/types/courseContent'
import { Button } from '../../../../shared/components/buttons/Button'
import { Input } from '../../../../shared/components/inputs/Input'
import { Modal } from '../../../../shared/components/modals/Modal'
import { useCreateResource, useDeleteResource } from '../../../../shared/api/courses/CourseContentQueries'
import { storageUrl } from '../../../../shared/utils/storageUrl'

const TYPE_ICON = { book: BookOpen, link: Link2, video: Video, file: File, article: FileText }
const TYPE_LABELS: Record<string, string> = {
  book: 'Book',
  link: 'Link',
  video: 'Video',
  file: 'File',
  article: 'Article',
}

export function ResourcesTab({ course }: { course: CourseFull }) {
  const [showModal, setShowModal] = useState(false)
  const createResource = useCreateResource(course.id)
  const deleteResource = useDeleteResource(course.id)
  const [form, setForm] = useState({
    title: '',
    type: 'link' as ResourceItem['type'],
    url: '',
    description: '',
    file: null as File | null,
  })

  const isFileType = form.type === 'file' || form.type === 'book'

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || createResource.isPending) return
    if (isFileType && !form.file) return

    createResource.mutate(
      {
        title: form.title.trim(),
        type: form.type,
        url: isFileType ? null : form.url || null,
        file: form.file ?? undefined,
        description: form.description || null,
      } as never,
      {
        onSuccess: () => {
          setShowModal(false)
          setForm({ title: '', type: 'link', url: '', description: '', file: null })
        },
      },
    )
  }

  const resources = course.resources

  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Supplementary materials: books, links, videos, files and articles.
        </p>
        <Button size="sm" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Add resource
        </Button>
      </div>

      {resources.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface-card p-10 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-blue-400" />
          <p className="mt-3 text-sm text-text-secondary">
            No resources yet. Add books, links or files to support learners.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {resources.map((resource) => {
            const Icon = TYPE_ICON[resource.type] ?? Link2
            const href = resource.url || storageUrl(resource.file_path)
            return (
              <li
                key={resource.id}
                className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-card px-4 py-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-white">{resource.title}</div>
                  <div className="truncate text-xs text-text-muted">
                    {TYPE_LABELS[resource.type]} {resource.url ? `· ${resource.url}` : ''}
                  </div>
                </div>
                {href && (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-card-hover hover:text-white"
                    aria-label={resource.url ? `Open ${resource.title}` : `Download ${resource.title}`}
                  >
                    {resource.url ? <Link2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => deleteResource.mutate(resource.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-card-hover hover:text-semantic-error"
                  aria-label="Delete resource"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add resource" size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
            placeholder="e.g. Python Crash Course"
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">Type</label>
            <div className="flex flex-wrap gap-2">
              {(['book', 'link', 'video', 'file', 'article'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type }))}
                  className={
                    form.type === type
                      ? 'rounded-lg bg-blue-500/15 px-3 py-1.5 text-sm font-semibold text-blue-300'
                      : 'rounded-lg border border-border-default px-3 py-1.5 text-sm font-medium text-text-secondary hover:border-border-strong'
                  }
                >
                  {TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>
          {isFileType ? (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                {form.type === 'book' ? 'Book file (PDF/EPUB)' : 'File'}
              </label>
              <input
                type="file"
                onChange={(e) => setForm((f) => ({ ...f, file: e.target.files?.[0] ?? null }))}
                className="w-full rounded-lg border border-border-default bg-surface-input px-3 py-2.5 text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-blue-500/15 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-blue-300"
              />
              <p className="mt-1.5 text-xs text-text-muted">Max 20MB</p>
            </div>
          ) : (
            <Input
              label="URL"
              value={form.url}
              onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
              placeholder="https://..."
            />
          )}
          <Input
            label="Description (optional)"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Short note about this resource"
          />
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createResource.isPending}>
              Add resource
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}