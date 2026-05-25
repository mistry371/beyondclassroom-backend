'use client'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import MarketingShell from '@/components/marketing/MarketingShell'
import SectionHeader from '@/components/marketing/SectionHeader'
import PremiumButton from '@/components/marketing/PremiumButton'
import { motion } from 'framer-motion'
import { packages as packageData, faqs } from '@/data/marketingContent'
import { CheckCircle, ChevronDown, ChevronUp, Star } from 'lucide-react'
import Link from 'next/link'

export default function PackagesPage() {
  const [currency, setCurrency] = useState('INR')
  const [openFaq, setOpenFaq] = useState(null)

  return (
    <div className="min-h-screen bg-soft-gradient pb-20 md:pb-0">
      <Navbar />

      <section className="py-20 bg-navy-gradient text-center">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4">Learning Packages</h1>
            <p className="text-white/80 text-xl mb-8">Invest in excellence. Every plan unlocks Mathematics and French courses on our premium platform.</p>
            <div className="inline-flex bg-white/10 rounded-xl p-1">
              <button
                onClick={() => setCurrency('INR')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${currency === 'INR' ? 'bg-white text-primary' : 'text-white'}`}
              >
                INR ₹
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${currency === 'USD' ? 'bg-white text-primary' : 'text-white'}`}
              >
                USD $
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 -mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {packageData.map((pkg, i) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-3xl p-8 flex flex-col premium-card ${
                  pkg.popular
                    ? 'bg-brand-gradient text-white shadow-glow ring-4 ring-secondary/40 scale-[1.03] z-10'
                    : 'glass-card'
                }`}
              >
                {pkg.popular && (
                  <>
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 px-4 py-1.5 bg-accent text-white text-sm font-bold rounded-full shadow-lg animate-glow">
                      <Star className="h-4 w-4 fill-white" /> Most Popular
                    </div>
                    <p className="text-center text-xs font-semibold text-white/90 mb-2">Save 40% vs monthly tutoring</p>
                  </>
                )}
                <h3 className={`text-2xl font-bold mb-2 ${pkg.popular ? 'text-white' : 'text-ink'}`}>{pkg.name}</h3>
                <div className={`text-5xl font-black mb-1 ${pkg.popular ? 'text-white' : 'text-primary'}`}>
                  {currency === 'INR' ? `₹${pkg.inr.toLocaleString('en-IN')}` : `$${pkg.usd}`}
                </div>
                <p className={`text-sm mb-8 ${pkg.popular ? 'text-white/80' : 'text-muted'}`}>per {pkg.period}</p>
                <ul className="space-y-3 mb-8 flex-grow">
                  {pkg.features.map((f) => (
                    <li key={f} className={`flex items-start gap-2 text-sm ${pkg.popular ? 'text-white/95' : 'text-muted'}`}>
                      <CheckCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${pkg.popular ? 'text-white' : 'text-secondary'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register"
                  className={`block text-center py-4 rounded-xl font-bold transition-all ${
                    pkg.popular ? 'bg-white text-primary hover:scale-105 shadow-lg' : 'bg-brand-gradient text-white hover:opacity-90'
                  }`}
                >
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <SectionHeader badge="Compare" title="Feature Comparison" />
          <div className="overflow-x-auto glass-card rounded-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary/10">
                  <th className="text-left p-4 font-bold text-ink">Feature</th>
                  {packageData.map((p) => (
                    <th key={p.id} className="p-4 font-bold text-primary text-center">{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['Live Classes', 'AI Tutor', 'All Courses', '1-on-1 Mentor', 'Certificates'].map((feature) => (
                  <tr key={feature} className="border-b border-primary/5">
                    <td className="p-4 text-muted">{feature}</td>
                    {packageData.map((p) => (
                      <td key={p.id} className="p-4 text-center">
                        {p.features.some((f) => f.toLowerCase().includes(feature.split(' ')[0].toLowerCase()) || (feature === 'All Courses' && f.includes('Grade')) || (feature === '1-on-1 Mentor' && f.includes('Mentor'))) ? (
                          <CheckCircle className="h-5 w-5 text-secondary mx-auto" />
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-16 bg-soft-gradient">
        <div className="max-w-3xl mx-auto px-4">
          <SectionHeader badge="FAQ" title="Frequently Asked Questions" />
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-ink"
                >
                  {faq.q}
                  {openFaq === i ? <ChevronUp className="h-5 w-5 text-primary" /> : <ChevronDown className="h-5 w-5 text-muted" />}
                </button>
                {openFaq === i && <div className="px-5 pb-5 text-muted">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 text-center">
        <PremiumButton href="/auth/register">Start Your 3-Day Free Trial</PremiumButton>
      </section>

      <MarketingShell />
    </div>
  )
}
