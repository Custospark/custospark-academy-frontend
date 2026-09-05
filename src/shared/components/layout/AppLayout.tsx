import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

/**
 * Authenticated app shell - collapsible sidebar (desktop) + slide-in drawer
 * (mobile), top navbar, scrollable main content and footer.
 */
export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  // Close the mobile sidebar drawer on navigation.
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="flex min-h-dvh bg-surface-page">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      <div
        className={`flex min-w-0 flex-1 flex-col transition-all duration-200 ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  )
}