import type { ElementType } from 'react'
import { Construction } from 'lucide-react'

interface ModulePlaceholderProps {
  title: string
  description?: string
  icon?: ElementType
}

/**
 * Reusable placeholder for modules that will be built later. Keeps the app
 * navigable while pages are pending implementation.
 */
export function ModulePlaceholder({ title, description, icon: Icon = Construction }: ModulePlaceholderProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface-card p-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300">
        <Icon className="h-7 w-7" />
      </div>
      <h2 className="mt-5 font-display text-2xl font-bold text-white">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-text-secondary">
        {description ?? `The ${title} module is under construction. It will be available soon.`}
      </p>
    </div>
  )
}
