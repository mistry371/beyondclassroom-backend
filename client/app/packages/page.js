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
     

      <MarketingShell />
    </div>
  )
}
