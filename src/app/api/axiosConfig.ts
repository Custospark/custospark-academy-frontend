import { QueryClient } from '@tanstack/react-query'
import axios, { AxiosHeaders } from 'axios'
import { API_BASE_URL, API_TIMEOUT } from './apiConfig'
import { store } from '../store/store'
import { logout } from '../store/slices/authSlice'

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: { Accept: 'application/json' },
})

let isHandling401 = false

axiosInstance.interceptors.request.use((config) => {
  const token = store.getState().auth.token
  if (token) {
    const headers = AxiosHeaders.from(config.headers)
    headers.set('Authorization', `Bearer ${token}`)
    config.headers = headers
  }
  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    const skipRedirect = error?.config?.skipAuthRedirect === true

    if (status === 401 && !isHandling401 && !skipRedirect) {
      isHandling401 = true
      store.dispatch(logout())
      window.location.href = '/login'
      setTimeout(() => {
        isHandling401 = false
      }, 500)
    }

    return Promise.reject(error)
  },
)

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: { retry: 0 },
  },
})