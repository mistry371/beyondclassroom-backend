'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import MarketingShell from '@/components/marketing/MarketingShell'
import SectionHeader from '@/components/marketing/SectionHeader'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ChevronDown, ChevronUp, Star, Zap, Shield, Clock } from 'lucide-react'
import Link from 'next/link'
import { cachedGet } from '@/utils/api'
import { packages as staticPackages, faqs } from '@/data/marketingContent'

export default function PackagesPage() {
  const [currency, setCurrency] = useState('INR')
  const [openFaq, setOpenFaq] = useState(null)
  const [packages, setPackages] = useState(staticPackages)
  const [hoveredPkg, setHoveredPkg] = useState(null)

  useEffect(() => {
    cachedGet('/packages', 60000)
      .then((res) => { if (res.data?.packages?.length) setPackages(res.data.packages) })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-soft-gradient pb-20 md:pb-0">
      <Navbar />

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/95 to-primary/90" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/90 text-sm font-semibold mb-6">
              <Zap className="h-4 w-4 text-accent" /> Choose Your Plan
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-5 leading-tight">
              Simple, Transparent<br />
              <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">Pricing</span>
            </h1>
            <p className="text-white/75 text-lg mb-8 max-w-2xl mx-auto">
              Premium Mathematics content for Class 1–8. Pick the plan that fits your child&apos;s learning goals.
            </p>
            {/* Currency Toggle */}
            <div className="inline-flex bg-white/10 backdrop-blur-xl rounded-2xl p-1.5 border border-white/20">
              {['INR', 'USD'].map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    currency === c
                      ? 'bg-white text-primary shadow-lg'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {c === 'INR' ? '₹ INR' : '$ USD'}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Package Cards */}
      <section className="py-16 -mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {packages.map((pkg, i) => {
              const isPopular = pkg.popular
              const price = currency === 'INR'
                ? (pkg.inr || pkg.priceINR || 0)
                : (pkg.usd || pkg.priceUSD || 0)
              const symbol = currency === 'INR' ? '₹' : '$'

              return (
                <motion.div
                  key={pkg.id || pkg._id || i}
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onHoverStart={() => setHoveredPkg(i)}
                  onHoverEnd={() => setHoveredPkg(null)}
                  className={`relative rounded-3xl overflow-hidden transition-all duration-300 ${
                    isPopular
                      ? 'ring-2 ring-secondary shadow-glow scale-[1.02] z-10'
                      : hoveredPkg === i
                      ? 'shadow-premium -translate-y-1'
                      : 'shadow-md'
                  }`}
                >
                  {/* Popular badge */}
                  {isPopular && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-secondary to-primary py-2 text-center">
                      <span className="text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
                        <Star className="h-3.5 w-3.5 fill-white" /> Most Popular
                      </span>
                    </div>
                  )}

                  <div className={`${isPopular ? 'pt-10' : 'pt-0'} ${isPopular ? 'bg-gradient-to-br from-primary to-navy' : 'bg-white'}`}>
                    {/* Package image */}
                    {pkg.image ? (
                      <div className="h-44 overflow-hidden">
                        <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className={`h-3 ${isPopular ? 'bg-white/10' : 'bg-brand-gradient'}`} />
                    )}

                    <div className="p-7">
                      {/* Name & description */}
                      <h3 className={`text-xl font-black mb-1 ${isPopular ? 'text-white' : 'text-navy'}`}>
                        {pkg.name}
                      </h3>
                      {pkg.description && (
                        <p className={`text-sm mb-5 leading-relaxed ${isPopular ? 'text-white/70' : 'text-muted'}`}>
                          {pkg.description}
                        </p>
                      )}

                      {/* Price */}
                      <div className="mb-6">
                        <div className={`flex items-end gap-1 ${isPopular ? 'text-white' : 'text-primary'}`}>
                          <span className="text-2xl font-bold">{symbol}</span>
                          <span className="text-5xl font-black leading-none">
                            {price.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className={`text-sm mt-1 ${isPopular ? 'text-white/60' : 'text-muted'}`}>
                          {pkg.validity ? `Valid for ${pkg.validity}` : `per ${pkg.period || 'month'}`}
                        </p>
                      </div>

                      {/* CTA */}
                      <Link
                        href="/auth/register"
                        className={`block text-center py-3.5 rounded-2xl font-bold text-sm transition-all mb-6 ${
                          isPopular
                            ? 'bg-white text-primary hover:bg-secondary hover:text-white'
                            : 'bg-brand-gradient text-white hover:opacity-90'
                        }`}
                      >
                        Get Started
                      </Link>

                      {/* Divider */}
                      <div className={`border-t mb-5 ${isPopular ? 'border-white/15' : 'border-primary/10'}`} />

                      {/* Features */}
                      <ul className="space-y-3">
                        {(pkg.features || []).map((f, fi) => (
                          <li key={fi} className={`flex items-start gap-3 text-sm ${isPopular ? 'text-white/85' : 'text-ink'}`}>
                            <CheckCircle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${isPopular ? 'text-secondary' : 'text-secondary'}`} />
                            {f}
                          </li>
                        ))}
                      </ul>

                      {/* Validity badge */}
                      {pkg.validity && (
                        <div className={`mt-5 flex items-center gap-2 text-xs font-semibold rounded-xl px-3 py-2 ${
                          isPopular ? 'bg-white/10 text-white/70' : 'bg-academic text-muted'
                        }`}>
                          <Clock className="h-3.5 w-3.5" />
                          {pkg.validity} access
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted">
            {[
              { icon: Shield, text: 'Secure Payments' },
              { icon: CheckCircle, text: 'Cancel Anytime' },
              { icon: Star, text: '4.9 Parent Rating' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-secondary" />
                <span className="font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 bg-soft-gradient">
        <div className="max-w-3xl mx-auto px-4">
          <SectionHeader badge="FAQ" title="Frequently Asked Questions" />
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-primary/10 overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-ink hover:bg-academic/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="h-5 w-5 text-primary flex-shrink-0" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 text-muted border-t border-primary/5 pt-3">{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MarketingShell />
    </div>
  )
}
