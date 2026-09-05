import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, Sparkles } from 'lucide-react'
import { LogoImage } from '../../shared/components/brand/LogoImage'
import { PRODUCT_TAGLINE_LONG } from '../../shared/brand/academyBrand'
import { ROUTES } from '../../app/routes/constants/shared.paths'

interface AuthLayoutProps {
  title: string
  subtitle?: string
  heroImage: string
  children: ReactNode
}

/**
 * Shared split-screen auth shell (mirrors Custosell AuthLayout).
 * Left: online hero image + tagline. Right: form card.
 */
export default function AuthLayout({ title, subtitle, heroImage, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-academy-navy">
      {/* Left hero panel */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <img src={heroImage} alt="Custospark Academy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-tr from-academy-navy via-academy-navy/70 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-between p-12">
          <LogoImage size="lg" />
          <div className="max-w-md">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-custospark-blue/40 bg-custospark-blue/10 px-3 py-1 text-xs font-medium text-custospark-blue">
              <Sparkles className="h-3.5 w-3.5" />
              Custospark Academy
            </div>
            <h2 className="font-display text-3xl font-bold leading-tight text-white">{title}</h2>
            <p className="mt-3 text-text-secondary">{subtitle || PRODUCT_TAGLINE_LONG}</p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col items-center justify-center bg-academy-navy px-6 py-12 lg:w-1/2">
        <div className="mb-8 lg:hidden">
          <LogoImage size="md" />
        </div>
        <div className="w-full max-w-md">{children}</div>
        <p className="mt-8 flex items-center gap-1.5 text-xs text-text-muted">
          <GraduationCap className="h-3.5 w-3.5" />
          Part of{' '}
          <Link to={ROUTES.HOME} className="font-medium text-custospark-blue hover:underline">
            Custospark
          </Link>
        </p>
      </div>
    </div>
  )
}