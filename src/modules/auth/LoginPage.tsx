import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Lock, LogIn, Mail, UserPlus, Eye, EyeOff } from 'lucide-react'
import AuthLayout from './AuthLayout'
import { AUTH_HERO_IMAGES } from './authHeroImages'
import { Button } from '../../shared/components/buttons/Button'
import { useLogin } from '../../shared/api/account/AccountQueries'
import { useAppSelector } from '../../app/store/hooks/useApp'
import { ROUTES } from '../../app/routes/constants/shared.paths'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const loginMutation = useLogin()
  const error = useAppSelector((state) => state.auth.error)
  const navigate = useNavigate()
  const location = useLocation()

  const inputCls =
    'w-full pl-11 pr-4 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-electric-blue focus:border-electric-blue outline-none transition-colors text-sm'

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (loginMutation.isPending) return

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
      title="Sign In"
      subtitle="Welcome back - continue your learning journey."
      heroImage={AUTH_HERO_IMAGES.login}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
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
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password"
            className={`${inputCls} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((show) => !show)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        <div className="-mt-3 text-right">
          <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs font-medium text-electric-blue hover:underline">
            Forgot password?
          </Link>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full gap-2 py-3.5" loading={loginMutation.isPending}>
          <LogIn className="h-4 w-4" aria-hidden />
          Sign In
        </Button>

        <div className="space-y-3 border-t border-gray-100 pt-5">
          <p className="text-center text-sm font-medium text-gray-700">Don&apos;t have an account?</p>
          <Link
            to={ROUTES.REGISTER}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-electric-blue bg-white px-4 py-3 text-sm font-semibold text-electric-blue transition-colors hover:bg-blue-50"
          >
            <UserPlus className="h-4 w-4" aria-hidden />
            Create Account
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}