export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
export const API_TIMEOUT = 30000
/** Max 1 hour for video/file uploads on slow connections. */
export const UPLOAD_TIMEOUT = 3600000