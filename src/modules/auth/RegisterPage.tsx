import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, LogIn, Mail, User, UserPlus } from 'lucide-react'
import AuthLayout from './AuthLayout'
import { AUTH_HERO_IMAGES } from './authHeroImages'
import { Button } from '../../shared/components/buttons/Button'
import { useRegister } from '../../shared/api/account/AccountQueries'
import { useAppSelector } from '../../app/store/hooks/useApp'
import { ROUTES } from '../../app/routes/constants/shared.paths'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const registerMutation = useRegister()
  const error = useAppSelector((state) => state.auth.error)
  const navigate = useNavigate()

  const passwordsMatch = password === confirmPassword
  const inputCls =
    'w-full pl-11 pr-4 py-3.5 bg-surface-input border border-border-default rounded-lg focus:ring-2 focus:ring-border-focus focus:border-border-focus outline-none transition-colors text-sm text-text-primary placeholder:text-text-muted'

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!passwordsMatch || registerMutation.isPending) return

    registerMutation.mutate(
      { name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, password },
      {
        onSuccess: () => navigate(ROUTES.DASHBOARD, { replace: true }),
      },
    )
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start learning in minutes - no credit card required."
      heroImage={AUTH_HERO_IMAGES.register}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <User className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Full name"
            className={inputCls}
          />
        </div>

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

        <div className="relative">
          <UserPlus className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone (optional)"
            className={inputCls}
          />
        </div>

        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="Password (min 8 characters)"
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
            placeholder="Confirm password"
            className={`${inputCls} pr-12`}
          />
        </div>

        {confirmPassword.length > 0 && !passwordsMatch && (
          <p className="text-sm text-semantic-error">Passwords do not match.</p>
        )}

        {error && (
          <p className="rounded-lg border border-semantic-error/40 bg-semantic-error/10 px-4 py-3 text-sm text-semantic-error">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full gap-2 py-3.5" loading={registerMutation.isPending}>
          <UserPlus className="h-4 w-4" aria-hidden />
          Create Account
        </Button>

        <div className="space-y-3 border-t border-border-subtle pt-5">
          <p className="text-center text-sm font-medium text-text-secondary">Already have an account?</p>
          <Link
            to={ROUTES.LOGIN}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-blue-500 bg-transparent px-4 py-3 text-sm font-semibold text-blue-300 transition-colors hover:bg-blue-500/10"
          >
            <LogIn className="h-4 w-4" aria-hidden />
            Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}