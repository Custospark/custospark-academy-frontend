import { axiosInstance } from '../../app/api/axiosConfig'

/** Fetches a URL as a blob (auth token applied) and saves it to disk. */
export async function downloadFile(url: string, filename: string): Promise<void> {
  const response = await axiosInstance.get(url, { responseType: 'blob' })
  const blobUrl = window.URL.createObjectURL(response.data as Blob)
  const anchor = document.createElement('a')
  anchor.href = blobUrl
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.URL.revokeObjectURL(blobUrl)
}