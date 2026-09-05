import { BookOpen, File, FileText, Link2, Video } from 'lucide-react'
import type { LearnerCourse, LearnerResource } from '../../shared/types/learnerCourse'

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
  const href = resource.url || (resource.file_path ? `/storage/${resource.file_path}` : null)

  return (
    <a
      href={href ?? '#'}
      target={resource.url ? '_blank' : undefined}
      rel="noopener noreferrer"
      className={`flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-card px-4 py-3 transition-colors ${
        href ? 'hover:border-border-strong' : 'pointer-events-none'
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
    </a>
  )
}