import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAppSelector } from '../store/hooks/useApp'
import { axiosInstance } from '../api/axiosConfig'
import { useQuery } from '@tanstack/react-query'
import { ENDPOINTS } from '../../shared/api/endpoints'
import { learnerKeys } from '../../shared/api/learner/LearnerCourseQueries'
import { imperativeToast } from '../contexts/imperativeToast'

interface SyncPayment {
  id: number
  status: string
}

/**
 * Global payment sync: while any payment is pending/processing (e.g. the
 * learner paid in the PesaPal popup and the callback lands server-side),
 * re-check the payments list every 5s on EVERY page. The moment a payment
 * flips to paid, all enrollment/course/payment caches refresh and the user
 * is told - so no page ever shows stale payment, application or course
 * status. Idle (no pending payments) means zero polling.
 */
export function PaymentStatusSync() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)
  const queryClient = useQueryClient()
  const paidIds = useRef<Set<number>>(new Set())
  const primed = useRef(false)

  const { data: payments } = useQuery({
    queryKey: [...learnerKeys.payments, 'sync'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ data: SyncPayment[] }>(ENDPOINTS.PAYMENTS.INDEX)
      return data.data
    },
    enabled: isAuthenticated,
    refetchInterval: (query) =>
      query.state.data?.some((p) => p.status === 'pending' || p.status === 'processing')
        ? 5000
        : false,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (!payments) return
    // First snapshot only primes known-paid ids - no toast for history.
    if (!primed.current) {
      primed.current = true
      for (const p of payments) {
        if (p.status === 'paid') paidIds.current.add(p.id)
      }
      return
    }
    const newlyPaid = payments.filter((p) => p.status === 'paid' && !paidIds.current.has(p.id))
    if (newlyPaid.length === 0) return
    for (const p of newlyPaid) paidIds.current.add(p.id)
    queryClient.invalidateQueries({ queryKey: learnerKeys.myCourses })
    queryClient.invalidateQueries({ queryKey: ['learner', 'content'] })
    queryClient.invalidateQueries({ queryKey: ['learner', 'progress'] })
    queryClient.invalidateQueries({ queryKey: learnerKeys.payments })
    imperativeToast.show('success', 'Payment received - your status is up to date.')
  }, [payments, queryClient])

  return null
}
