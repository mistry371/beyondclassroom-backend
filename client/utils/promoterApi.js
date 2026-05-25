import axios from 'axios'
import { getErrorMessage } from '@/lib/getErrorMessage'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://beyondclassroom-backend.onrender.com/api'

const promoterApi = axios.create({
  baseURL: API_URL,
  timeout: 45000,
  headers: { 'Content-Type': 'application/json' },
})

promoterApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('promoterToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

promoterApi.interceptors.response.use(
  (r) => r,
  async (error) => {
    const config = error.config
    if (config && !config.__retry && (!error.response || error.response.status >= 500)) {
      config.__retry = true
      await new Promise((r) => setTimeout(r, 1000))
      return promoterApi.request(config)
    }
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      clearPromoterSession()
      if (!window.location.pathname.startsWith('/promoter/login')) {
        window.location.href = '/promoter/login'
      }
    }
    error.userMessage = getErrorMessage(error)
    return Promise.reject(error)
  }
)

export function savePromoterSession(token, promoter) {
  localStorage.setItem('promoterToken', token)
  localStorage.setItem('promoter', JSON.stringify(promoter))
}

export function clearPromoterSession() {
  localStorage.removeItem('promoterToken')
  localStorage.removeItem('promoter')
}

export function getStoredPromoter() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('promoter')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default promoterApi
