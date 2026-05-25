'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Link2, Share2, Wallet, Trophy } from 'lucide-react'

const STEPS = [
  { icon: Link2, title: 'Copy your link', desc: 'Share your unique referral URL with students and parents.' },
  { icon: Share2, title: 'Share everywhere', desc: 'WhatsApp, Instagram, coaching groups — earn on every enrollment.' },
  { icon: Wallet, title: 'Track earnings', desc: 'Real-time dashboard shows referrals, commissions, and payouts.' },
  { icon: Trophy, title: 'Hit milestones', desc: 'Unlock ranks, streaks, and leaderboard rewards as you grow.' },
]

export default function PromoterOnboarding({ onDone }) {
  const [step, setStep] = useState(0)
  const [open, setOpen] = useState(true)

  if (!open) return null

  const finish = () => {
    localStorage.setItem('promoterTourDone', '1')
    setOpen(false)
    onDone?.()
  }

  const Icon = STEPS[step].icon

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-[#050B2B] border border-white/10 rounded-2xl max-w-md w-full p-8 relative"
        >
          <button onClick={finish} className="absolute top-4 right-4 text-white/50 hover:text-white" aria-label="Close tour">
            <X className="h-5 w-5" />
          </button>
          <p className="text-secondary text-sm font-semibold mb-2">Promoter onboarding · {step + 1}/{STEPS.length}</p>
          <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center mb-4">
            <Icon className="h-7 w-7 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{STEPS[step].title}</h3>
          <p className="text-white/70 text-sm mb-8">{STEPS[step].desc}</p>
          <div className="flex gap-3">
            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)} className="flex-1 py-3 rounded-xl border border-white/20 text-white font-semibold">
                Back
              </button>
            )}
            <button
              onClick={() => (step < STEPS.length - 1 ? setStep((s) => s + 1) : finish())}
              className="flex-1 py-3 rounded-xl bg-brand-gradient font-bold"
            >
              {step < STEPS.length - 1 ? 'Next' : 'Start earning'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
