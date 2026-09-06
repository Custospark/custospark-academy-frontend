import { NavLink } from 'react-router-dom'
import { ChevronsLeft, ChevronsRight, X } from 'lucide-react'
import { sidebarNavGroups } from './sidebarNavGroups'
import { ROUTES } from '../../../app/routes/constants/shared.paths'
import { useAppSelector } from '../../../app/store/hooks/useApp'
import { LogoImage } from '../brand/LogoImage'
import { cn } from '../../utils/cn'
import { getRoleModules, type AcademyModule } from '../../utils/roleAccess'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

/**
 * Academy app sidebar - fixed + collapsible on desktop, slide-in drawer on
 * mobile. Shows the module groups mapped to the backend (Dashboard, Learning,
 * Payments, Administration), gated by the user's role.
 */
export function Sidebar({ isOpen, onClose, collapsed = false, onToggleCollapse }: SidebarProps) {
  const user = useAppSelector((state) => state.auth.user)
  const role = user?.role ?? 'learner'
  const allowedModules = new Set(getRoleModules(role))

  // Map each sidebar item to its role module key.
  const itemToModule: Record<string, AcademyModule> = {
    [ROUTES.DASHBOARD]: 'dashboard',
    [ROUTES.APP.CATALOG]: 'catalog',
    [ROUTES.APP.MY_COURSES]: 'myCourses',
    [ROUTES.APP.SCHEDULES]: 'schedules',
    [ROUTES.APP.PAYMENTS]: 'payments',
    [ROUTES.APP.CERTIFICATES]: 'certificates',
    [ROUTES.APP.ADMIN.COURSES]: 'courseManagement',
    [ROUTES.APP.ADMIN.ENROLLMENTS]: 'enrollmentManagement',
    [ROUTES.APP.ADMIN.INSTRUCTORS]: 'instructorManagement',
    [ROUTES.APP.ADMIN.STATS]: 'platformStats',
    [ROUTES.APP.ADMIN.PERMISSIONS]: 'userPermissions',
  }

  const groups = sidebarNavGroups.map((group) => ({
    ...group,
    subItems: group.subItems.filter(
      (item) => itemToModule[item.to] && allowedModules.has(itemToModule[item.to]),
    ),
  }))

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border-subtle px-4">
        <NavLink to={ROUTES.DASHBOARD} className="flex items-center gap-2.5">
          <LogoImage size="sm" />
          {!collapsed && <span className="text-sm font-bold text-white">Custospark Academy</span>}
        </NavLink>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-text-muted hover:bg-surface-card-hover hover:text-white lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {groups.map((group) => (
          <div key={group.label} className="mb-5">
            {!collapsed && (
              <div className="mb-1.5 flex items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                <group.icon className="h-3.5 w-3.5" />
                {group.label}
              </div>
            )}
            <div className="space-y-0.5">
              {group.subItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === ROUTES.DASHBOARD}
                  className={({ isActive }) =>
                    cn(
                      'group/nav relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      collapsed && 'justify-center px-2',
                      isActive
                        ? 'bg-blue-500/15 text-blue-300'
                        : 'text-text-secondary hover:bg-surface-card hover:text-white',
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && item.label}
                  {collapsed && (
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg border border-border-default bg-surface-elevated px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover/nav:opacity-100"
                    >
                      {item.label}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border-subtle p-3">
        {collapsed ? (
          <div
            className="mx-auto flex h-9 w-9 items-center justify-center"
            title={user?.name}
          >
            <LogoImage size="sm" />
          </div>
        ) : (
          <div className="flex items-center gap-2.5 rounded-xl border border-border-subtle bg-surface-card p-3">
            <LogoImage size="sm" className="shrink-0 rounded-lg" />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">{user?.name ?? 'Learner'}</div>
              <div className="truncate text-xs capitalize text-text-muted">{role}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 hidden border-r border-border-subtle bg-surface-section transition-all duration-200 lg:block',
          collapsed ? 'w-20' : 'w-64',
        )}
      >
        {sidebarContent}

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="absolute -right-3 top-20 flex h-7 w-7 items-center justify-center rounded-full border border-border-default bg-surface-card text-text-secondary shadow-lg transition-colors hover:border-border-strong hover:text-white"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </aside>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-border-subtle bg-surface-section shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}