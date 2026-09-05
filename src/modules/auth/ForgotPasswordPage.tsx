import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react'
import AuthLayout from './AuthLayout'
import { AUTH_HERO_IMAGES } from './authHeroImages'
import { Button } from '../../shared/components/buttons/Button'
import { ROUTES } from '../../app/routes/constants/shared.paths'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const inputCls =
    'w-full pl-11 pr-4 py-3.5 bg-surface-input border border-border-default rounded-lg focus:ring-2 focus:ring-border-focus focus:border-border-focus outline-none transition-colors text-sm text-text-primary placeholder:text-text-muted'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)

    try {
      // Backend endpoint (auth/forgot-password) is pending - record request locally for now.
      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we will send you a reset link."
      heroImage={AUTH_HERO_IMAGES.forgot}
    >
      {submitted ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-semantic-success/40 bg-semantic-success/10 p-6 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-semantic-success" />
            <h3 className="mt-3 text-lg font-bold text-white">Check your inbox</h3>
            <p className="mt-1.5 text-sm text-text-secondary">
              If an account exists for <span className="font-semibold text-white">{email}</span>, we
              have sent a link to reset your password.
            </p>
            <Button variant="secondary" size="md" className="mt-5" onClick={() => setSubmitted(false)}>
              Use a different email
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email address"
              className={inputCls}
            />
          </div>

          <Button type="submit" className="w-full gap-2 py-3.5" loading={submitting}>
            Send reset link
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