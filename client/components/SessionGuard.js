'use client'

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { logout } from '@/store/slices/authSlice'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, MonitorSmartphone } from 'lucide-react'

// Global event bus for session expiry
let sessionExpiredListeners = []
export function notifySessionExpired() {
  sessionExpiredListeners.forEach(fn => fn())
}

export default function SessionGuard() {
  const dispatch = useDispatch()
  const router = useRouter()
  const { isAuthenticated } = useSelector(state => state.auth)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const handler = () => {
      if (isAuthenticated) setShowModal(true)
    }
    sessionExpiredListeners.push(handler)
    return () => { sessionExpiredListeners = sessionExpiredListeners.filter(l => l !== handler) }
  }, [isAuthenticated])

  const handleLogout = () => {
    setShowModal(false)
    dispatch(logout())
    router.push('/auth/login')
  }

  return (
    <AnimatePresence>
      {showModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl border border-white/10 p-8 max-w-sm w-full text-center shadow-2xl">
              <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                <MonitorSmartphone className="h-8 w-8 text-orange-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">Logged in on Another Device</h2>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Your account was signed in from another device. For your security, this session has been ended. Please sign in again to continue.
              </p>
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="h-5 w-5" /> Sign In Again
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
