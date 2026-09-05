import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import AuthLayout from './AuthLayout'
import { AUTH_HERO_IMAGES } from './authHeroImages'
import { Button } from '../../shared/components/buttons/Button'
import { Input } from '../../shared/components/inputs/Input'
import { useRegister } from '../../shared/api/account/AccountQueries'
import { useAppSelector } from '../../app/store/hooks/useApp'
import { ROUTES } from '../../app/routes/constants/shared.paths'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const registerMutation = useRegister()
  const error = useAppSelector((state) => state.auth.error)
  const navigate = useNavigate()

  const passwordsMatch = password === confirmPassword
  const formValid =
    name.trim() !== '' &&
    email.trim() !== '' &&
    password.length >= 8 &&
    passwordsMatch

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!formValid || registerMutation.isPending) return

    registerMutation.mutate(
      { name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, password },
      {
        onSuccess: () => navigate(ROUTES.DASHBOARD, { replace: true }),
      },
    )
  }

  return (
    <AuthLayout
      title="Start your learning journey"
      subtitle="Join Custospark Academy - hands-on courses, live sessions and certificates that matter."
      heroImage={AUTH_HERO_IMAGES.register}
    >
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Create your account</h1>
        <p className="mt-1.5 text-sm text-text-secondary">
          It takes less than a minute to get started
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <div className="rounded-lg border border-academy-red/40 bg-academy-red/10 px-4 py-3 text-sm text-academy-red">
              {error}
            </div>
          )}

          <Input
            type="text"
            name="name"
            label="Full name"
            placeholder="Your full name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

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

          <Input
            type="tel"
            name="phone"
            label="Phone (optional)"
            placeholder="+256 7XX XXX XXX"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              type="password"
              name="password"
              label="Password"
              placeholder="Min 8 characters"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hint={password.length > 0 && password.length < 8 ? 'At least 8 characters' : undefined}
              required
            />
            <Input
              type="password"
              name="confirm_password"
              label="Confirm password"
              placeholder="Repeat password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={confirmPassword.length > 0 && !passwordsMatch ? 'Passwords do not match.' : undefined}
              required
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!formValid}
            loading={registerMutation.isPending}
          >
            Create account
            {!registerMutation.isPending && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="font-semibold text-custospark-blue hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}