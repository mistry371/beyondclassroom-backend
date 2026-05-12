'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { BookOpen, Calculator, TrendingUp, Award, Sparkles, Zap, Brain, Rocket } from 'lucide-react'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import api from '@/utils/api'

export default function Hero() {
  const ref = useRef(null)
  const [mounted, setMounted] = useState(false)
  const [content, setContent] = useState({
    heroTitle: 'Master Mathematics with Beyond Classroom',
    heroSubtitle: 'Interactive lessons, live classes, and AI-powered tools for Grade 6-12 and competitive exams',
  })

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0])

  // Stable random values generated once on mount (avoids hydration mismatch)
  const [particles, setParticles] = useState([])

  useEffect(() => {
    setMounted(true)

    // Generate particles only on client
    const w = window.innerWidth
    const h = window.innerHeight
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * w,
        y: Math.random() * h,
        opacity: Math.random() * 0.5,
        yAnim: Math.random() * -100 - 100,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 2,
      }))
    )

    // Fetch admin-managed content
    api.get('/admin/content')
      .then(res => {
        const c = res.data.content
        if (c) {
          setContent({
            heroTitle:    c.heroTitle    || content.heroTitle,
            heroSubtitle: c.heroSubtitle || content.heroSubtitle,
          })
        }
      })
      .catch(() => {/* keep defaults */})
  }, [])

  const features = [
    { icon: Brain,      title: 'AI-Powered Learning', desc: 'Adaptive content for your level',  color: 'from-primary to-secondary'          },
    { icon: Calculator, title: '20+ Elite Tools',     desc: 'Professional calculators',          color: 'from-secondary to-accent'           },
    { icon: Rocket,     title: 'Fast Track',          desc: '10x faster learning',               color: 'from-accent to-primary'             },
    { icon: Award,      title: 'Certified',           desc: 'Industry-recognized',               color: 'from-primary via-secondary to-accent' },
  ]

  return (
    <div ref={ref} className="relative overflow-hidden min-h-screen flex items-center">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-100 to-dark-200">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <motion.div style={{ y }} className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </motion.div>
      </div>

      {/* Floating Particles — client only */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute w-2 h-2 bg-white rounded-full"
              initial={{ x: p.x, y: p.y, opacity: p.opacity }}
              animate={{ y: p.yAnim, opacity: 0 }}
              transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
            />
          ))}
        </div>
      )}

      <motion.div style={{ opacity }} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="text-center mb-20"
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-xl border border-primary/30 rounded-full px-6 py-3 mb-8"
          >
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-primary font-semibold">Beyond Classroom</span>
            <Zap className="h-5 w-5 text-secondary animate-pulse" />
          </motion.div>

          {/* Hero Title — from admin content */}
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent animate-glow">
              {content.heroTitle}
            </span>
          </h1>

          {/* Hero Subtitle — from admin content */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            {content.heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Link
              href="/dashboard"
              className="group relative px-10 py-5 bg-gradient-to-r from-primary to-secondary rounded-2xl font-bold text-lg text-dark overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-primary/50"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Rocket className="h-6 w-6" />
                Start Learning Now
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-secondary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>

            <Link
              href="/tools"
              className="group px-10 py-5 bg-white/10 backdrop-blur-xl border-2 border-primary/30 rounded-2xl font-bold text-lg text-white hover:bg-white/20 hover:border-primary/50 transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center gap-2">
                <Calculator className="h-6 w-6" />
                Explore Tools
              </span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity`}></div>
                <div className="relative bg-dark-100/80 backdrop-blur-xl rounded-2xl p-6 border border-primary/10 group-hover:border-primary/30 transition-all">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </motion.div>
    </div>
  )
}
