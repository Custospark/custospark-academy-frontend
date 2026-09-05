import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import { LogoImage } from '../../shared/components/brand/LogoImage'
import { PRODUCT_NAME, PRODUCT_TAGLINE, PRODUCT_TAGLINE_LONG } from '../../shared/brand/academyBrand'
import { ROUTES } from '../../app/routes/constants/shared.paths'
import { AUTH_HERO_IMAGES } from './authHeroImages'

const AUTH_HIGHLIGHTS = [
  { value: 'Live', label: 'Sessions' },
  { value: 'Practical', label: 'Projects' },
  { value: 'Certified', label: 'Outcomes' },
] as const

interface AuthLayoutProps {
  title: string
  subtitle?: string
  subtitleClassName?: string
  heroImage?: string
  children: ReactNode
}

/**
 * Shared split-screen auth shell (mirrors Custosell AuthLayout):
 * - Left: hero panel (image + navy gradient overlay + tagline + highlights + copyright)
 * - Right: navy surface panel with sticky header (logo + Home button) and form
 */
export default function AuthLayout({
  title,
  subtitle,
  subtitleClassName,
  heroImage,
  children,
}: AuthLayoutProps) {
  const image = heroImage || AUTH_HERO_IMAGES.login

  return (
    <div className="flex min-h-screen bg-surface-page">
      {/* Left hero panel */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-1/2">
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-surface-page/95 via-deep-navy/90 to-surface-page/80" />
        <div className="relative z-10 flex w-full flex-col p-10 xl:p-12">
          <div className="flex flex-1 items-center">
            <div className="max-w-md space-y-5">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                  {PRODUCT_TAGLINE}
                </p>
                <h1 className="mb-3 text-3xl font-bold leading-tight text-white xl:text-4xl">
                  Learn. Build. Launch.
                </h1>
                <p className="text-base leading-relaxed text-text-secondary">{PRODUCT_TAGLINE_LONG}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                {AUTH_HIGHLIGHTS.map((stat) => (
                  <div
                    key={stat.label}
                    className="min-w-[100px] rounded-xl border border-border-subtle bg-white/5 px-4 py-3 text-center text-white backdrop-blur-md"
                  >
                    <div className="text-lg font-bold">{stat.value}</div>
                    <div className="mt-0.5 text-xs text-text-tertiary">{stat.label}</div>
                  </div>
                ))}
              </div>

              <p className="text-sm text-text-tertiary">
                No credit card required · Enroll today · Learn at your pace
              </p>
            </div>
          </div>

          <div className="space-y-1 text-center">
            <p className="text-sm text-text-secondary">
              {PRODUCT_NAME} is a product of{' '}
              <a
                href="https://www.custospark.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline underline-offset-2 transition-colors hover:text-blue-300"
              >
                Custospark Company Ltd
              </a>
            </p>
            <div className="text-xs text-text-muted">
              &copy; {new Date().getFullYear()} Custospark. All rights reserved.
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex min-h-screen flex-1 flex-col bg-surface-section">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border-subtle bg-surface-page/80 px-5 py-4 backdrop-blur-sm sm:px-6">
          <Link to={ROUTES.HOME} className="inline-flex items-center gap-2.5">
            <LogoImage size="md" />
            <span className="text-xl font-bold text-white">{PRODUCT_NAME}</span>
          </Link>
          <div className="ml-auto">
            <Link
              to={ROUTES.HOME}
              className="inline-flex items-center gap-2 rounded-xl border border-border-default px-3.5 py-2 text-sm font-semibold text-text-secondary transition-all hover:border-border-strong hover:bg-surface-card hover:text-white"
              aria-label="Home"
            >
              <Home className="h-4 w-4 shrink-0" />
              <span>Home</span>
            </Link>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8 sm:py-10">
          <div className="w-full max-w-md">
            <div className="relative mb-8 h-44 overflow-hidden rounded-2xl ring-1 ring-border-subtle sm:h-48 lg:hidden">
              <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-page/95 via-deep-navy/55 to-deep-navy/25" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-400">
                  {PRODUCT_TAGLINE}
                </p>
                <p className="text-lg font-bold leading-snug text-white">Learn. Build. Launch.</p>
                <p className="mt-2 line-clamp-2 text-xs text-text-tertiary">{PRODUCT_TAGLINE_LONG}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-lg sm:p-8">
              <div className="mb-7 text-center">
                <h2 className="mb-1.5 text-2xl font-bold text-white sm:text-[1.65rem]">{title}</h2>
                {subtitle && (
                  <p className={`text-sm leading-relaxed text-text-secondary sm:text-base ${subtitleClassName ?? ''}`}>
                    {subtitle}
                  </p>
                )}
              </div>
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}