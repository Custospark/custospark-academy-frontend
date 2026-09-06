import { API_BASE_URL } from '../../app/api/apiConfig'

/**
 * Absolute URL for a file on the API's public disk (resources, exam papers,
 * submissions). Uploaded files live under the API domain's /storage symlink,
 * NOT the web docroot - a relative /storage/... path 404s (SPA fallback).
 */
export function storageUrl(filePath: string | null | undefined): string | null {
  if (!filePath) return null
  if (/^https?:\/\//i.test(filePath)) return filePath
  const origin = API_BASE_URL.replace(/\/api\/v?1?\/?$/, '').replace(/\/$/, '')
  const clean = filePath.replace(/^\/+/, '')
  return `${origin}/storage/${clean}`
}
