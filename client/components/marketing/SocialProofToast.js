'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { recentActivity } from '@/data/marketingContent'

export default function SocialProofToast() {
  const [index, setIndex] = useState(0)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const showTimer = setTimeout(() => setShow(true), 4000)
    const cycle = setInterval(() => {
      setShow(false)
      setTimeout(() => {
        setIndex((i) => (i + 1) % recentActivity.length)
        setShow(true)
      }, 400)
    }, 8000)
    return () => {
      clearTimeout(showTimer)
      clearInterval(cycle)
    }
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="fixed bottom-24 md:bottom-6 left-4 z-30 hidden sm:block"
        >
          <div className="bg-white rounded-xl shadow-premium px-4 py-3 border border-primary/10 max-w-xs">
            <p className="text-xs text-muted mb-1">Just now</p>
            <p className="text-sm font-medium text-ink">{recentActivity[index]}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
