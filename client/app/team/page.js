'use client'

import Navbar from '@/components/Navbar'
import MarketingShell from '@/components/marketing/MarketingShell'
import SectionHeader from '@/components/marketing/SectionHeader'
import { motion, AnimatePresence } from 'framer-motion'
import { team } from '@/data/marketingContent'
import { ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'

export default function TeamPage() {
  const [current, setCurrent] = useState(0)
  const total = team.length

  const prev = () => setCurrent((c) => (c - 1 + total) % total)
  const next = () => setCurrent((c) => (c + 1) % total)

  // Show 3 cards at a time on desktop, 1 on mobile
  const getVisible = () => {
    const indices = []
    for (let i = 0; i < Math.min(3, total); i++) {
      indices.push((current + i) % total)
    }
    return indices
  }

  return (
    <div className="min-h-screen bg-soft-gradient pb-20 md:pb-0">
      <Navbar />

      <section className="relative py-24 premium-section overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-70" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Image src="/logo.jpeg" alt="Beyond Classroom" width={80} height={80} className="rounded-2xl mx-auto mb-6 interactive shadow-premium" />
            <p className="text-secondary font-bold uppercase tracking-widest text-sm mb-4">Our Team</p>
            <h1 className="text-4xl md:text-6xl font-black text-navy mb-6">Meet Our Expert Team</h1>
            <p className="text-xl text-muted max-w-2xl mx-auto">
              Experienced educators dedicated to making mathematics accessible and engaging for every Class 1–8 student.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Carousel */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Faculty" title="Our Educators" subtitle="Verified educators with decades of combined experience." />

          {/* Desktop Carousel — 3 cards */}
          <div className="hidden md:block relative">
            <div className="grid md:grid-cols-3 gap-8">
              {getVisible().map((idx, pos) => {
                const member = team[idx]
                return (
                  <motion.div
                    key={`${idx}-${pos}`}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: pos * 0.08 }}
                    className="glass-card premium-card overflow-hidden group"
                  >
                    <div className="h-32 bg-brand-gradient relative">
                      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-2xl bg-white shadow-premium flex items-center justify-center text-3xl font-black text-primary border-4 border-white">
                        {member.initials}
                      </div>
                    </div>
                    <div className="pt-16 pb-8 px-6 text-center">
                      <h3 className="text-xl font-bold text-ink">{member.name}</h3>
                      <p className="text-primary font-semibold text-sm mt-1">{member.role}</p>
                      <p className="text-muted text-sm mt-2 flex items-center justify-center gap-1">
                        <GraduationCap className="h-4 w-4" /> {member.degree}
                      </p>
                      <p className="text-muted text-xs mt-1">{member.experience} experience</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Navigation */}
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                onClick={prev}
                className="w-12 h-12 rounded-full border border-primary/20 bg-white flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex gap-2">
                {team.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? 'bg-primary w-6' : 'bg-primary/20'}`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                className="w-12 h-12 rounded-full border border-primary/20 bg-white flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Mobile Carousel — 1 card */}
          <div className="md:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3 }}
                className="glass-card premium-card overflow-hidden mx-auto max-w-sm"
              >
                <div className="h-32 bg-brand-gradient relative">
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-24 h-24 rounded-2xl bg-white shadow-premium flex items-center justify-center text-3xl font-black text-primary border-4 border-white">
                    {team[current].initials}
                  </div>
                </div>
                <div className="pt-16 pb-8 px-6 text-center">
                  <h3 className="text-xl font-bold text-ink">{team[current].name}</h3>
                  <p className="text-primary font-semibold text-sm mt-1">{team[current].role}</p>
                  <p className="text-muted text-sm mt-2 flex items-center justify-center gap-1">
                    <GraduationCap className="h-4 w-4" /> {team[current].degree}
                  </p>
                  <p className="text-muted text-xs mt-1">{team[current].experience} experience</p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={prev}
                className="w-12 h-12 rounded-full border border-primary/20 bg-white flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex gap-2">
                {team.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? 'bg-primary w-6' : 'bg-primary/20'}`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                className="w-12 h-12 rounded-full border border-primary/20 bg-white flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <MarketingShell />
    </div>
  )
}
