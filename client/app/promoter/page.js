'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import promoterApi from '@/utils/promoterApi'
import MarketingShell from '@/components/marketing/MarketingShell'
import SectionHeader from '@/components/marketing/SectionHeader'
import PremiumButton from '@/components/marketing/PremiumButton'
import AnimatedCounter from '@/components/marketing/AnimatedCounter'
import { motion } from 'framer-motion'
import {
  promoterBenefits, promoterTestimonials, promoterLeaderboard,
} from '@/data/marketingContent'
import {
  TrendingUp, Link2, QrCode, Share2, Calculator, Trophy, Zap, Gift,
} from 'lucide-react'
import Link from 'next/link'

export default function PromoterLandingPage() {
  const [referrals, setReferrals] = useState(10)
  const [avgPackage, setAvgPackage] = useState(7999)
  const [leaderboard, setLeaderboard] = useState(promoterLeaderboard)
  const commission = 0.2
  const estimated = Math.round(referrals * avgPackage * commission)

  useEffect(() => {
    promoterApi.get('/promoters/leaderboard?limit=5')
      .then((res) => {
        if (res.data.success && res.data.leaderboard?.length) {
          setLeaderboard(res.data.leaderboard)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-soft-gradient pb-20 md:pb-0">
      <Navbar />

      <section className="relative py-24 bg-navy-gradient overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}>
              <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary font-bold text-sm mb-6">
                Promoter Program
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                Earn While You <span className="bg-brand-gradient bg-clip-text text-transparent">Empower</span> Learners
              </h1>
              <p className="text-white/80 text-xl mb-8 leading-relaxed">
                Join our promoter ecosystem. Share Beyond Classroom, refer students, and build a rewarding income stream.
              </p>
              <div className="flex flex-wrap gap-4">
                <PremiumButton href="/promoter/register" variant="primary">Become a Promoter</PremiumButton>
                <PremiumButton href="/promoter/login" variant="secondary">Promoter Login</PremiumButton>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-dark rounded-3xl p-8 border border-white/10">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-3xl font-black text-secondary"><AnimatedCounter value={25} suffix="%" /></div>
                  <p className="text-white/60 text-sm">Max Commission</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-3xl font-black text-white">₹<AnimatedCounter value={62000} /></div>
                  <p className="text-white/60 text-sm">Top Monthly Earn</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-brand-gradient/20 rounded-xl border border-secondary/30">
                <Trophy className="h-10 w-10 text-accent" />
                <div>
                  <p className="text-white font-bold">Gamified Leaderboard</p>
                  <p className="text-white/60 text-sm">Badges, streaks & milestone bonuses</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader badge="Benefits" title="Why Promote Beyond Classroom?" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {promoterBenefits.map((b, i) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="glass-card p-6 premium-card">
                <Gift className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-bold text-ink mb-2">{b.title}</h3>
                <p className="text-muted text-sm">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-soft-gradient">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12">
          <div>
            <SectionHeader badge="Calculator" title="Earnings Calculator" center={false} />
            <div className="glass-card p-8 rounded-2xl">
              <label className="block text-sm font-medium text-ink mb-2">Monthly Referrals</label>
              <input type="range" min="1" max="50" value={referrals} onChange={(e) => setReferrals(+e.target.value)} className="w-full accent-primary mb-2" />
              <p className="text-primary font-bold mb-6">{referrals} students/month</p>
              <label className="block text-sm font-medium text-ink mb-2">Avg. Package Value (₹)</label>
              <select value={avgPackage} onChange={(e) => setAvgPackage(+e.target.value)} className="w-full p-3 rounded-xl border border-primary/20 mb-6">
                <option value={2999}>Starter — ₹2,999</option>
                <option value={7999}>Pro — ₹7,999</option>
                <option value={14999}>Elite — ₹14,999</option>
              </select>
              <div className="p-6 bg-brand-gradient rounded-2xl text-white text-center">
                <p className="text-white/80 text-sm">Estimated Monthly Earnings (20%)</p>
                <p className="text-4xl font-black mt-2">₹{estimated.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
          <div>
            <SectionHeader badge="How It Works" title="Referral Process" center={false} />
            {[
              { icon: Link2, step: '1', title: 'Sign Up & Get Link', desc: 'Register as promoter and receive your unique referral code.' },
              { icon: Share2, step: '2', title: 'Share & Invite', desc: 'Share via WhatsApp, social media, or QR code.' },
              { icon: TrendingUp, step: '3', title: 'Track & Earn', desc: 'Monitor signups in your dashboard and earn commissions.' },
              { icon: QrCode, step: '4', title: 'Withdraw', desc: 'Request payouts when you hit milestones.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 mb-6 glass-card p-5 rounded-xl">
                <div className="w-12 h-12 bg-brand-gradient rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">{item.step}</div>
                <div>
                  <h4 className="font-bold text-ink flex items-center gap-2"><item.icon className="h-4 w-4 text-primary" />{item.title}</h4>
                  <p className="text-muted text-sm mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader badge="Leaderboard" title="Top Promoters This Month" />
          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-primary/5">
                <tr>
                  <th className="p-4 text-left font-bold text-ink">Rank</th>
                  <th className="p-4 text-left font-bold text-ink">Promoter</th>
                  <th className="p-4 text-center font-bold text-ink">Referrals</th>
                  <th className="p-4 text-right font-bold text-ink">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row) => (
                  <tr key={row.rank} className="border-t border-primary/5 hover:bg-primary/5">
                    <td className="p-4">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${row.rank <= 3 ? 'bg-brand-gradient text-white' : 'bg-gray-100 text-muted'}`}>
                        {row.rank}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-ink">{row.name}</td>
                    <td className="p-4 text-center text-muted">{row.referrals}</td>
                    <td className="p-4 text-right font-bold text-secondary">{row.earnings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-20 bg-soft-gradient">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader badge="Stories" title="Promoter Success Stories" />
          <div className="grid md:grid-cols-3 gap-8">
            {promoterTestimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="glass-card p-8 premium-card">
                <p className="text-muted italic mb-6">&ldquo;{t.text}&rdquo;</p>
                <p className="font-bold text-ink">{t.name}</p>
                <p className="text-secondary font-semibold">{t.earnings}</p>
                <p className="text-sm text-muted mt-1">{t.referrals} referrals</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-brand-gradient text-center">
        <Zap className="h-12 w-12 text-white mx-auto mb-4" />
        <h2 className="text-3xl font-black text-white mb-4">Start Earning Today</h2>
        <PremiumButton href="/promoter/register" variant="white">Join Promoter Program</PremiumButton>
      </section>

      <MarketingShell />
    </div>
  )
}
