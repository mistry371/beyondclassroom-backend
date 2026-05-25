'use client'

import { motion } from 'framer-motion'
import { Shield, Award, Lock, Users, BadgeCheck } from 'lucide-react'
import { trustBadges } from '@/data/marketingContent'

const icons = [Shield, Award, Lock, Users, BadgeCheck]

export default function TrustSection() {
  return (
    <section className="py-16 bg-soft-gradient border-y border-primary/5" aria-label="Trust and security">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-secondary font-semibold text-sm uppercase tracking-wider mb-2">Trusted by families nationwide</p>
          <h2 className="text-3xl md:text-4xl font-black text-ink">Premium Education You Can Trust</h2>
          <p className="text-muted mt-3 max-w-2xl mx-auto">
            Verified educators, secure Razorpay payments, and transparent progress — built for parents who demand excellence.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {trustBadges.map((label, i) => {
            const Icon = icons[i % icons.length]
            return (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card premium-card p-5 text-center gpu-accelerated"
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-brand-gradient flex items-center justify-center">
                  <Icon className="h-6 w-6 text-white" aria-hidden />
                </div>
                <p className="text-sm font-semibold text-ink">{label}</p>
              </motion.div>
            )
          })}
        </div>
        <p className="text-center text-muted text-xs mt-8 flex items-center justify-center gap-2">
          <Lock className="h-4 w-4 text-secondary" />
          256-bit encrypted payments · GDPR-aware data practices · Educator-verified content
        </p>
      </div>
    </section>
  )
}
