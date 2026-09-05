import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { axiosInstance } from '../../../app/api/axiosConfig'
import { loginFailure, loginStart, loginSuccess, logout, setUser } from '../../../app/store/slices/authSlice'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks/useApp'
import { ENDPOINTS } from '../endpoints'
import type { AuthResponse, AuthUser, MeResponse } from '../../types'
import { DEFAULT_ROUTE } from '../../brand/academyBrand'
import { apiErrorMessage } from '../../utils/apiError'

export const authKeys = {
  me: ['auth', 'me'] as const,
}

export function useProfile() {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      const { data } = await axiosInstance.get<MeResponse>(ENDPOINTS.AUTH.ME)
      return data.data
    },
    enabled: useAppSelector((s) => s.auth.isAuthenticated),
  })
}

export function useLogin() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  return useMutation<AuthResponse['data'], Error, { email: string; password: string }>({
    mutationFn: async (credentials) => {
      const { data } = await axiosInstance.post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, credentials)
      return data.data
    },
    onMutate: () => dispatch(loginStart()),
    onSuccess: (data) => {
      dispatch(loginSuccess({ token: data.token, user: data.user }))
      navigate(DEFAULT_ROUTE, { replace: true })
    },
    onError: (error) => {
      dispatch(loginFailure(apiErrorMessage(error, 'Invalid email or password.')))
    },
  })
}

export function useRegister() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  return useMutation<
    AuthResponse['data'],
    Error,
    { name: string; email: string; password: string; phone?: string }
  >({
    mutationFn: async (payload) => {
      const { data } = await axiosInstance.post<AuthResponse>(ENDPOINTS.AUTH.REGISTER, payload)
      return data.data
    },
    onMutate: () => dispatch(loginStart()),
    onSuccess: (data) => {
      dispatch(loginSuccess({ token: data.token, user: data.user }))
      navigate(DEFAULT_ROUTE, { replace: true })
    },
    onError: (error) => {
      dispatch(loginFailure(apiErrorMessage(error, 'Registration failed.')))
    },
  })
}

export function useLogout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async () => {
      try {
        await axiosInstance.post(ENDPOINTS.AUTH.LOGOUT)
      } catch {
        // Ignore network errors - always clear local session
      }
    },
    onSuccess: () => {
      dispatch(logout())
      navigate('/login', { replace: true })
    },
    onSettled: () => {
      dispatch(logout())
      navigate('/login', { replace: true })
    },
  })
}

export function useRefreshUser() {
  const dispatch = useAppDispatch()

  return useMutation<AuthUser, Error>({
    mutationFn: async () => {
      const { data } = await axiosInstance.get<MeResponse>(ENDPOINTS.AUTH.ME)
      return data.data
    },
    onSuccess: (user) => dispatch(setUser(user)),
  })
}