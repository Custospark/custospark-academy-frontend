import { useEffect, useState, type FormEvent } from 'react'
import { GraduationCap, Mail, UserPlus, UserRoundCog } from 'lucide-react'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { AcademyLoader } from '../../../shared/components/loading/AcademyLoader'
import { SearchInput } from '../../../shared/components/inputs/SearchInput'
import { Button } from '../../../shared/components/buttons/Button'
import { Input } from '../../../shared/components/inputs/Input'
import { Modal } from '../../../shared/components/modals/Modal'
import { ConfirmDialog } from '../../../shared/components/modals/ConfirmDialog'
import {
  useCreateInstructor,
  useDeleteInstructor,
  useInstructors,
} from '../../../shared/api/admin/AdminQueries'
import { apiErrorMessage } from '../../../shared/utils/apiError'

export default function InstructorManagementPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const { data: instructors, isPending, isError } = useInstructors(search)
  const createMutation = useCreateInstructor()
  const deleteMutation = useDeleteInstructor()

  const [showCreate, setShowCreate] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [formError, setFormError] = useState<string | null>(null)

  const loading = isPending || (!instructors && !isError)

  // Debounce search input -> query term.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  function handleCreate(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    createMutation.mutate(
      {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
      },
      {
        onSuccess: () => {
          setShowCreate(false)
          setForm({ name: '', email: '', phone: '', password: '' })
        },
        onError: (err) => setFormError(apiErrorMessage(err, 'Could not create instructor.')),
      },
    )
  }

  return (
    <div>
      <PageHeader
        title="Instructors"
        description="Manage the instructors on the platform."
        actions={
          <div className="flex w-full items-center gap-3 sm:w-auto">
            <div className="w-full sm:w-64">
              <SearchInput
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onClear={() => {
                  setSearchInput('')
                  setSearch('')
                }}
                placeholder="Search instructors..."
              />
            </div>
            <Button onClick={() => setShowCreate(true)} className="shrink-0">
              <UserPlus className="h-4 w-4" />
              Add instructor
            </Button>
          </div>
        }
      />

      {loading && <AcademyLoader block />}

      {isError && (
        <div className="rounded-2xl border border-semantic-error/40 bg-semantic-error/10 p-8 text-center">
          <p className="text-sm text-semantic-error">Could not load instructors.</p>
        </div>
      )}

      {!loading && !isError && instructors && instructors.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface-card p-12 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-blue-400" />
          <h3 className="mt-4 text-lg font-bold text-white">No instructors yet</h3>
          <p className="mt-2 text-sm text-text-secondary">
            Add an instructor to start assigning courses.
          </p>
        </div>
      )}

      {!loading && !isError && instructors && instructors.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-section text-xs uppercase tracking-wider text-text-muted">
                <th className="px-5 py-3 font-semibold">Instructor</th>
                <th className="px-5 py-3 font-semibold">Contact</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {instructors.map((instructor) => (
                <tr key={instructor.id} className="border-b border-border-subtle last:border-0">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
                        <UserRoundCog className="h-5 w-5" />
                      </div>
                      <span className="font-semibold text-white">{instructor.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-text-secondary">
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-text-muted" />
                      {instructor.email}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        instructor.status === 'active'
                          ? 'rounded-full bg-semantic-success/15 px-2.5 py-0.5 text-xs font-medium text-semantic-success'
                          : 'rounded-full bg-semantic-warning/15 px-2.5 py-0.5 text-xs font-medium text-semantic-warning'
                      }
                    >
                      {instructor.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setConfirmDelete(instructor.id)}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add instructor" size="sm">
        <form onSubmit={handleCreate} className="space-y-4">
          {formError && (
            <p className="rounded-lg border border-semantic-error/40 bg-semantic-error/10 px-4 py-3 text-sm text-semantic-error">
              {formError}
            </p>
          )}
          <Input
            label="Full name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
            placeholder="Instructor name"
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
            placeholder="instructor@custospark.com"
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+256..."
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required
            minLength={8}
            hint="At least 8 characters"
          />
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Add instructor
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        title="Remove instructor"
        tone="danger"
        confirmLabel="Remove"
        message="This will remove the instructor from the platform. Their courses remain but are no longer assigned to an active instructor."
        confirmKeyword={confirmDelete ? String(confirmDelete) : ''}
        isConfirming={deleteMutation.isPending}
        onConfirm={() => {
          if (confirmDelete === null) return
          deleteMutation.mutate(confirmDelete, {
            onSettled: () => setConfirmDelete(null),
          })
        }}
      />
    </div>
  )
}