import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Menu, UserRound } from 'lucide-react'
import { useAppSelector } from '../../../app/store/hooks/useApp'
import { useLogout } from '../../../shared/api/account/AccountQueries'
import { cn } from '../../utils/cn'

interface NavbarProps {
  onMenuClick: () => void
}

/**
 * Academy app top navbar - mobile menu trigger, page title, and the
 * user profile dropdown (profile section + logout).
 */
export function Navbar({ onMenuClick }: NavbarProps) {
  const user = useAppSelector((state) => state.auth.user)
  const logoutMutation = useLogout()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const initials = (user?.name ?? 'L')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border-subtle bg-surface-page/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-text-secondary hover:bg-surface-card lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate font-display text-lg font-bold text-white">
          {user?.name?.split(' ')[0] ? `Welcome back, ${user.name.split(' ')[0]}` : 'Dashboard'}
        </h1>
      </div>

      {/* Profile dropdown */}
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="flex items-center gap-2.5 rounded-xl border border-border-subtle bg-surface-card px-2.5 py-1.5 transition-colors hover:border-border-strong"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15 text-sm font-bold text-blue-300">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="h-full w-full rounded-lg object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="hidden text-left sm:block">
            <div className="max-w-[140px] truncate text-sm font-semibold text-white">
              {user?.name ?? 'Learner'}
            </div>
            <div className="max-w-[140px] truncate text-xs capitalize text-text-muted">
              {user?.role ?? 'learner'}
            </div>
          </div>
          <ChevronDown
            className={cn('h-4 w-4 text-text-muted transition-transform', menuOpen && 'rotate-180')}
          />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-border-subtle bg-surface-elevated shadow-2xl"
          >
            <div className="border-b border-border-subtle px-4 py-3">
              <div className="truncate text-sm font-semibold text-white">{user?.name}</div>
              <div className="mt-0.5 truncate text-xs text-text-muted">{user?.email}</div>
            </div>
            <div className="p-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false)
                  navigate('/app/catalog')
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-card hover:text-white"
              >
                <UserRound className="h-4 w-4" />
                Course Catalog
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false)
                  logoutMutation.mutate()
                }}
                disabled={logoutMutation.isPending}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-card hover:text-semantic-error"
              >
                <LogOut className="h-4 w-4" />
                {logoutMutation.isPending ? 'Signing out...' : 'Sign out'}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}