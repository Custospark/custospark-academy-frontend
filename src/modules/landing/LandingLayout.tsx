import { Link, Outlet, useLocation } from 'react-router-dom'
import { BookOpen, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { LogoImage } from '../../shared/components/brand/LogoImage'
import { Button } from '../../shared/components/buttons/Button'
import { ROUTES } from '../../app/routes/constants/shared.paths'
import { PRODUCT_TAGLINE } from '../../shared/brand/academyBrand'
import { cn } from '../../shared/utils/cn'

const NAV_LINKS = [
  { label: 'Home', to: ROUTES.HOME },
  { label: 'Courses', to: ROUTES.COURSES },
] as const

/**
 * Public landing shell - sticky navbar, page outlet, footer (mirrors Custosell LandingLayout).
 */
export default function LandingLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  function closeMobile() {
    setMobileOpen(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-academy-navy">
      {/* Sticky navbar */}
      <header className="sticky top-0 z-40 border-b border-border-navy/60 bg-academy-navy/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to={ROUTES.HOME} onClick={closeMobile}>
            <LogoImage />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-white',
                  location.pathname === link.to ? 'text-custospark-blue' : 'text-text-secondary',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link to={ROUTES.LOGIN}>
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link to={ROUTES.REGISTER}>
              <Button size="sm" className="bg-academy-orange hover:bg-bright-orange">
                Start learning
              </Button>
            </Link>
          </div>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary hover:bg-deep-navy md:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-border-navy/60 bg-deep-navy px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMobile}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary hover:bg-card-navy hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-3">
              <Link to={ROUTES.LOGIN} onClick={closeMobile}>
                <Button variant="outline" size="md" className="w-full">
                  Sign in
                </Button>
              </Link>
              <Link to={ROUTES.REGISTER} onClick={closeMobile}>
                <Button size="md" className="w-full bg-academy-orange hover:bg-bright-orange">
                  Start learning
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border-navy/60 bg-deep-navy">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <LogoImage />
            <p className="text-sm text-text-muted">
              &copy; {new Date().getFullYear()} Custospark Company Ltd. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-text-muted">
              <BookOpen className="h-4 w-4 text-custospark-blue" />
              {PRODUCT_TAGLINE}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}