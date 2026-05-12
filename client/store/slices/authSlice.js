import { createSlice } from '@reduxjs/toolkit'

// Load initial state from localStorage
const loadFromLocalStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      if (token && user) {
        return {
          user: JSON.parse(user),
          token: token,
          isAuthenticated: true,
          loading: false,
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error)
    }
  }
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
  }
}

const initialState = loadFromLocalStorage()

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isAuthenticated = true
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', action.payload.token)
        localStorage.setItem('user', JSON.stringify(action.payload.user))
      }
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    // Action to restore state from localStorage
    restoreAuth: (state) => {
      if (typeof window !== 'undefined') {
        try {
          const token = localStorage.getItem('token')
          const user = localStorage.getItem('user')
          if (token && user) {
            state.user = JSON.parse(user)
            state.token = token
            state.isAuthenticated = true
          }
        } catch (error) {
          console.error('Error restoring auth:', error)
        }
      }
    },
  },
})

export const { setCredentials, logout, setLoading, restoreAuth } = authSlice.actions
export default authSlice.reducer

// Selectors
export const selectUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectToken = (state) => state.auth.token
