import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
}

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
      }
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
  },
})

export const { setCredentials, logout, setLoading } = authSlice.actions
export default authSlice.reducer
