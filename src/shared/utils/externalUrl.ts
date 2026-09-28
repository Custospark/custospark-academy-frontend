/**
 * Normalize an instructor-pasted link so it opens for learners. Adds a
 * missing https:// scheme, passes embed codes (<iframe>) through untouched,
 * and drops dangerous schemes (javascript:, data:, ...) to null so they can
 * never land in an href. Mirrors the backend normalizeUrl() - render-time
 * use also repairs rows saved before server-side normalization existed.
 */
export function normalizeExternalUrl(url: string | null | undefined): string | null {
  if (url === null || url === undefined) return null
  const trimmed = url.trim()
  if (trimmed === '' || trimmed.includes('<')) return trimmed === '' ? null : trimmed
  if (trimmed.startsWith('//')) return `https:${trimmed}`
  const scheme = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/)
  if (scheme) {
    const name = scheme[1].toLowerCase()
    return name === 'http' || name === 'https' ? trimmed : null
  }
  return `https://${trimmed}`
}
