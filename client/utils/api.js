import axios from 'axios'
import { getCached, setCached, invalidateCache } from '@/lib/apiCache'
import { getErrorMessage } from '@/lib/getErrorMessage'
import { dedupeGet } from '@/lib/requestDedup'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://beyondclassroom-backend.onrender.com/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 45000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config
    if (config && !config.__retry) {
      const isGet = config.method === 'get' || config.method === 'GET'
      if (isGet && (!error.response || error.response.status >= 500)) {
        config.__retry = true
        await new Promise((r) => setTimeout(r, 1000))
        return api.request(config)
      }
    }

    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const msg = error.response?.data?.message || ''

      // Another device logged in — show modal, don't redirect silently
      if (msg.includes('another device') || msg.includes('Session expired')) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        invalidateCache('')
        // Dynamically import to avoid circular deps
        import('@/components/SessionGuard').then(({ notifySessionExpired }) => {
          notifySessionExpired()
        }).catch(() => {
          window.location.href = '/auth/login'
        })
        return Promise.reject(error)
      }

      const currentPath = window.location.pathname
      const publicPaths = ['/', '/about', '/team', '/packages', '/courses', '/blogs', '/contact', '/tools', '/career', '/live', '/promoter', '/learn', '/grades']
      const isPublicPath =
        (publicPaths.some((p) => currentPath === p || currentPath.startsWith(p + '/'))
          || currentPath.startsWith('/courses/')
          || currentPath.startsWith('/blogs/'))
        && !currentPath.startsWith('/promoter/dashboard')
      const isAuthPage = currentPath.startsWith('/auth') || currentPath.startsWith('/promoter/login') || currentPath.startsWith('/promoter/register')
      const hasToken = !!localStorage.getItem('token')

      if (currentPath.startsWith('/admin') && hasToken) {
        error.userMessage = error.userMessage || 'Request failed. Refresh the page or sign in again.'
        return Promise.reject(error)
      }

      if (!isPublicPath && !isAuthPage) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        invalidateCache('')
        window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`
      }
    }

    error.userMessage = getErrorMessage(error)
    return Promise.reject(error)
  }
)

export async function cachedGet(url, ttlMs = 90 * 1000) {
  return dedupeGet(`GET:${url}`, async () => {
    const hit = getCached(`GET:${url}`)
    if (hit) return { data: hit, status: 200, fromCache: true }
    const res = await api.get(url)
    setCached(`GET:${url}`, res.data, ttlMs)
    return res
  })
}

export { getErrorMessage, API_URL }
export default api
