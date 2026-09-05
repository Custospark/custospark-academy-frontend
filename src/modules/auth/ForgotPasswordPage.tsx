import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import AuthLayout from './AuthLayout'
import { AUTH_HERO_IMAGES } from './authHeroImages'
import { Button } from '../../shared/components/buttons/Button'
import { Input } from '../../shared/components/inputs/Input'
import { ROUTES } from '../../app/routes/constants/shared.paths'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formValid = email.trim() !== ''

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!formValid || submitting) return
    setSubmitting(true)
    setError(null)

    try {
      // Backend endpoint (auth/forgot-password) is pending - record request locally for now.
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="No stress - tell us your email and we will help you get back in."
      heroImage={AUTH_HERO_IMAGES.forgot}
    >
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Forgot password</h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Enter your email and we will send you a reset link
        </p>

        {submitted ? (
          <div className="mt-8 rounded-xl border border-academy-teal/40 bg-academy-teal/10 p-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-academy-teal" />
            <h2 className="mt-3 font-display text-lg font-semibold text-white">Check your inbox</h2>
            <p className="mt-1.5 text-sm text-text-secondary">
              If an account exists for <span className="font-medium text-white">{email}</span>, we
              have sent a link to reset your password.
            </p>
            <Button variant="outline" size="md" className="mt-5" onClick={() => setSubmitted(false)}>
              Use a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-lg border border-academy-red/40 bg-academy-red/10 px-4 py-3 text-sm text-academy-red">
                {error}
              </div>
            )}

            <Input
              type="email"
              name="email"
              label="Email address"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="submit" size="lg" className="w-full" disabled={!formValid} loading={submitting}>
              Send reset link
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-text-secondary">
          Remembered your password?{' '}
          <Link to={ROUTES.LOGIN} className="font-semibold text-custospark-blue hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}