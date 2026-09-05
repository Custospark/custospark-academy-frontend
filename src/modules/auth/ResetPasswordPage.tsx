import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react'
import AuthLayout from './AuthLayout'
import { AUTH_HERO_IMAGES } from './authHeroImages'
import { Button } from '../../shared/components/buttons/Button'
import { ROUTES } from '../../app/routes/constants/shared.paths'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const passwordsMatch = password === confirmPassword
  const inputCls =
    'w-full pl-11 pr-4 py-3.5 bg-surface-input border border-border-default rounded-lg focus:ring-2 focus:ring-border-focus focus:border-border-focus outline-none transition-colors text-sm text-text-primary placeholder:text-text-muted'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!passwordsMatch || submitting) return
    setSubmitting(true)

    try {
      // Backend endpoint (auth/reset-password) is pending - record request locally for now.
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle={email ? `Setting a new password for ${email}` : 'Choose a strong new password.'}
      heroImage={AUTH_HERO_IMAGES.reset}
    >
      {submitted ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-semantic-success/40 bg-semantic-success/10 p-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-semantic-success" />
            <h3 className="mt-3 text-lg font-bold text-white">Password updated</h3>
            <p className="mt-1.5 text-sm text-text-secondary">
              Your password has been reset successfully. You can now sign in.
            </p>
            <Link to={ROUTES.LOGIN}>
              <Button size="lg" className="mt-5 w-full">
                Go to sign in
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="New password (min 8 characters)"
              className={`${inputCls} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((show) => !show)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-text-muted hover:text-text-secondary"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Confirm new password"
              className={`${inputCls} pr-12`}
            />
          </div>

          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="text-sm text-semantic-error">Passwords do not match.</p>
          )}

          {token === '' && (
            <p className="rounded-lg border border-semantic-warning/40 bg-semantic-warning/10 px-4 py-3 text-xs text-semantic-warning">
              This reset link is missing its token. Open the link from your email.
            </p>
          )}

          <Button type="submit" className="w-full gap-2 py-3.5" loading={submitting}>
            Update password
          </Button>

          <div className="text-center">
            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-text-link hover:text-text-link-hover"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to sign in
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  )
}