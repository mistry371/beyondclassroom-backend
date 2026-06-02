'use client'

import Navbar from '@/components/Navbar'
import MarketingShell from '@/components/marketing/MarketingShell'
import SectionHeader from '@/components/marketing/SectionHeader'
import PremiumButton from '@/components/marketing/PremiumButton'
import { motion } from 'framer-motion'
import { partners } from '@/data/marketingContent'
import { Award, ShieldCheck, Users, School, Globe, Briefcase } from 'lucide-react'
import Image from 'next/image'

export default function PartnersPage() {
  const partnerIcons = [School, Globe, Award, Users, School, Globe, Award, Users]

  return (
    <div className="min-h-screen bg-soft-gradient pb-20 md:pb-0">
      <Navbar />

      {/* Hero */}
      <section className="relative py-24 premium-section overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-70" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Image src="/logo.jpeg" alt="Beyond Classroom Logo" width={80} height={80} className="rounded-2xl mx-auto mb-6 interactive shadow-premium" />
            <p className="text-secondary font-bold uppercase tracking-widest text-sm mb-4">Our Partners</p>
            <h1 className="text-4xl md:text-6xl font-black text-navy mb-6">Trusted Collaborations</h1>
            <p className="text-xl text-muted max-w-3xl mx-auto leading-relaxed">
              We collaborate with premier educational networks, schools, and local teacher alliances to bring premium mathematics practice to students nationwide.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Grid of Partners */}
      <section className="py-20 -mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Collaborators" title="Institutional Networks & Alliances" subtitle="Guiding students toward mathematical excellence together." />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {partners.map((partner, i) => {
              const Icon = partnerIcons[i % partnerIcons.length]
              return (
                <motion.div
                  key={partner}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -6 }}
                  className="glass-card premium-card p-8 text-center flex flex-col items-center justify-between"
                >
                  <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center mb-6 shadow-premium">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-ink mb-4">{partner}</h3>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                    Official Partner
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Partnership Form Link */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-black text-navy mb-4">Partner With Beyond Classroom</h2>
            <p className="text-muted text-lg mb-8 max-w-2xl mx-auto">
              Are you a school coordinator, tuition center owner, or parent-teacher association representative? Let's work together to boost student outcomes.
            </p>
            <PremiumButton href="/contact" variant="primary">
              Get in Touch for Partnerships <Briefcase className="h-5 w-5 ml-2" />
            </PremiumButton>
          </motion.div>
        </div>
      </section>

      <MarketingShell />
    </div>
  )
}
