'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import MarketingShell from '@/components/marketing/MarketingShell'
import SectionHeader from '@/components/marketing/SectionHeader'
import AnimatedCounter from '@/components/marketing/AnimatedCounter'
import ReviewsMarquee from '@/components/marketing/ReviewsMarquee'
import PartnersMarquee from '@/components/marketing/PartnersMarquee'
import PremiumButton from '@/components/marketing/PremiumButton'
import { motion } from 'framer-motion'
import {
  BookOpen, Users, Award, Calculator, Star, ArrowRight, Clock,
  Sparkles, Shield, TrendingUp, Target, Zap, CheckCircle, Gift,
} from 'lucide-react'
import Link from 'next/link'
import { cachedGet } from '@/utils/api'
import LiveStatsBar from '@/components/marketing/LiveStatsBar'
import TrustSection from '@/components/marketing/TrustSection'
import CourseCardSkeleton from '@/components/ui/CourseCardSkeleton'
import { stats, packages as packageData, promoterBenefits } from '@/data/marketingContent'

export default function Home() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cachedGet('/courses', 120000)
      .then((res) => setCourses(res.data.courses || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const statIcons = [Users, BookOpen, Calculator, Award]

  return (
    <div className="min-h-screen bg-academic pb-20 md:pb-0">
      <Navbar />
      <LiveStatsBar />
      <Hero />

      {/* Stats */}
      <section className="py-16 md:py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = statIcons[index]
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass-card premium-card p-6 md:p-8 text-center"
                >
                  <Icon className="h-10 w-10 text-primary mx-auto mb-4" />
                  <div className="text-3xl md:text-4xl font-black text-ink mb-1">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-muted font-medium">{stat.label}</div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Beyond Classroom */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Why Choose Us"
            title="Elite Education, Built for Results"
            subtitle="Personalized paths, live mentorship, and AI-powered tools — everything your child needs to excel."
          />
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: 'Personalized Learning', desc: 'Adaptive curriculum matched to pace, goals, and exam targets.' },
              { icon: Zap, title: 'Live Expert Classes', desc: 'Interactive sessions with verified educators and instant doubt solving.' },
              { icon: Sparkles, title: 'AI Math Tutor', desc: '24/7 intelligent support with step-by-step explanations.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="premium-card glass-card p-8"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center mb-5">
                  <item.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-ink mb-2">{item.title}</h3>
                <p className="text-muted leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages preview */}
      <section className="py-20 premium-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Pricing"
            title="Choose Your Learning Package"
            subtitle="Flexible plans for every ambition — from foundational mastery to elite mentorship."
          />
          <div className="grid md:grid-cols-3 gap-8 mb-10">
            {packageData.map((pkg, i) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={`relative rounded-3xl p-8 premium-card ${pkg.popular ? 'bg-brand-gradient text-white shadow-glow scale-[1.02] ring-4 ring-secondary/30' : 'glass-card'}`}
              >
                {pkg.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-white text-xs font-bold rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className={`text-2xl font-bold mb-2 ${pkg.popular ? 'text-white' : 'text-ink'}`}>{pkg.name}</h3>
                <div className={`text-4xl font-black mb-6 ${pkg.popular ? 'text-white' : 'text-primary'}`}>
                  ₹{pkg.inr.toLocaleString('en-IN')}
                  <span className={`text-sm font-normal ${pkg.popular ? 'text-white/80' : 'text-muted'}`}>/mo</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {pkg.features.slice(0, 5).map((f) => (
                    <li key={f} className={`flex items-center gap-2 text-sm ${pkg.popular ? 'text-white/90' : 'text-muted'}`}>
                      <CheckCircle className={`h-4 w-4 flex-shrink-0 ${pkg.popular ? 'text-white' : 'text-secondary'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/packages"
                  className={`block text-center py-3 rounded-xl font-bold transition-all ${pkg.popular ? 'bg-white text-primary hover:scale-105' : 'bg-brand-gradient text-white'}`}
                >
                  View Details
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <PremiumButton href="/packages" variant="outline">Compare All Packages</PremiumButton>
          </div>
        </div>
      </section>

      {/* Featured Courses — preserved API logic */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge="Courses"
            title="Featured Courses"
            subtitle="Master mathematics from Class 6 to 12, JEE, and Board exams with structured excellence."
          />
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => <CourseCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.slice(0, 9).map((course, index) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="group premium-card glass-card overflow-hidden flex flex-col"
                >
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex gap-2 mb-4">
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-semibold">{course.category}</span>
                      <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-lg text-xs font-semibold">{course.difficulty}</span>
                    </div>
                    <h3 className="text-lg font-bold text-ink mb-2 group-hover:text-primary transition-colors line-clamp-2">{course.title}</h3>
                    <p className="text-muted text-sm mb-4 line-clamp-2 flex-grow">{course.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted mb-4">
                      <span className="flex items-center gap-1"><Users className="h-4 w-4" />{course.enrolledCount || 0}</span>
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{course.duration}</span>
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        {course.rating}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                      {course.isFree || course.isDemo ? (
                        <span className="text-xl font-bold text-secondary">FREE</span>
                      ) : (
                        <span className="text-xl font-bold text-primary">₹{course.price}</span>
                      )}
                      <Link href={`/courses/${course._id}`} className="flex items-center gap-1 text-primary font-semibold hover:gap-2 transition-all">
                        View <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          {courses.length > 9 && (
            <div className="text-center mt-12">
              <PremiumButton href="/courses">View All {courses.length} Courses</PremiumButton>
            </div>
          )}
        </div>
      </section>

      {/* Promoter CTA */}
      <section className="py-20 relative overflow-hidden premium-section">
        <div className="absolute inset-0 hero-grid opacity-70" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionHeader
                badge="Earn With Us"
                title="Become a Beyond Classroom Promoter"
                subtitle="Share quality education, grow your network, and earn generous commissions."
                center={false}
              />
              <div className="grid sm:grid-cols-2 gap-4">
                {promoterBenefits.map((b) => (
                  <div key={b.title} className="glass-card rounded-xl p-4">
                    <Gift className="h-6 w-6 text-secondary mb-2" />
                    <p className="text-navy font-semibold text-sm">{b.title}</p>
                    <p className="text-muted text-xs mt-1">{b.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <PremiumButton href="/promoter" variant="primary">Explore Promoter Program</PremiumButton>
                <PremiumButton href="/promoter/register" variant="light">Join as Promoter</PremiumButton>
              </div>
            </div>
            <div className="rounded-3xl p-8 border border-primary/10 bg-white shadow-premium">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="h-10 w-10 text-secondary" />
                <div>
                  <p className="text-navy font-bold text-2xl">Up to 25%</p>
                  <p className="text-muted text-sm">Commission per referral</p>
                </div>
              </div>
              <div className="space-y-4">
                {['Generate unique referral link', 'Track students & earnings', 'Withdraw via secure payouts'].map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold text-sm">{i + 1}</span>
                    <span className="text-ink font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <SectionHeader badge="Reviews" title="Loved by Students & Parents" subtitle="Real stories from families who transformed their math journey." />
        </div>
        <ReviewsMarquee />
      </section>

      {/* Partners */}
      <section className="py-16 premium-section overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <SectionHeader badge="Partners" title="Trusted Institutional Collaborations" subtitle="Partnering with schools and education networks nationwide." />
        </div>
        <PartnersMarquee />
      </section>

      {/* Trust */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Shield, label: 'Secure Razorpay Payments' },
              { icon: Award, label: 'Verified Educators' },
              { icon: Users, label: '50K+ Happy Students' },
              { icon: Calculator, label: '40+ Math Tools' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center text-center p-6 glass-card rounded-2xl">
                <Icon className="h-10 w-10 text-primary mb-3" />
                <p className="font-semibold text-ink">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TrustSection />

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-gradient" />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to Excel in Mathematics & French?</h2>
            <p className="text-xl text-white/90 mb-10">Parents trust us. Students love us. Start your 3-day free trial — no card required.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <PremiumButton href="/auth/register" variant="white">Start Learning Today</PremiumButton>
              <PremiumButton href="/courses" variant="secondary">Get Personalized Practice</PremiumButton>
            </div>
          </motion.div>
        </div>
      </section>

      <MarketingShell />
    </div>
  )
}
