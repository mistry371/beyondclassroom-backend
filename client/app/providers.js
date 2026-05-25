'use client'

import { Provider } from 'react-redux'
import { store } from '@/store/store'
import { useEffect } from 'react'
import { restoreAuth } from '@/store/slices/authSlice'
import ErrorBoundary from '@/components/ErrorBoundary'

function AuthRestorer({ children }) {
  useEffect(() => {
    // Restore auth state from localStorage on mount
    store.dispatch(restoreAuth())
  }, [])

  return <>{children}</>
}

export function Providers({ children }) {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <AuthRestorer>{children}</AuthRestorer>
      </ErrorBoundary>
    </Provider>
  )
}
