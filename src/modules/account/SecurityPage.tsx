import { useState, type FormEvent } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { PageHeader } from '../../shared/components/layout/PageHeader'
import { Button } from '../../shared/components/buttons/Button'
import { Input } from '../../shared/components/inputs/Input'
import { useChangePassword } from '../../shared/api/account/AccountQueries'
import { useToast } from '../../app/contexts/useToast'
import { apiErrorMessage } from '../../shared/utils/apiError'

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  hint,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete: string
  hint?: string
}) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <Input
        label={label}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        autoComplete={autoComplete}
        hint={hint}
        className="pr-11"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute bottom-2.5 right-3 flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:text-white"
        aria-label={visible ? `Hide ${label}` : `Show ${label}`}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

export default function SecurityPage() {
  const changePassword = useChangePassword()
  const { showToast } = useToast()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!current || !next || changePassword.isPending) return
    if (next.length < 8) {
      setError('Your new password must be at least 8 characters.')
      return
    }
    if (next !== confirm) {
      setError('The new passwords do not match.')
      return
    }
    changePassword.mutate(
      { current_password: current, password: next, password_confirmation: confirm },
      {
        onSuccess: () => {
          setCurrent('')
          setNext('')
          setConfirm('')
          showToast('success', 'Password updated. Use it next time you sign in.')
        },
        onError: (err) => {
          const message = apiErrorMessage(err, 'Could not update your password.')
          setError(message)
          showToast('error', message)
        },
      },
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="text-center">
        <PageHeader
          title="Security"
          description="Change the password you use to sign in. You stay signed in on this device."
        />
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border-subtle bg-surface-card p-6"
      >
        {error && (
          <p className="mb-4 rounded-lg border border-semantic-error/40 bg-semantic-error/10 px-4 py-3 text-sm text-semantic-error">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <PasswordField
            label="Current password"
            value={current}
            onChange={setCurrent}
            autoComplete="current-password"
          />
          <PasswordField
            label="New password"
            value={next}
            onChange={setNext}
            autoComplete="new-password"
            hint="At least 8 characters."
          />
          <PasswordField
            label="Confirm new password"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
          />
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" loading={changePassword.isPending}>
            Update password
          </Button>
        </div>
      </form>
    </div>
  )
}
