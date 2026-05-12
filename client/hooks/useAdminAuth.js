import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'

export function useAdminAuth() {
  const router = useRouter()
  const { user, isAuthenticated } = useSelector(state => state.auth)

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    
    // Check admin role
    if (user && user.role !== 'admin' && user.role !== 'super_admin') {
      router.push('/dashboard')
      return
    }
  }, [user, isAuthenticated, router])

  return { user, isAuthenticated }
}
