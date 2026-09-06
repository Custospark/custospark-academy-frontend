import { BookOpen, Download, File, FileText, Link2, Video } from 'lucide-react'
import type { LearnerCourse, LearnerResource } from '../../shared/types/learnerCourse'
import { storageUrl } from '../../shared/utils/storageUrl'

const TYPE_ICON = { book: BookOpen, link: Link2, video: Video, file: File, article: FileText }
const TYPE_LABELS: Record<string, string> = {
  book: 'Book',
  link: 'Link',
  video: 'Video',
  file: 'File',
  article: 'Article',
}

export function ResourcesSection({ course }: { course: LearnerCourse }) {
  if (course.resources.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border-strong bg-surface-card p-10 text-center">
        <BookOpen className="mx-auto h-10 w-10 text-blue-400" />
        <p className="mt-3 text-sm text-text-secondary">
          No supplementary resources for this course yet.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-2">
      {course.resources.map((resource) => (
        <ResourceRow key={resource.id} resource={resource} />
      ))}
    </div>
  )
}

function ResourceRow({ resource }: { resource: LearnerResource }) {
  const Icon = TYPE_ICON[resource.type as keyof typeof TYPE_ICON] ?? Link2
  // Uploaded files live on the API domain's public disk - never relative.
  const href = resource.url || storageUrl(resource.file_path)
  const isFile = !resource.url && !!resource.file_path

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-card px-4 py-3 transition-colors ${
        href ? 'hover:border-border-strong' : ''
      }`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-white">{resource.title}</div>
        <div className="text-xs text-text-muted">
          {TYPE_LABELS[resource.type] ?? resource.type}
          {resource.description ? ` · ${resource.description}` : ''}
        </div>
      </div>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          download={isFile || undefined}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border-default px-2.5 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:border-border-strong hover:text-white"
          aria-label={isFile ? `Download ${resource.title}` : `Open ${resource.title}`}
        >
          {isFile ? <Download className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
          {isFile ? 'Download' : 'Open'}
        </a>
      )}
    </div>
  )
}