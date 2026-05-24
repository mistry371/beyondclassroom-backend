import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://beyondclassroom-backend.onrender.com/api'

const promoterApi = axios.create({
  baseURL: API_URL,
  timeout: 45000,
  headers: { 'Content-Type': 'application/json' },
})

promoterApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('promoterToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

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
