'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'

export default function StickyCTA() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (dismissed) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 z-40 md:max-w-md"
        >
          <div className="bg-brand-gradient rounded-2xl p-4 shadow-premium flex items-center gap-4 border border-white/20">
            <Sparkles className="h-8 w-8 text-white flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">Start your 3-day free trial</p>
              <p className="text-white/80 text-xs">Join 50,000+ students mastering math</p>
            </div>
            <Link href="/auth/register" className="px-4 py-2 bg-white text-primary rounded-xl font-bold text-sm whitespace-nowrap hover:scale-105 transition-transform">
              Join Free
            </Link>
            <button onClick={() => setDismissed(true)} className="text-white/80 hover:text-white p-1" aria-label="Dismiss">
              <X className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
