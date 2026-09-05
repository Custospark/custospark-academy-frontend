import type { ElementType } from 'react'
import {
  Award,
  BookOpen,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  Library,
  ShieldCheck,
  UserSquare2,
  Wallet,
} from 'lucide-react'
import { ROUTES } from '../../../app/routes/constants/shared.paths'

export interface SidebarSubItem {
  to: string
  label: string
  icon: ElementType
  adminOnly?: boolean
}

export interface SidebarNavGroup {
  icon: ElementType
  label: string
  subItems: SidebarSubItem[]
}

/**
 * Sidebar module map. Mirrors the Academy backend modules:
 *   Courses (public + admin), Enrollments (learner + admin),
 *   Payments, Schedules, Certificates, Dashboard.
 * Permissions gating (adminOnly) is wired but enforced later.
 */
export const sidebarNavGroups: SidebarNavGroup[] = [
  {
    icon: LayoutDashboard,
    label: 'Overview',
    subItems: [{ to: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    icon: Library,
    label: 'Learning',
    subItems: [
      { to: ROUTES.APP.CATALOG, label: 'Course Catalog', icon: BookOpen },
      { to: ROUTES.APP.MY_COURSES, label: 'My Courses', icon: GraduationCap },
      { to: ROUTES.APP.SCHEDULES, label: 'Schedules', icon: CalendarDays },
      { to: ROUTES.APP.CERTIFICATES, label: 'Certificates', icon: Award },
    ],
  },
  {
    icon: Wallet,
    label: 'Payments',
    subItems: [{ to: ROUTES.APP.PAYMENTS, label: 'My Payments', icon: Wallet }],
  },
  {
    icon: ShieldCheck,
    label: 'Administration',
    subItems: [
      { to: ROUTES.APP.ADMIN.COURSES, label: 'Course Management', icon: Library },
      { to: ROUTES.APP.ADMIN.ENROLLMENTS, label: 'Enrollments', icon: UserSquare2, adminOnly: true },
    ],
  },
]

/** All sidebar sub-route paths (for active-state + mobile). */
export const sidebarSubRoutes: string[] = sidebarNavGroups.flatMap((group) =>
  group.subItems.map((item) => item.to),
)