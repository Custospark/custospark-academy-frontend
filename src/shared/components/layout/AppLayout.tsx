import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

/**
 * Authenticated app shell - sidebar (collapsible, mobile drawer) + top navbar,
 * scrollable main content and footer. Mirrors Custosell's Layout shell but
 * tailored to the Academy design system.
 */
export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Close the mobile sidebar drawer on navigation.
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="flex min-h-dvh bg-surface-page">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  )
}