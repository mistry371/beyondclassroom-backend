'use client'

import Navbar from '@/components/Navbar'
import MarketingShell from '@/components/marketing/MarketingShell'
import SectionHeader from '@/components/marketing/SectionHeader'
import { motion } from 'framer-motion'
import { BookOpen, CheckCircle2, Layers, Lightbulb, Target, Users, Zap } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const whatWeDo = [
  {
    title: 'Curated Practice Paper Library',
    desc: 'A comprehensive collection of ready-to-use practice papers covering key topics across Class 1–8, aligned with school curricula.',
  },
  {
    title: 'Customizable Practice Resources',
    desc: 'Create tailored practice papers by selecting topics, formats, and difficulty levels to match specific learning goals.',
  },
  {
    title: 'Structured Progression',
    desc: 'Content organized by class and concept to ensure a smooth and logical learning journey.',
  },
  {
    title: 'Assessment-Ready Materials',
    desc: 'Suitable for classwork, homework, revision, and testing purposes.',
  },
]

const ourApproach = [
  'Concept clarity and step-by-step learning',
  'Balanced difficulty levels',
  'Consistent practice for mastery',
  'Alignment with classroom expectations',
  'Human-crafted content for a thoughtful, personalized touch',
]

const whyChoose = [
  'Professionally designed and curriculum-aligned content',
  'Practice papers created with human insight and educational expertise',
  'Flexible practice paper creation tailored to individual needs',
  'Saves valuable time for educators and parents',
  'Encourages independent and confident learning',
  'Suitable for a wide range of learning environments',
]

const approachIcons = [Lightbulb, BookOpen, Zap, Target, Users]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-soft-gradient pb-20 md:pb-0">
      <Navbar />

      {/* Hero */}
      <section className="relative py-24 premium-section overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-70" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Image src="/logo.jpeg" alt="Beyond Classroom" width={80} height={80} className="rounded-2xl mx-auto mb-6 interactive shadow-premium" />
            <p className="text-secondary font-bold uppercase tracking-widest text-sm mb-4">About Us</p>
            <h1 className="text-4xl md:text-6xl font-black text-navy mb-6">About Beyond Classroom</h1>
            <p className="text-xl text-muted max-w-3xl mx-auto leading-relaxed">
              Beyond Classroom is a dedicated platform for high-quality mathematics practice, created to support students from Class 1 to Class 8. Our focus is simple: provide structured, reliable, and flexible practice resources that make learning mathematics more effective and consistent.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Statement */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card premium-card p-10 text-center"
          >
            <p className="text-xl text-muted leading-relaxed">
              We recognize that strong mathematical skills are built through regular practice and clear understanding. At Beyond Classroom, every practice paper is thoughtfully designed by experienced educators to ensure a meaningful and effective learning experience.
            </p>
          </motion.div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 bg-soft-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="What We Do" title="Our Core Offerings" subtitle="Everything you need for structured mathematics practice." />
          <div className="grid md:grid-cols-2 gap-8">
            {whatWeDo.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-card premium-card p-8 flex gap-5"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center flex-shrink-0 mt-1">
                  <Layers className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-ink mb-2">{item.title}</h3>
                  <p className="text-muted leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Our Approach" title="How We Develop Our Materials" subtitle="Built with a focus on what actually helps students learn." />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {ourApproach.map((item, i) => {
              const Icon = approachIcons[i % approachIcons.length]
              return (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  viewport={{ once: true }}
                  className="glass-card premium-card p-6 text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-ink leading-snug">{item}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Beyond Classroom */}
      <section className="py-16 bg-soft-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader badge="Why Choose Us" title="Why Choose Beyond Classroom" subtitle="Trusted by students, educators, and parents across India." />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChoose.map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                viewport={{ once: true }}
                className="flex items-start gap-4 p-6 glass-card rounded-2xl"
              >
                <CheckCircle2 className="h-6 w-6 text-secondary flex-shrink-0 mt-0.5" />
                <p className="text-ink font-semibold leading-snug">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-16 bg-brand-gradient text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-black text-white mb-4">Meaningful Learning Through Human Understanding</h2>
          <p className="text-white/90 mb-8 text-lg leading-relaxed">
            Our practice papers are crafted with care — bringing a personal, thoughtful approach to mathematics practice for every Class 1–8 student.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/packages" className="px-8 py-4 rounded-2xl bg-white text-primary font-bold hover:scale-105 transition-all shadow-lg">
              View Our Packages
            </Link>
            <Link href="/courses" className="px-8 py-4 rounded-2xl border-2 border-white text-white font-bold hover:bg-white/10 transition-all">
              Explore Courses
            </Link>
          </div>
        </div>
      </section>

      <MarketingShell />
    </div>
  )
}
