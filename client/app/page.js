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
      

      <MarketingShell />
    </div>
  )
}
