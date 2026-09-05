import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthUser } from '../../../shared/types'

export interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isInitialized: boolean
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  error: null,
}

const TOKEN_KEY = 'academy_token'
const USER_KEY = 'academy_user'

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    loginSuccess: (state, action: PayloadAction<{ token: string; user: AuthUser }>) => {
      state.token = action.payload.token
      state.user = action.payload.user
      state.isAuthenticated = true
      state.isLoading = false
      state.error = null
      state.isInitialized = true
      localStorage.setItem(TOKEN_KEY, action.payload.token)
      localStorage.setItem(USER_KEY, JSON.stringify(action.payload.user))
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    hydrateAuth: (state, action: PayloadAction<{ token: string | null; user: AuthUser | null }>) => {
      state.token = action.payload.token
      state.user = action.payload.user
      state.isAuthenticated = action.payload.token !== null && action.payload.user !== null
      state.isInitialized = true
    },
    setUser: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload
      localStorage.setItem(USER_KEY, JSON.stringify(action.payload))
    },
    logout: (state) => {
      state.token = null
      state.user = null
      state.isAuthenticated = false
      state.isInitialized = true
      state.isLoading = false
      state.error = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    },
    setInitialized: (state) => {
      state.isInitialized = true
    },
  },
})

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  hydrateAuth,
  setUser,
  logout,
  setInitialized,
} = authSlice.actions

export const TOKEN_STORAGE_KEY = TOKEN_KEY
export const USER_STORAGE_KEY = USER_KEY

export default authSlice.reducer