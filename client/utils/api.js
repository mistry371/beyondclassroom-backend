import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://beyondclassroom-backend.onrender.com/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 45000, // 45s — enough for Render cold start + MongoDB connect
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
  async (error) => {
    const config = error.config
    if (!config || config.__retry) {
      // fall through
    } else if (
      (!error.response || error.response.status >= 500) &&
      (config.method === 'get' || config.method === 'GET')
    ) {
      config.__retry = true
      await new Promise((r) => setTimeout(r, 800))
      return api.request(config)
    }

    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const currentPath = window.location.pathname

      // Only redirect to login from pages that actually require authentication
      // Public pages (home, about, courses, blogs, contact, tools) should never redirect
      const publicPaths = ['/', '/about', '/team', '/packages', '/courses', '/blogs', '/contact', '/tools', '/career', '/live', '/promoter']
      const isPublicPath = (
        publicPaths.some(p => currentPath === p || currentPath.startsWith(p + '/'))
        || currentPath.startsWith('/courses/')
        || currentPath.startsWith('/blogs/')
      ) && !currentPath.startsWith('/promoter/dashboard')
      if (!isPublicPath && !currentPath.startsWith('/auth') && !currentPath.startsWith('/promoter/login') && !currentPath.startsWith('/promoter/register')) {
        // Clear stale auth data and redirect to login
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`
      }
    }
    return Promise.reject(error)
  }
)

export default api
