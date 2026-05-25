'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { Calculator, TrendingUp, Award, Sparkles, Zap, Brain, Rocket, Shield, Users, Star } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRef, useState, useEffect } from 'react'
import api from '@/utils/api'
import FloatingMathSymbols from '@/components/marketing/FloatingMathSymbols'
import AnimatedCounter from '@/components/marketing/AnimatedCounter'
import PremiumButton from '@/components/marketing/PremiumButton'
import { trustBadges } from '@/data/marketingContent'
import { brand } from '@/data/marketingContent'

export default function Hero() {
  const ref = useRef(null)
  const [mounted, setMounted] = useState(false)
  const [content, setContent] = useState({
    heroTitle: 'Mathematics & French Meet Personalization',
    heroSubtitle: 'Premium personalized Mathematics and French for Grades 6–12 — live classes, AI tools, and expert educators.',
  })

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%'])
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])

  useEffect(() => {
    setMounted(true)
    api.get('/admin/content')
      .then((res) => {
        const c = res.data.content
        if (c?.heroTitle) setContent((prev) => ({ ...prev, heroTitle: c.heroTitle }))
        if (c?.heroSubtitle) setContent((prev) => ({ ...prev, heroSubtitle: c.heroSubtitle }))
      })
      .catch(() => {})
  }, [])

  const features = [
    { icon: Brain, title: 'AI-Powered', desc: 'Adaptive learning paths', color: 'from-primary to-secondary' },
    { icon: Calculator, title: '40+ Tools', desc: 'Professional calculators', color: 'from-secondary to-accent' },
    { icon: Rocket, title: 'Fast Track', desc: '10× faster mastery', color: 'from-brandPurple to-brandPink' },
    { icon: Award, title: 'Certified', desc: 'Recognized excellence', color: 'from-primary to-brandPurple' },
  ]

  return (
    <div ref={ref} className="relative overflow-hidden min-h-[92vh] flex items-center bg-navy-gradient">
      <FloatingMathSymbols count={14} />
      <motion.div style={{ y }} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-blob" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-secondary rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-brandPurple rounded-full mix-blend-screen filter blur-[100px] opacity-25 animate-blob animation-delay-4000" />
      </motion.div>

      <motion.div style={{ opacity }} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 glass-dark rounded-full px-5 py-2.5 mb-6"
            >
              <Image src="/logo.jpeg" alt="" width={28} height={28} className="rounded-lg interactive" />
              <Sparkles className="h-4 w-4 text-secondary" />
              <span className="text-white/90 font-semibold text-sm">{brand.name}</span>
              <Zap className="h-4 w-4 text-accent" />
            </motion.div>

            <p className="text-secondary font-bold text-sm uppercase tracking-widest mb-3">{brand.tagline}</p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6">
              <span className="bg-brand-gradient bg-clip-text text-transparent">{content.heroTitle}</span>
            </h1>
            <p className="text-lg md:text-xl text-white/75 mb-8 max-w-xl leading-relaxed">{content.heroSubtitle}</p>

            <div className="flex flex-wrap gap-2 mb-8">
              {trustBadges.slice(0, 4).map((badge) => (
                <span key={badge} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-medium border border-white/10">
                  <Shield className="h-3.5 w-3.5 text-secondary" />
                  {badge}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <PremiumButton href="/auth/register" variant="primary">
                <Rocket className="h-5 w-5" /> Start Free Trial
              </PremiumButton>
              <PremiumButton href="/courses" variant="secondary">
                <BookIcon /> Explore Courses
              </PremiumButton>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-md">
              <div className="glass-dark rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-white">
                  <AnimatedCounter value={50000} suffix="+" />
                </div>
                <div className="text-white/60 text-xs mt-1">Students</div>
              </div>
              <div className="glass-dark rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-secondary">
                  <AnimatedCounter value={95} suffix="%" />
                </div>
                <div className="text-white/60 text-xs mt-1">Success</div>
              </div>
              <div className="glass-dark rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-white flex items-center justify-center gap-0.5">
                  4.9<Star className="h-4 w-4 fill-accent text-accent" />
                </div>
                <div className="text-white/60 text-xs mt-1">Rating</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-brand-gradient rounded-3xl blur-2xl opacity-40" />
              <div className="relative glass-dark rounded-3xl p-8 border border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  {features.map((f, i) => {
                    const Icon = f.icon
                    return (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.03, y: -4 }}
                        className={`bg-gradient-to-br ${f.color} p-5 rounded-2xl text-white`}
                      >
                        <Icon className="h-8 w-8 mb-3 opacity-90" />
                        <h3 className="font-bold">{f.title}</h3>
                        <p className="text-white/80 text-sm">{f.desc}</p>
                      </motion.div>
                    )
                  })}
                </div>
                <div className="mt-6 flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                  <Users className="h-10 w-10 text-secondary" />
                  <div>
                    <p className="text-white font-semibold">Live now: 240+ students in class</p>
                    <p className="text-white/60 text-sm">Join interactive sessions today</p>
                  </div>
                  <span className="ml-auto w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {mounted && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 lg:hidden"
          >
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} className="glass-dark rounded-xl p-4 text-center">
                  <Icon className="h-6 w-6 text-secondary mx-auto mb-2" />
                  <p className="text-white text-sm font-semibold">{f.title}</p>
                </div>
              )
            })}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

function BookIcon() {
  return <TrendingUp className="h-5 w-5" />
}
