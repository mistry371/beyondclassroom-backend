'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, BookOpen, CheckCircle2, GraduationCap, PlayCircle, ShieldCheck, Sparkles, Star, Users } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import api from '@/utils/api'
import PremiumButton from '@/components/marketing/PremiumButton'
import { brand, trustBadges } from '@/data/marketingContent'
import Link from 'next/link'

const classGrades = [
  { label: 'Class 1', href: '/courses?grade=1' },
  { label: 'Class 2', href: '/courses?grade=2' },
  { label: 'Class 3', href: '/courses?grade=3' },
  { label: 'Class 4', href: '/courses?grade=4' },
  { label: 'Class 5', href: '/courses?grade=5' },
  { label: 'Class 6', href: '/courses?grade=6' },
  { label: 'Class 7', href: '/courses?grade=7' },
  { label: 'Class 8', href: '/courses?grade=8' },
]

export default function Hero() {
  const ref = useRef(null)
  const [content, setContent] = useState({
    heroTitle: 'Beyond Classroom',
    heroSubtitle: 'Premium Mathematics practice for Class 1–8 with structured content, expert educators, and personalized learning paths.',
  })

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '10%'])

  useEffect(() => {
    api.get('/admin/content')
      .then((res) => {
        const c = res.data.content
        if (c?.heroTitle) setContent((prev) => ({ ...prev, heroTitle: c.heroTitle }))
        if (c?.heroSubtitle) setContent((prev) => ({ ...prev, heroSubtitle: c.heroSubtitle }))
      })
      .catch(() => {})
  }, [])

  return (
    <section ref={ref} className="relative min-h-[86vh] overflow-hidden bg-academic">
      <div className="absolute inset-0 hero-grid opacity-70" />
      <motion.div style={{ y }} className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[8%] top-24 h-64 w-64 rounded-full bg-secondary/15 blur-3xl" />
        <div className="absolute right-[9%] top-16 h-72 w-72 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute bottom-10 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-brandPink/10 blur-3xl" />
      </motion.div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:pb-24 lg:pt-20">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
          <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-primary/10 bg-white/80 px-4 py-2 shadow-sm backdrop-blur-xl">
            <Image src="/logo.jpeg" alt="" width={30} height={30} className="interactive rounded-lg" />
            <span className="text-sm font-bold text-primary">{brand.tagline}</span>
            <Sparkles className="h-4 w-4 text-accent" />
          </div>

          <h1 className="max-w-4xl text-5xl font-black leading-[1.02] text-navy sm:text-6xl lg:text-7xl">
            {content.heroTitle}
            <span className="block bg-brand-gradient bg-clip-text text-transparent">Learning beyond ordinary classrooms.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted sm:text-xl">
            {content.heroSubtitle}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PremiumButton href="/courses" variant="primary">
              Explore Courses <ArrowRight className="h-5 w-5" />
            </PremiumButton>
            <PremiumButton href="/packages" variant="light">
              <PlayCircle className="h-5 w-5" /> View Packages
            </PremiumButton>
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            {trustBadges.slice(0, 5).map((badge) => (
              <span key={badge} className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-white px-3 py-2 text-xs font-semibold text-ink shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
                {badge}
              </span>
            ))}
          </div>

            <div className="mt-10 max-w-2xl overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-premium">
              <div className="p-4 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-muted mb-3">Select Your Class</p>
                <div className="grid grid-cols-4 gap-2">
                  {classGrades.map((grade) => (
                    <Link
                      key={grade.label}
                      href={grade.href}
                      className="flex flex-col items-center gap-1.5 rounded-xl border border-primary/10 bg-academic hover:bg-brand-gradient hover:text-white hover:border-transparent p-2 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={`/class_images/${grade.label}.png`}
                          alt={grade.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      </div>
                      <span className="text-xs font-bold text-primary group-hover:text-white transition-colors">{grade.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="relative">
          <div className="relative rounded-[2rem] border border-primary/10 bg-white p-4 shadow-premium">
            <div className="rounded-[1.5rem] bg-gradient-to-br from-[#F8FAFC] via-white to-[#EFFFF6] p-5 sm:p-7">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold uppercase tracking-widest text-secondary">Student Growth OS</p>
                  <h2 className="mt-2 text-2xl font-black text-navy">Personalized weekly plan</h2>
                </div>
                <div className="rounded-2xl bg-brand-gradient p-3 text-white shadow-glow">
                  <GraduationCap className="h-7 w-7" />
                </div>
              </div>

              <div className="mt-7 space-y-4">
                {[
                  { icon: BookOpen, label: 'Class 1–8 Mathematics', detail: 'Structured curriculum-aligned content' },
                  { icon: CheckCircle2, label: 'Practice Papers', detail: 'Topic-wise worksheets & assessments' },
                  { icon: Sparkles, label: 'Expert Educators', detail: 'Human-crafted, personalized approach' },
                ].map((track, index) => (
                  <motion.div
                    key={track.label}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + index * 0.08 }}
                    className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <track.icon className="h-6 w-6" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-ink">{track.label}</p>
                        <p className="text-sm text-muted">{track.detail}</p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-secondary" />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-navy p-5 text-white">
                  <Users className="mb-4 h-6 w-6 text-secondary" />
                  <p className="text-3xl font-black">240+</p>
                  <p className="text-sm text-white/70">Live learners today</p>
                </div>
                <div className="rounded-2xl border border-accent/20 bg-accent/10 p-5">
                  <Star className="mb-4 h-6 w-6 fill-accent text-accent" />
                  <p className="text-3xl font-black text-navy">4.9</p>
                  <p className="text-sm font-medium text-muted">Parent rating</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
