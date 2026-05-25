'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'

/**
 * @param {{ roles?: string[], redirectTo?: string }} options
 */
export function useRequireAuth(options = {}) {
  const { roles = null, redirectTo = '/auth/login' } = options
  const router = useRouter()
  const { user, isAuthenticated } = useSelector((s) => s.auth)

  useEffect(() => {
    if (!isAuthenticated) {
      const path = typeof window !== 'undefined' ? window.location.pathname : ''
      router.replace(`${redirectTo}?redirect=${encodeURIComponent(path)}`)
      return
    }
    if (roles?.length && user && !roles.includes(user.role)) {
      if (user.role === 'admin' || user.role === 'super_admin') {
        router.replace('/admin')
      } else {
        router.replace('/dashboard')
      }
    }
  }, [isAuthenticated, user, roles, router, redirectTo])

  return { user, isAuthenticated, ready: isAuthenticated && (!roles?.length || roles.includes(user?.role)) }
}

export function useRequireAdmin() {
  return useRequireAuth({ roles: ['admin', 'super_admin'] })
}
