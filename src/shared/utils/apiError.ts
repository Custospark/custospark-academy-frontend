import { isAxiosError } from 'axios'
import type { ApiErrorPayload } from '../types'

/**
 * Extract a human-readable message from an API/network error.
 * Mirrors Custosell's apiErrorMessage + sanitizeErrorMessage pattern.
 */
export function apiErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (isAxiosError<ApiErrorPayload>(error)) {
    const payload = error.response?.data
    if (payload?.message) {
      return payload.message
    }
    if (payload?.errors) {
      const first = Object.values(payload.errors)[0]
      if (Array.isArray(first) && first.length > 0) {
        return first[0]
      }
    }
    if (error.code === 'ECONNABORTED') {
      return 'The request timed out. Please try again.'
    }
    if (!error.response) {
      return 'Network error. Please check your connection and try again.'
    }
  }
  return fallback
}