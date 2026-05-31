'use client'

import Navbar from '@/components/Navbar'
import MarketingShell from '@/components/marketing/MarketingShell'
import PremiumButton from '@/components/marketing/PremiumButton'
import { motion } from 'framer-motion'
import { ArrowRight, Briefcase, CheckCircle2, HelpCircle, Mail, MapPin, MessageCircle, Phone, Send, Share2, Users } from 'lucide-react'
import { useState } from 'react'

const contactCards = [
  { icon: Mail, title: 'Email Support', value: 'beyondclassroom247@gmail.com', tone: 'text-primary bg-primary/10' },
  { icon: Phone, title: 'Call / WhatsApp', value: '+91 98765 43210', tone: 'text-secondary bg-secondary/10' },
  { icon: MapPin, title: 'Service Area', value: 'India and global online learners', tone: 'text-accent bg-accent/10' },
]

const faqs = [
  'Course guidance and package selection',
  'Promoter onboarding and referral setup',
  'School, institute, and partnership inquiries',
  'Student support, billing, and access help',
]

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', interest: 'General Support', message: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Thanks! Our team will contact you shortly.')
    setFormData({ name: '', email: '', phone: '', interest: 'General Support', message: '' })
  }

  return (
    <div className="min-h-screen bg-academic pb-20 md:pb-0">
      <Navbar />

      <section className="relative overflow-hidden premium-section">
        <div className="absolute inset-0 hero-grid opacity-70" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-24">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex rounded-full border border-primary/10 bg-white px-4 py-2 text-sm font-bold text-primary shadow-sm">
              Contact Us + Promote
            </span>
            <h1 className="mt-6 text-4xl font-black leading-tight text-navy sm:text-5xl lg:text-6xl">
              One premium desk for support, partnerships, and growth.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
              Reach the Beyond Classroom team for student support, school partnerships, promoter opportunities, and custom learning requests.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PremiumButton href="/promoter/register" variant="primary">
                Join Promoter Program <ArrowRight className="h-5 w-5" />
              </PremiumButton>
              <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-secondary/20 bg-white px-8 py-4 text-lg font-bold text-secondary shadow-premium transition-all hover:border-secondary/50">
                <MessageCircle className="h-5 w-5" /> WhatsApp Team
              </a>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-[2rem] border border-primary/10 bg-white p-5 shadow-premium">
            <div className="grid gap-4 sm:grid-cols-3">
              {contactCards.map((card) => (
                <div key={card.title} className="rounded-2xl border border-primary/10 bg-academic p-4">
                  <span className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${card.tone}`}>
                    <card.icon className="h-5 w-5" />
                  </span>
                  <p className="font-bold text-ink">{card.title}</p>
                  <p className="mt-1 text-sm text-muted">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl bg-brand-gradient p-5 text-white">
              <div className="flex items-start gap-4">
                <Share2 className="mt-1 h-7 w-7" />
                <div>
                  <p className="text-xl font-black">Promoter opportunity</p>
                  <p className="mt-1 text-sm text-white/80">Earn commissions by helping parents discover structured Mathematics and French learning.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div className="space-y-5">
          <div className="rounded-3xl border border-primary/10 bg-white p-7 shadow-premium">
            <Users className="h-10 w-10 text-primary" />
            <h2 className="mt-4 text-2xl font-black text-navy">How we can help</h2>
            <div className="mt-5 space-y-3">
              {faqs.map((item) => (
                <p key={item} className="flex items-start gap-3 text-sm font-semibold text-ink">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary" />
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-primary/10 bg-white p-7 shadow-premium">
            <Briefcase className="h-10 w-10 text-secondary" />
            <h2 className="mt-4 text-2xl font-black text-navy">Partnerships</h2>
            <p className="mt-3 text-muted">For schools, institutes, tuition centers, creator partnerships, and local education networks.</p>
          </div>
        </div>

        <motion.div className="rounded-3xl border border-primary/10 bg-white p-6 shadow-premium sm:p-8" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <HelpCircle className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-2xl font-black text-navy">Send Inquiry</h2>
              <p className="text-sm text-muted">We usually respond within one working day.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="rounded-2xl border border-primary/10 bg-academic px-4 py-3 text-ink outline-none transition focus:border-primary" placeholder="Full Name" />
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="rounded-2xl border border-primary/10 bg-academic px-4 py-3 text-ink outline-none transition focus:border-primary" placeholder="Email (optional)" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <input required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="rounded-2xl border border-primary/10 bg-academic px-4 py-3 text-ink outline-none transition focus:border-primary" placeholder="Mobile Number" />
              <select value={formData.interest} onChange={(e) => setFormData({ ...formData, interest: e.target.value })} className="rounded-2xl border border-primary/10 bg-academic px-4 py-3 text-ink outline-none transition focus:border-primary">
                <option>General Support</option>
                <option>Promoter Opportunity</option>
                <option>Partnership Inquiry</option>
                <option>Course Customization</option>
              </select>
            </div>
            <textarea required rows={6} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full rounded-2xl border border-primary/10 bg-academic px-4 py-3 text-ink outline-none transition focus:border-primary" placeholder="Write your message" />
            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-gradient px-6 py-4 font-bold text-white shadow-premium transition hover:opacity-95 sm:w-auto">
              <Send className="h-5 w-5" /> Submit Inquiry
            </button>
          </form>
        </motion.div>
      </section>

      <MarketingShell />
    </div>
  )
}
