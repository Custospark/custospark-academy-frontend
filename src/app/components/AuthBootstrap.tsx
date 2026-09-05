import { type ReactNode, useEffect } from 'react'
import { hydrateAuth, setInitialized, USER_STORAGE_KEY, TOKEN_STORAGE_KEY } from '../store/slices/authSlice'
import { useAppDispatch } from '../store/hooks/useApp'

/**
 * Hydrates the persisted auth session on boot (mirrors Custosell AuthBootstrap).
 * Reads token + user from localStorage and seeds the Redux auth slice.
 */
export function AuthBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY)
      const rawUser = localStorage.getItem(USER_STORAGE_KEY)
      if (token && rawUser) {
        dispatch(hydrateAuth({ token, user: JSON.parse(rawUser) }))
      } else {
        dispatch(setInitialized())
      }
    } catch {
      dispatch(setInitialized())
    }
  }, [dispatch])

  return <>{children}</>
}