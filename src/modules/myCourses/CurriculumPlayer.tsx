import { useState } from 'react'
import { BookOpen, ChevronDown, CheckCircle2, Circle, Download, FileText, PlayCircle } from 'lucide-react'
import type { LearnerCourse, LearnerLesson } from '../../shared/types/learnerCourse'
import { Button } from '../../shared/components/buttons/Button'
import { Modal } from '../../shared/components/modals/Modal'
import { useMarkLesson } from '../../shared/api/learner/LearnerCourseQueries'
import { useToast } from '../../app/contexts/useToast'
import { apiErrorMessage } from '../../shared/utils/apiError'
import { storageUrl } from '../../shared/utils/storageUrl'
import { cn } from '../../shared/utils/cn'

export function CurriculumPlayer({ course, courseId }: { course: LearnerCourse; courseId: string }) {
  const [openSection, setOpenSection] = useState<number | null>(course.sections[0]?.id ?? null)
  const [activeLesson, setActiveLesson] = useState<LearnerLesson | null>(null)

  return (
    <div className="max-w-3xl space-y-3">
      {course.sections.map((section) => {
        const isOpen = openSection === section.id
        return (
          <div key={section.id} className="rounded-2xl border border-border-subtle bg-surface-card">
            <button
              type="button"
              onClick={() => setOpenSection(isOpen ? null : section.id)}
              className="flex w-full items-center gap-2 px-4 py-3 text-left"
            >
              <ChevronDown className={cn('h-4 w-4 text-text-muted transition-transform', !isOpen && '-rotate-90')} />
              <span className="font-semibold text-white">{section.title}</span>
              <span className="ml-auto text-xs text-text-muted">{section.lessons.length} lessons</span>
            </button>

            {isOpen && (
              <div className="space-y-1 border-t border-border-subtle px-4 py-3">
                {section.lessons.length === 0 ? (
                  <p className="py-2 text-sm text-text-muted">No lessons in this section yet.</p>
                ) : (
                  section.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => setActiveLesson(lesson)}
                      className="group flex w-full items-center gap-3 rounded-xl border border-border-subtle bg-surface-section px-3 py-2.5 text-left transition-colors hover:border-border-strong"
                    >
                      {lesson.content_type === 'video' ? (
                        <PlayCircle className="h-4 w-4 shrink-0 text-blue-400" />
                      ) : lesson.content_type === 'book' ? (
                        <BookOpen className="h-4 w-4 shrink-0 text-blue-400" />
                      ) : (
                        <FileText className="h-4 w-4 shrink-0 text-blue-400" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-white">{lesson.title}</div>
                        <div className="text-xs text-text-muted">
                          {lesson.content_type}
                          {lesson.duration_minutes ? ` · ${lesson.duration_minutes} min` : ''}
                        </div>
                      </div>
                      <Circle className="h-4 w-4 shrink-0 text-text-muted" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )
      })}

      <LessonModal
        lesson={activeLesson}
        courseId={courseId}
        onClose={() => setActiveLesson(null)}
      />
    </div>
  )
}

function LessonModal({
  lesson,
  courseId,
  onClose,
}: {
  lesson: LearnerLesson | null
  courseId: string
  onClose: () => void
}) {
  const startLesson = useMarkLesson(courseId)
  const completeLesson = useMarkLesson(courseId)
  const { showToast } = useToast()
  const [started, setStarted] = useState(false)
  const bookUrl = storageUrl(lesson?.book_path)
  const hasMedia =
    !!storageUrl(lesson?.video_path) || !!lesson?.video_url || !!bookUrl || !!lesson?.content

  return (
    <Modal
      open={lesson !== null}
      onClose={onClose}
      title={lesson?.title ?? ''}
      size="lg"
      showCloseButton
    >
      {lesson && (
        <div className="space-y-4">
          {lesson.content && (
            <div className="whitespace-pre-wrap rounded-xl border border-border-subtle bg-surface-section p-4 text-sm leading-relaxed text-text-secondary">
              {lesson.content}
            </div>
          )}

          {storageUrl(lesson.video_path) ? (
            <div className="overflow-hidden rounded-xl border border-border-subtle bg-black">
              <video
                src={storageUrl(lesson.video_path) ?? ''}
                title={lesson.title}
                className="aspect-video w-full"
                controls
                playsInline
                preload="metadata"
              />
            </div>
          ) : (
            lesson.video_url && (
              <div className="aspect-video w-full overflow-hidden rounded-xl border border-border-subtle bg-black">
                <iframe
                  src={lesson.video_url}
                  title={lesson.title}
                  className="h-full w-full"
                  allowFullScreen
                />
              </div>
            )
          )}

          {bookUrl && (
            <a
              href={bookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-3 transition-colors hover:border-blue-500"
            >
              <BookOpen className="h-5 w-5 shrink-0 text-blue-300" />
              <span className="text-sm font-medium text-white">Read / download book</span>
              <Download className="ml-auto h-4 w-4 text-blue-300" />
            </a>
          )}

          {!hasMedia && (
            <p className="rounded-xl border border-border-subtle bg-surface-section p-4 text-sm text-text-muted">
              This lesson has no content yet.
            </p>
          )}

          <div className="flex flex-wrap gap-3 border-t border-border-subtle pt-4">
            <Button
              onClick={() =>
                startLesson.mutate(
                  { lessonId: lesson.id, status: 'in_progress' },
                  {
                    onSuccess: () => {
                      setStarted(true)
                      showToast('success', 'Lesson started.')
                    },
                    onError: (err) => showToast('error', apiErrorMessage(err, 'Could not start the lesson.')),
                  },
                )
              }
              loading={startLesson.isPending}
              disabled={startLesson.isPending || started}
              variant={started ? 'outline' : 'primary'}
            >
              {started ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Started
                </>
              ) : (
                'Start lesson'
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                completeLesson.mutate(
                  { lessonId: lesson.id, status: 'completed' },
                  {
                    onSuccess: onClose,
                    onError: (err) => showToast('error', apiErrorMessage(err, 'Could not complete the lesson.')),
                  },
                )
              }
              loading={completeLesson.isPending}
              disabled={completeLesson.isPending}
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark as complete
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}