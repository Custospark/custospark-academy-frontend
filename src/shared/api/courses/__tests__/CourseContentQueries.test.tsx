import { describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'
import type { ReactNode } from 'react'

vi.mock('../../../../app/api/axiosConfig', () => ({
  axiosInstance: {
    request: vi.fn(),
  },
}))

import { axiosInstance } from '../../../../app/api/axiosConfig'
import { useCreateSection, useCreateOutcome } from '../CourseContentQueries'

const mockedRequest = axiosInstance.request as ReturnType<typeof vi.fn>

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('course content mutations', () => {
  it('creates a section via POST to the section endpoint', async () => {
    mockedRequest.mockResolvedValueOnce({ data: { data: { id: 10, title: 'Module 1' } } })

    const { result } = renderHook(() => useCreateSection(7), { wrapper })

    act(() => {
      result.current.mutate({ title: 'Module 1' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockedRequest).toHaveBeenCalledTimes(1)
    const call = mockedRequest.mock.calls[0][0]
    expect(call.method).toBe('post')
    expect(call.url).toBe('/admin/courses/7/sections')
    expect(call.data).toEqual({ title: 'Module 1' })
  })

  it('creates a learning outcome via POST with the description payload', async () => {
    mockedRequest.mockResolvedValueOnce({ data: { data: { id: 1, description: 'Build apps' } } })

    const { result } = renderHook(() => useCreateOutcome(7), { wrapper })

    act(() => {
      result.current.mutate({ description: 'Build apps' })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const call = mockedRequest.mock.calls[0][0]
    expect(call.method).toBe('post')
    expect(call.url).toBe('/admin/courses/7/outcomes')
    expect(call.data).toEqual({ description: 'Build apps' })
  })
})