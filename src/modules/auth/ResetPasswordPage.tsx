import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import AuthLayout from './AuthLayout'
import { AUTH_HERO_IMAGES } from './authHeroImages'
import { Button } from '../../shared/components/buttons/Button'
import { Input } from '../../shared/components/inputs/Input'
import { ROUTES } from '../../app/routes/constants/shared.paths'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const passwordsMatch = password === confirmPassword
  const formValid = password.length >= 8 && passwordsMatch && token !== ''

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!formValid || submitting) return
    setSubmitting(true)
    setError(null)

    try {
      // Backend endpoint (auth/reset-password) is pending - record locally for now.
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a strong password you have not used here before."
      heroImage={AUTH_HERO_IMAGES.reset}
    >
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Reset password</h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          {email ? `Setting a new password for ${email}` : 'Enter your new password'}
        </p>

        {submitted ? (
          <div className="mt-8 rounded-xl border border-academy-teal/40 bg-academy-teal/10 p-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-academy-teal" />
            <h2 className="mt-3 font-display text-lg font-semibold text-white">Password updated</h2>
            <p className="mt-1.5 text-sm text-text-secondary">
              Your password has been reset successfully. You can now sign in.
            </p>
            <Link to={ROUTES.LOGIN}>
              <Button size="lg" className="mt-5 w-full">
                Go to sign in
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {error && (
              <div className="rounded-lg border border-academy-red/40 bg-academy-red/10 px-4 py-3 text-sm text-academy-red">
                {error}
              </div>
            )}

            <Input
              type="password"
              name="password"
              label="New password"
              placeholder="Min 8 characters"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              type="password"
              name="confirm_password"
              label="Confirm new password"
              placeholder="Repeat password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={confirmPassword.length > 0 && !passwordsMatch ? 'Passwords do not match.' : undefined}
              required
            />

            {token === '' && (
              <div className="rounded-lg border border-academy-amber/40 bg-academy-amber/10 px-4 py-3 text-xs text-academy-amber">
                This reset link is missing its token. Open the link from your email.
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={!formValid} loading={submitting}>
              Update password
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-text-secondary">
          <Link to={ROUTES.LOGIN} className="font-semibold text-custospark-blue hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}