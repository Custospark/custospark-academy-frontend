import { describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'
import type { ReactNode } from 'react'

vi.mock('../../../../app/api/axiosConfig', () => ({
  axiosInstance: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

import { axiosInstance } from '../../../../app/api/axiosConfig'
import { useCompleteEnrollment, useMyPayments, usePaymentStatus } from '../LearnerCourseQueries'

const mockedGet = axiosInstance.get as ReturnType<typeof vi.fn>
const mockedPost = axiosInstance.post as ReturnType<typeof vi.fn>

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('learner payment queries', () => {
  it('loads payment history from GET /payments', async () => {
    mockedGet.mockResolvedValueOnce({
      data: { data: [{ id: 1, status: 'paid', fee_type: 'tuition' }] },
    })

    const { result } = renderHook(() => useMyPayments(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockedGet).toHaveBeenCalledTimes(1)
    expect(mockedGet.mock.calls[0][0]).toBe('/payments')
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].status).toBe('paid')
  })

  it('polls a single payment status from GET /payments/{id} once initiated', async () => {
    mockedGet.mockResolvedValueOnce({
      data: { data: { id: 5, status: 'processing', fee_type: 'application' } },
    })

    const { result } = renderHook(() => usePaymentStatus(5), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockedGet.mock.calls[0][0]).toBe('/payments/5')
    expect(result.current.data?.status).toBe('processing')
  })

  it('does not poll when no payment id is known yet', async () => {
    const { result } = renderHook(() => usePaymentStatus(null), { wrapper })

    expect(result.current.isPending).toBe(true)
    expect(mockedGet).not.toHaveBeenCalled()
  })

  it('marks an enrollment complete via POST /enrollments/{id}/complete', async () => {
    mockedPost.mockResolvedValueOnce({
      data: { data: { id: 3, status: 'completed' } },
    })

    const { result } = renderHook(() => useCompleteEnrollment(), { wrapper })

    act(() => {
      result.current.mutate({ enrollmentId: 3 })
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockedPost).toHaveBeenCalledTimes(1)
    expect(mockedPost.mock.calls[0][0]).toBe('/enrollments/3/complete')
    expect(result.current.data?.status).toBe('completed')
  })
})