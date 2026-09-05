import { Link } from 'react-router-dom'
import { ROUTES } from '../../../app/routes/constants/shared.paths'
import { PRODUCT_NAME } from '../../../shared/brand/academyBrand'

/**
 * Academy app footer.
 */
export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-surface-section py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 lg:px-8">
        <span className="text-xs text-text-muted">
          &copy; {new Date().getFullYear()} Custospark. All rights reserved.
        </span>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-text-muted">{PRODUCT_NAME}</span>
          <Link to={ROUTES.PRIVACY} className="font-medium text-blue-300 hover:underline">
            Privacy &amp; Terms
          </Link>
        </div>
      </div>
    </footer>
  )
}