import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, LogIn, Mail, User, UserPlus } from 'lucide-react'
import AuthLayout from './AuthLayout'
import { AUTH_HERO_IMAGES } from './authHeroImages'
import { Button } from '../../shared/components/buttons/Button'
import { PhoneNumberField } from '../../shared/components/inputs/PhoneNumberField'
import { useRegister } from '../../shared/api/account/AccountQueries'
import { useAppSelector } from '../../app/store/hooks/useApp'
import { ROUTES } from '../../app/routes/constants/shared.paths'
import { buildInternationalPhone, type parseInternationalPhone } from '../../shared/utils/phoneNumber'
import type { CountryCode } from '../../shared/utils/countryCodes'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneLocal, setPhoneLocal] = useState('')
  const [country, setCountry] = useState<CountryCode | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [slaAccepted, setSlaAccepted] = useState(true)
  const registerMutation = useRegister()
  const error = useAppSelector((state) => state.auth.error)
  const navigate = useNavigate()

  const passwordsMatch = password === confirmPassword
  const phoneRequired = true
  const phoneDigits = phoneLocal.replace(/\D/g, '')
  const phoneValid = phoneDigits.length >= 6
  const inputCls =
    'w-full pl-11 pr-4 py-3.5 bg-surface-input border border-border-default rounded-lg focus:ring-2 focus:ring-border-focus focus:border-border-focus outline-none transition-colors text-sm text-text-primary placeholder:text-text-muted'

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!passwordsMatch || !phoneValid || !slaAccepted || registerMutation.isPending) return

    // Build the full international phone using the selected dial code.
    const parsed = country
      ? { countryCode: country, localNumber: phoneLocal }
      : (null as ReturnType<typeof parseInternationalPhone> | null)

    const fullPhone = buildInternationalPhone(
      parsed?.countryCode ?? { name: 'Uganda', code: 'UG', dial_code: '+256', flag: '🇺🇬' },
      phoneLocal,
    )

    registerMutation.mutate(
      { name: name.trim(), email: email.trim(), phone: fullPhone ?? phoneLocal, password },
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

        <PhoneNumberField
          value={phoneLocal}
          onChange={setPhoneLocal}
          onCountryChange={setCountry}
          required={phoneRequired}
          showWhatsAppPreference
          error={phoneRequired && phoneLocal.length > 0 && !phoneValid ? 'Enter a valid phone number.' : undefined}
        />

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

        <label className="flex cursor-pointer items-center justify-center gap-2">
          <input
            type="checkbox"
            checked={slaAccepted}
            onChange={(e) => setSlaAccepted(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-border-default bg-surface-input text-electric-blue focus:ring-electric-blue"
          />
          <span className="text-xs text-text-muted">
            I agree to the{' '}
            <Link to={ROUTES.PRIVACY} className="text-text-secondary underline hover:text-blue-300">
              Privacy Policy and Terms of Service
            </Link>
          </span>
        </label>
        {!slaAccepted && (
          <p className="-mt-1 text-center text-xs text-semantic-error">
            You must agree to the Privacy Policy and Terms of Service to create an account.
          </p>
        )}

        <Button
          type="submit"
          className="w-full gap-2 py-3.5"
          disabled={!passwordsMatch || !phoneValid || !slaAccepted}
          loading={registerMutation.isPending}
        >
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