'use client'

import Navbar from '@/components/Navbar'
import MarketingShell from '@/components/marketing/MarketingShell'
import { motion } from 'framer-motion'
import { HelpCircle, Mail, MapPin, Send } from 'lucide-react'
import { useState } from 'react'

const contactCards = [
  { icon: Mail, title: 'Email Support', value: 'beyondclassroom247@gmail.com', tone: 'text-primary bg-primary/10' },
  { icon: MapPin, title: 'Service Area', value: 'India and global online learners', tone: 'text-accent bg-accent/10' },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', interest: 'General Support', message: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setFormData({ name: '', email: '', phone: '', interest: 'General Support', message: '' })
  }

  return (
    <div className="min-h-screen bg-academic pb-20 md:pb-0">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden premium-section">
        <div className="absolute inset-0 hero-grid opacity-70" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex rounded-full border border-primary/10 bg-white px-4 py-2 text-sm font-bold text-primary shadow-sm">
              Career & Contact Us
            </span>
            <h1 className="mt-6 text-4xl font-black leading-tight text-navy sm:text-5xl lg:text-6xl">
              Get in Touch
            </h1>
            <p className="mt-5 max-w-2xl mx-auto text-lg leading-8 text-muted">
              Reach the Beyond Classroom team for student support, course guidance, and general inquiries.
            </p>
          </motion.div>

          {/* Contact Info Cards */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {contactCards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-primary/10 bg-white p-5 flex items-center gap-4 shadow-sm min-w-[220px]">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.tone}`}>
                  <card.icon className="h-5 w-5" />
                </span>
                <div className="text-left">
                  <p className="font-bold text-ink text-sm">{card.title}</p>
                  <p className="mt-0.5 text-sm text-muted">{card.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          className="rounded-3xl border border-primary/10 bg-white p-6 shadow-premium sm:p-10"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <HelpCircle className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-2xl font-black text-navy">Send Inquiry</h2>
            </div>
          </div>

          {submitted ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-ink mb-2">Message Sent!</h3>
              <p className="text-muted">Thanks for reaching out. Our team will get back to you soon.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 px-6 py-3 bg-brand-gradient text-white rounded-xl font-bold hover:opacity-90 transition-all"
              >
                Send Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="rounded-2xl border border-primary/10 bg-academic px-4 py-3 text-ink outline-none transition focus:border-primary"
                  placeholder="Full Name"
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="rounded-2xl border border-primary/10 bg-academic px-4 py-3 text-ink outline-none transition focus:border-primary"
                  placeholder="Email (optional)"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="rounded-2xl border border-primary/10 bg-academic px-4 py-3 text-ink outline-none transition focus:border-primary"
                  placeholder="Mobile Number"
                />
                <select
                  value={formData.interest}
                  onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                  className="rounded-2xl border border-primary/10 bg-academic px-4 py-3 text-ink outline-none transition focus:border-primary"
                >
                  <option>General Support</option>
                  <option>Course Guidance</option>
                  <option>Package Selection</option>
                  <option>Student Access Help</option>
                  <option>Billing Inquiry</option>
                  <option>Career Inquiry</option>
                </select>
              </div>
              <textarea
                required
                rows={6}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full rounded-2xl border border-primary/10 bg-academic px-4 py-3 text-ink outline-none transition focus:border-primary"
                placeholder="Write your message"
              />
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-gradient px-6 py-4 font-bold text-white shadow-premium transition hover:opacity-95 sm:w-auto"
              >
                <Send className="h-5 w-5" /> Submit Inquiry
              </button>
            </form>
          )}
        </motion.div>
      </section>

      <MarketingShell />
    </div>
  )
}
