import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import AuthLayout from './AuthLayout'
import { AUTH_HERO_IMAGES } from './authHeroImages'
import { Button } from '../../shared/components/buttons/Button'
import { Input } from '../../shared/components/inputs/Input'
import { useLogin } from '../../shared/api/account/AccountQueries'
import { useAppSelector } from '../../app/store/hooks/useApp'
import { ROUTES } from '../../app/routes/constants/shared.paths'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const loginMutation = useLogin()
  const error = useAppSelector((state) => state.auth.error)
  const navigate = useNavigate()
  const location = useLocation()

  const formValid = email.trim() !== '' && password !== ''

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!formValid || loginMutation.isPending) return

    loginMutation.mutate(
      { email: email.trim(), password },
      {
        onSuccess: () => {
          const from = (location.state as { from?: string } | null)?.from
          navigate(from || ROUTES.DASHBOARD, { replace: true })
        },
      },
    )
  }

  return (
    <AuthLayout
      title="Welcome back to learning"
      subtitle="Continue where you left off - your courses, progress and certificates are waiting."
      heroImage={AUTH_HERO_IMAGES.login}
    >
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Sign in</h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          Access your Custospark Academy account
        </p>

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

          <div>
            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="Your password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="mt-2 text-right">
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-xs font-medium text-custospark-blue hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={!formValid} loading={loginMutation.isPending}>
            Sign in
            {!loginMutation.isPending && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          New to Custospark Academy?{' '}
          <Link to={ROUTES.REGISTER} className="font-semibold text-academy-orange hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}