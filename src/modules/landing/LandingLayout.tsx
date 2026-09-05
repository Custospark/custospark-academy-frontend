import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Home, UserRound, Menu, X, BookOpen } from 'lucide-react'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LogoImage } from '../../shared/components/brand/LogoImage'
import { Button } from '../../shared/components/buttons/Button'
import { ROUTES } from '../../app/routes/constants/shared.paths'
import { PRODUCT_NAME } from '../../shared/brand/academyBrand'
import { cn } from '../../shared/utils/cn'

const NAV_LINKS = [
  { label: 'Home', path: ROUTES.HOME, icon: Home },
  { label: 'Courses', path: ROUTES.COURSES, icon: BookOpen },
] as const

/**
 * Public landing shell - dark navy theme, sticky navbar, page outlet, footer
 * (mirrors Custosell LandingLayout structure).
 */
export default function LandingLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMobileOpen(false)
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col bg-surface-page">
      <header className="sticky top-0 z-50 border-b border-border-subtle bg-surface-page/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-3 py-3 sm:px-6 sm:py-4" aria-label="Main navigation">
          <div className="flex items-center gap-3">
            <Link to={ROUTES.HOME} className="flex items-center gap-2.5">
              <LogoImage size="sm" />
              <span className="text-lg font-bold text-white">{PRODUCT_NAME}</span>
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden items-center gap-1 md:flex">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon
                const active =
                  link.path === ROUTES.HOME
                    ? location.pathname === link.path
                    : location.pathname === link.path || location.pathname.startsWith(`${link.path}/`)
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-300',
                      active
                        ? 'bg-blue-500/15 text-blue-300'
                        : 'text-text-secondary hover:bg-surface-card hover:text-white',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </div>

            <Link
              to={ROUTES.LOGIN}
              className="inline-flex items-center gap-1.5 rounded-xl px-2 py-2 text-sm font-semibold text-text-secondary transition-all duration-300 hover:bg-surface-card hover:text-white sm:px-4"
            >
              <UserRound className="h-4 w-4" />
              <span>Account</span>
            </Link>

            <div className="hidden sm:block">
              <Link to={ROUTES.REGISTER}>
                <Button size="md">Start learning</Button>
              </Link>
            </div>

            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-card md:hidden"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer + backdrop - rendered at root so it overlays the whole page */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/60 md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            <motion.div
              key="mobile-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
              className="fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] flex-col border-l border-border-subtle bg-surface-section shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
                <span className="text-base font-bold text-white">{PRODUCT_NAME}</span>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-card hover:text-white"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                <nav className="flex flex-col gap-1 p-5">
                  {NAV_LINKS.map((link) => {
                    const isActive =
                      link.path === ROUTES.HOME
                        ? location.pathname === link.path
                        : location.pathname === link.path || location.pathname.startsWith(`${link.path}/`)
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileOpen(false)}
                        aria-current={isActive ? 'page' : undefined}
                        className={
                          isActive
                            ? 'flex items-center gap-2.5 rounded-lg bg-blue-500/15 px-3 py-2.5 text-sm font-semibold text-blue-300'
                            : 'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-text-secondary hover:bg-surface-card hover:text-white'
                        }
                      >
                        <link.icon className="h-4 w-4" />
                        {link.label}
                      </Link>
                    )
                  })}
                </nav>

                <div className="flex flex-col gap-3 p-5">
                  <Link to={ROUTES.LOGIN} onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" size="md" className="w-full">
                      Account
                    </Button>
                  </Link>
                  <Link to={ROUTES.REGISTER} onClick={() => setMobileOpen(false)}>
                    <Button size="md" className="w-full">
                      Start learning
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border-subtle bg-surface-section py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2.5">
              <LogoImage size="sm" />
              <span className="text-base font-bold text-white">{PRODUCT_NAME}</span>
            </div>
            <p className="text-center text-sm text-text-secondary md:text-right">
              {PRODUCT_NAME} is a product of{' '}
              <a
                href="https://www.custospark.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-300 hover:underline"
              >
                Custospark Company Ltd
              </a>
            </p>
          </div>
          <div className="flex flex-col items-center justify-between gap-3 border-t border-border-subtle pt-6 sm:flex-row">
            <span className="text-xs text-text-muted">
              &copy; {new Date().getFullYear()} Custospark. All rights reserved.
            </span>
            <Link to={ROUTES.REGISTER} className="text-xs font-medium text-blue-300 hover:text-text-link-hover hover:underline">
              Create Account →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}