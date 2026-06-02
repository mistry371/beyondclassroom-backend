'use client'

import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import MarketingShell from '@/components/marketing/MarketingShell'
import PremiumButton from '@/components/marketing/PremiumButton'
import { motion } from 'framer-motion'
import LiveStatsBar from '@/components/marketing/LiveStatsBar'

export default function Home() {
  return (
    <div className="min-h-screen bg-academic pb-20 md:pb-0">
      <Navbar />
      <LiveStatsBar />
      <Hero />

      {/* Final CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-gradient" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to Excel in Mathematics?</h2>
            <p className="text-xl text-white/90 mb-10">Join 50,000+ students building strong math foundations from Class 1 to Class 8.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PremiumButton href="/courses" variant="white">Explore Courses</PremiumButton>
              <PremiumButton href="/packages" variant="secondary">View Packages</PremiumButton>
            </div>
          </motion.div>
        </div>
      </section>

      <MarketingShell />
    </div>
  )
}
