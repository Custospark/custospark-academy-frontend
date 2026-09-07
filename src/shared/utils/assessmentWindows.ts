export type WindowState = 'always' | 'upcoming' | 'open' | 'closed'

/** Where an assessment sits relative to its open/close window. */
export function windowState(opensAt: string | null, closesAt: string | null, now: Date = new Date()): WindowState {
  const opens = opensAt ? new Date(opensAt) : null
  const closes = closesAt ? new Date(closesAt) : null
  if (opens && now < opens) return 'upcoming'
  if (closes && now > closes) return 'closed'
  if (!opens && !closes) return 'always'
  return 'open'
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Short human line for badges: "Open till 12 Sep 2026", "Closed 1 Sep 2026", ... */
export function windowLabel(opensAt: string | null, closesAt: string | null, now: Date = new Date()): string | null {
  const state = windowState(opensAt, closesAt, now)
  if (state === 'always') return null
  if (state === 'upcoming' && opensAt) return `Opens ${formatDate(opensAt)}`
  if (state === 'closed' && closesAt) return `Closed ${formatDate(closesAt)}`
  if (closesAt) return `Open till ${formatDate(closesAt)}`
  return 'Open'
}

/** Value for datetime-local inputs (expects local ISO without seconds offset). */
export function toInputDateTime(value: string | null): string {
  if (!value) return ''
  const d = new Date(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Back to ISO (or null) for API payloads. */
export function fromInputDateTime(value: string): string | null {
  if (!value) return null
  return new Date(value).toISOString()
}

/** Non-null reason when submissions are blocked (shown instead of submit). */
export function windowBlockedReason(opensAt: string | null, closesAt: string | null, now: Date = new Date()): string | null {
  const state = windowState(opensAt, closesAt, now)
  if (state === 'upcoming' && opensAt) {
    return `This opens ${new Date(opensAt).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' })} - come back then.`
  }
  if (state === 'closed') {
    return 'Submissions are closed for this item.'
  }
  return null
}
