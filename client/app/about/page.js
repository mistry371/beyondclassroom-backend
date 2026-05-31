'use client'

import Navbar from '@/components/Navbar'
import MarketingShell from '@/components/marketing/MarketingShell'
import SectionHeader from '@/components/marketing/SectionHeader'
import PremiumButton from '@/components/marketing/PremiumButton'
import { motion } from 'framer-motion'
import { Target, Eye, Heart, Users, Zap, BookOpen, Lightbulb } from 'lucide-react'
import { timeline, values, brand } from '@/data/marketingContent'
import Image from 'next/image'
import Link from 'next/link'

const valueIcons = [Target, Heart, Users, Zap]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-soft-gradient pb-20 md:pb-0">
      <Navbar />

      <section className="relative py-24 premium-section overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-70" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Image src="/logo.jpeg" alt="" width={80} height={80} className="rounded-2xl mx-auto mb-6 interactive shadow-premium" />
            <p className="text-secondary font-bold uppercase tracking-widest text-sm mb-4">{brand.tagline}</p>
            <h1 className="text-4xl md:text-6xl font-black text-navy mb-6">About {brand.name}</h1>
            <p className="text-xl text-muted max-w-3xl mx-auto leading-relaxed">
              We believe every student deserves world-class mathematics education — personalized, engaging, and built for real results.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-card premium-card p-10">
              <Target className="h-14 w-14 text-primary mb-6" />
              <h2 className="text-3xl font-bold text-ink mb-4">Our Mission</h2>
              <p className="text-muted text-lg leading-relaxed">
                To make advanced mathematics accessible through innovative technology, expert instruction, and deeply personalized learning paths. We empower students to discover confidence and excellence in every equation.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="glass-card premium-card p-10">
              <Eye className="h-14 w-14 text-secondary mb-6" />
              <h2 className="text-3xl font-bold text-ink mb-4">Our Vision</h2>
              <p className="text-muted text-lg leading-relaxed">
                To become India&apos;s most trusted premium mathematics ecosystem — inspiring millions to embrace the beauty and power of math through live learning, AI, and human mentorship.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Philosophy" title="Our Educational Philosophy" subtitle="Concept clarity first, then application, then competitive excellence." />
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Lightbulb, title: 'Concept First', desc: 'Deep understanding before memorization — building unshakeable foundations.' },
              { icon: BookOpen, title: 'Practice Smart', desc: 'Targeted problem sets, mock tests, and analytics-driven revision.' },
              { icon: Users, title: 'Human + AI', desc: 'Expert educators paired with AI tools for 24/7 personalized support.' },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="text-center p-8 glass-card rounded-2xl">
                <div className="w-16 h-16 bg-brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-ink mb-2">{item.title}</h3>
                <p className="text-muted">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-soft-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Values" title="What We Stand For" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const Icon = valueIcons[i]
              return (
                <motion.div key={v.title} whileHover={{ y: -4 }} className="glass-card p-6 rounded-2xl text-center premium-card">
                  <Icon className="h-10 w-10 text-primary mx-auto mb-4" />
                  <h3 className="font-bold text-ink mb-2">{v.title}</h3>
                  <p className="text-muted text-sm">{v.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Journey" title="Our Story" />
          <div className="relative border-l-2 border-primary/20 pl-8 space-y-10">
            {timeline.map((item, i) => (
              <motion.div key={item.year} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="relative">
                <span className="absolute -left-[41px] w-5 h-5 rounded-full bg-brand-gradient border-4 border-white" />
                <span className="text-primary font-bold">{item.year}</span>
                <h3 className="text-xl font-bold text-ink mt-1">{item.title}</h3>
                <p className="text-muted mt-2">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-brand-gradient text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-black text-white mb-4">Ready to Experience Premium Math Education?</h2>
          <p className="text-white/90 mb-8">Join our community of learners and educators.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <PremiumButton href="/auth/register" variant="white">Start Free Trial</PremiumButton>
            <Link href="/team" className="px-8 py-4 rounded-2xl border-2 border-white text-white font-bold hover:bg-white/10 transition-all">Meet Our Team</Link>
          </div>
        </div>
      </section>

      <MarketingShell />
    </div>
  )
}
