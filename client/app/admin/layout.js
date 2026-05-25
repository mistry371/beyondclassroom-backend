'use client'

import { useAdminAuth } from '@/hooks/useAdminAuth'

export default function AdminLayout({ children }) {
  const { authReady, loading } = useAdminAuth()

  if (loading || !authReady) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  return children
}
