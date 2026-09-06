import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Camera } from 'lucide-react'
import { PageHeader } from '../../shared/components/layout/PageHeader'
import { Button } from '../../shared/components/buttons/Button'
import { Input } from '../../shared/components/inputs/Input'
import { useAppSelector } from '../../app/store/hooks/useApp'
import { useUpdateProfile, useUploadAvatar } from '../../shared/api/account/AccountQueries'
import { useToast } from '../../app/contexts/useToast'
import { apiErrorMessage } from '../../shared/utils/apiError'

export default function ProfilePage() {
  const user = useAppSelector((s) => s.auth.user)
  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadAvatar()
  const { showToast } = useToast()
  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setName(user?.name ?? '')
    setPhone(user?.phone ?? '')
  }, [user?.id, user?.name, user?.phone])

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim() || updateProfile.isPending) return
    updateProfile.mutate(
      { name: name.trim(), phone: phone.trim() || undefined },
      {
        onSuccess: () => showToast('success', 'Profile updated.'),
        onError: (err) => {
          const message = apiErrorMessage(err, 'Could not update your profile.')
          setError(message)
          showToast('error', message)
        },
      },
    )
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || uploadAvatar.isPending) return
    setPreview(URL.createObjectURL(file))
    uploadAvatar.mutate(file, {
      onSuccess: () => {
        setPreview(null)
        showToast('success', 'Profile picture updated.')
      },
      onError: (err) => {
        setPreview(null)
        showToast('error', apiErrorMessage(err, 'Could not upload your picture.'))
      },
    })
    e.target.value = ''
  }

  const avatarSrc = preview ?? user?.avatar_url ?? null
  const initials = (user?.name ?? 'L').trim().charAt(0).toUpperCase()

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="text-center">
        <PageHeader
          title="Profile"
          description="Manage your personal details. Your email address identifies your account and cannot be changed here."
        />
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface-card p-6">
        <div className="mb-6 flex flex-col items-center">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-blue-500/15 text-3xl font-bold text-blue-300"
            aria-label="Upload profile picture"
          >
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              initials
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-6 w-6 text-white" />
            </span>
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploadAvatar.isPending}
            className="mt-2 text-xs font-semibold text-blue-300 hover:underline disabled:opacity-50"
          >
            {uploadAvatar.isPending ? 'Uploading...' : 'Change picture'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <p className="mb-4 rounded-lg border border-semantic-error/40 bg-semantic-error/10 px-4 py-3 text-sm text-semantic-error">
              {error}
            </p>
          )}

          <div className="space-y-4">
            <Input
              label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your full name"
            />
            <Input label="Email address" value={user?.email ?? ''} disabled hint="Contact support to change your email." />
            <Input
              label="Phone (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +256700000000"
            />
            <div className="text-xs capitalize text-text-muted">
              Role: <span className="font-semibold text-text-secondary">{user?.role ?? 'learner'}</span>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="submit" loading={updateProfile.isPending}>
              Save changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
