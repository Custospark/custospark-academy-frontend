import { useState } from 'react'
import { ShieldAlert, UserRound } from 'lucide-react'
import { PageHeader } from '../../../shared/components/layout/PageHeader'
import { AcademyLoader } from '../../../shared/components/loading/AcademyLoader'
import { useAdminUsers, useUpdateUser } from '../../../shared/api/admin/AdminQueries'
import { apiErrorMessage } from '../../../shared/utils/apiError'
import type { UserRole } from '../../../shared/types'

const ROLE_OPTIONS: UserRole[] = ['learner', 'instructor', 'admin']
const STATUS_OPTIONS = ['active', 'suspended', 'pending'] as const

const ROLE_COLOR: Record<UserRole, string> = {
  learner: 'bg-blue-500/15 text-blue-300',
  instructor: 'bg-semantic-success/15 text-semantic-success',
  admin: 'bg-academy-purple/15 text-academy-purple',
}

export default function PermissionsPage() {
  const { data: users, isPending, isError } = useAdminUsers()
  const updateUser = useUpdateUser()
  const [errorByUser, setErrorByUser] = useState<Record<number, string | null>>({})
  const [pendingId, setPendingId] = useState<number | null>(null)

  function handleChange(userId: number, patch: { role?: UserRole; status?: string }) {
    setPendingId(userId)
    setErrorByUser((prev) => ({ ...prev, [userId]: null }))
    updateUser.mutate(
      { id: userId, ...patch },
      {
        onError: (err) =>
          setErrorByUser((prev) => ({ ...prev, [userId]: apiErrorMessage(err, 'Update failed.') })),
        onSettled: () => setPendingId(null),
      },
    )
  }

  return (
    <div>
      <PageHeader
        title="Permissions"
        description="Change user roles and account status. Role changes apply immediately."
      />

      {isPending && <AcademyLoader block />}

      {isError && (
        <div className="rounded-2xl border border-semantic-error/40 bg-semantic-error/10 p-8 text-center">
          <p className="text-sm text-semantic-error">Could not load users.</p>
        </div>
      )}

      {!isPending && !isError && users && (
        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border-subtle bg-surface-section text-xs uppercase tracking-wider text-text-muted">
                <th className="px-5 py-3 font-semibold">User</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Courses</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border-subtle last:border-0">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-blue-300">
                        <UserRound className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-white">{user.name}</div>
                        <div className="truncate text-xs text-text-muted">{user.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLOR[user.role]}`}>
                        {user.role}
                      </span>
                      <select
                        value={user.role}
                        disabled={pendingId === user.id}
                        onChange={(e) => handleChange(user.id, { role: e.target.value as UserRole })}
                        className="rounded-lg border border-border-default bg-surface-input px-2 py-1.5 text-xs text-text-secondary focus:border-border-focus focus:outline-none"
                      >
                        {ROLE_OPTIONS.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errorByUser[user.id] && (
                      <p className="mt-1 text-xs text-semantic-error">{errorByUser[user.id]}</p>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <select
                      value={user.status}
                      disabled={pendingId === user.id}
                      onChange={(e) => handleChange(user.id, { status: e.target.value })}
                      className="rounded-lg border border-border-default bg-surface-input px-2 py-1.5 text-xs text-text-secondary focus:border-border-focus focus:outline-none"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-5 py-4 text-text-secondary">{user.course_count}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-start gap-2 border-t border-border-subtle bg-surface-section px-5 py-3 text-xs text-text-muted">
            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Admins cannot change their own role or status. Suspended users cannot sign in.
          </div>
        </div>
      )}
    </div>
  )
}