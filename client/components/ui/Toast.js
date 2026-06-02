'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

// Global toast state
let toastListeners = []
let toastQueue = []

export function showToast(message, type = 'info', duration = 4000) {
  const id = Date.now() + Math.random()
  const toast = { id, message, type, duration }
  toastQueue = [...toastQueue, toast]
  toastListeners.forEach(fn => fn([...toastQueue]))
  setTimeout(() => {
    toastQueue = toastQueue.filter(t => t.id !== id)
    toastListeners.forEach(fn => fn([...toastQueue]))
  }, duration)
}

export function showSuccess(msg) { showToast(msg, 'success') }
export function showError(msg) { showToast(msg, 'error', 5000) }
export function showWarning(msg) { showToast(msg, 'warning') }
export function showInfo(msg) { showToast(msg, 'info') }

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const STYLES = {
  success: 'bg-green-500/15 border-green-500/40 text-green-300',
  error: 'bg-red-500/15 border-red-500/40 text-red-300',
  warning: 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300',
  info: 'bg-blue-500/15 border-blue-500/40 text-blue-300',
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const listener = (newToasts) => setToasts(newToasts)
    toastListeners.push(listener)
    return () => { toastListeners = toastListeners.filter(l => l !== listener) }
  }, [])

  const dismiss = (id) => {
    toastQueue = toastQueue.filter(t => t.id !== id)
    toastListeners.forEach(fn => fn([...toastQueue]))
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => {
          const Icon = ICONS[toast.type] || Info
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-xl ${STYLES[toast.type]}`}
            >
              <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
              <button onClick={() => dismiss(toast.id)} className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
