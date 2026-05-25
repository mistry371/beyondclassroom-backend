'use client'

import { useLayoutEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

function readStoredAdmin() {
  if (typeof window === 'undefined') return { token: null, user: null }

  const token = localStorage.getItem('token')
  let user = null
  try {
    const raw = localStorage.getItem('user')
    user = raw ? JSON.parse(raw) : null
  } catch {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
  return { token, user }
}

export function useAdminAuth() {
  const router = useRouter()
  const [authReady, setAuthReady] = useState(false)
  const [user, setUser] = useState(null)

  useLayoutEffect(() => {
    const { token, user: storedUser } = readStoredAdmin()
    const path = window.location.pathname

    if (!token || !storedUser) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(path)}`)
      return
    }

    if (storedUser.role !== 'admin' && storedUser.role !== 'super_admin') {
      router.replace('/dashboard')
      return
    }

    setUser(storedUser)
    setAuthReady(true)
  }, [router])

  const isAdmin =
    authReady && user && (user.role === 'admin' || user.role === 'super_admin')

  return { user, authReady, isAdmin, loading: !authReady }
}
