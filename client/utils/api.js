import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://beyondclassroom-backend.onrender.com/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30s — handles Render cold start
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Clear stale auth data and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      const currentPath = window.location.pathname
      if (!currentPath.startsWith('/auth')) {
        window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`
      }
    }
    return Promise.reject(error)
  }
)

export default api
