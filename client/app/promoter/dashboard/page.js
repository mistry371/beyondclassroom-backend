'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  TrendingUp, Users, DollarSign, Link2, Copy, Check, QrCode,
  Bell, LogOut, Trophy, Target, Wallet, Share2, Flame, Award, MessageCircle,
} from 'lucide-react'
import promoterApi, { clearPromoterSession, getStoredPromoter } from '@/utils/promoterApi'
import PromoterOnboarding from '@/components/promoter/PromoterOnboarding'

export default function PromoterDashboardPage() {
  const router = useRouter()
  const [promoter, setPromoter] = useState(null)
  const [chartBars, setChartBars] = useState([0, 0, 0, 0, 0, 0, 0])
  const [history, setHistory] = useState([])
  const [payouts, setPayouts] = useState([])
  const [conversionRate, setConversionRate] = useState(0)
  const [badges, setBadges] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [copied, setCopied] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [notification, setNotification] = useState('')
  const [loading, setLoading] = useState(true)
  const [showTour, setShowTour] = useState(false)

  const qrUrl = useMemo(() => {
    if (!promoter?.referralLink) return ''
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(promoter.referralLink)}`
  }, [promoter?.referralLink])

  const loadDashboard = async () => {
    try {
      const res = await promoterApi.get('/promoters/dashboard')
      if (res.data.success) {
        setPromoter(res.data.promoter)
        setChartBars(res.data.chartBars || [0, 0, 0, 0, 0, 0, 0])
        setHistory(res.data.history || [])
        setPayouts(res.data.payouts || [])
        setConversionRate(res.data.conversionRate ?? 0)
        setBadges(res.data.badges || [])
        localStorage.setItem('promoter', JSON.stringify(res.data.promoter))
      }
    } catch (err) {
      if (err.response?.status === 401) {
        clearPromoterSession()
        router.replace('/promoter/login')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const stored = getStoredPromoter()
    if (!stored && !localStorage.getItem('promoterToken')) {
      router.replace('/promoter/login')
      return
    }
    if (stored) setPromoter(stored)
    if (!localStorage.getItem('promoterTourDone')) setShowTour(true)
    loadDashboard()
    promoterApi.get('/promoters/leaderboard?limit=5').then((r) => {
      if (r.data.success) setLeaderboard(r.data.leaderboard || [])
    }).catch(() => {})
  }, [router])

  const copyLink = () => {
    if (!promoter?.referralLink) return
    navigator.clipboard.writeText(promoter.referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareWhatsApp = () => {
    const text = `Join Beyond Classroom — premium Mathematics learning for Class 1–8! Use my link: ${promoter?.referralLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  }

  const handleWithdraw = async () => {
    const amt = parseInt(withdrawAmount, 10)
    if (!amt) return setNotification('Enter a valid amount')
    try {
      setNotification('')
      const res = await promoterApi.post('/promoters/withdraw', { amount: amt })
      if (res.data.success) {
        setNotification(res.data.message)
        setWithdrawAmount('')
        await loadDashboard()
      }
    } catch (err) {
      setNotification(err.response?.data?.message || 'Withdrawal failed')
    }
    setTimeout(() => setNotification(''), 4000)
  }

  const handleLogout = () => {
    clearPromoterSession()
    router.push('/promoter/login')
  }

  if (loading && !promoter) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary" />
      </div>
    )
  }

  if (!promoter) return null

  const stats = [
    { label: 'Total Earnings', value: `₹${(promoter.earnings || 0).toLocaleString('en-IN')}`, icon: DollarSign },
    { label: 'Students Joined', value: promoter.studentsJoined || 0, icon: Users },
    { label: 'Referrals', value: promoter.referrals || 0, icon: TrendingUp },
    { label: 'Conversion', value: `${conversionRate}%`, icon: Target },
  ]

  return (
    <div className="min-h-screen bg-[#050B2B] text-white">
      {showTour && <PromoterOnboarding onDone={() => setShowTour(false)} />}

      <header className="border-b border-white/10 bg-[#050B2B]/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/promoter/dashboard" className="flex items-center gap-3">
            <Image src="/logo.jpeg" alt="" width={36} height={36} className="rounded-lg interactive" priority />
            <div>
              <p className="font-bold text-sm">Promoter Hub</p>
              <p className="text-white/50 text-xs">{promoter.name}</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/20 text-secondary text-sm font-semibold">
              <Trophy className="h-4 w-4" /> {promoter.rank || 'Bronze'}
            </span>
            <button type="button" className="relative p-2 hover:bg-white/10 rounded-lg" aria-label="Notifications"><Bell className="h-5 w-5" /></button>
            <button type="button" onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg text-red-400" aria-label="Logout"><LogOut className="h-5 w-5" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 pb-28 md:pb-8">
        {notification && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-secondary/20 border border-secondary/40 rounded-xl text-secondary text-sm"
          >
            {notification}
          </motion.div>
        )}

        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 gpu-accelerated">
            <Flame className="h-5 w-5 text-accent" />
            <span className="font-semibold">{promoter.streak || 0} day streak</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-gradient">
            <Award className="h-5 w-5" />
            <span className="font-semibold font-mono">{promoter.referralCode}</span>
          </div>
          {badges.map((b) => (
            <span key={b.id} className="px-3 py-1.5 rounded-full bg-white/10 text-sm" title={b.label}>
              {b.icon} {b.label}
            </span>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="rounded-2xl bg-white/5 border border-white/10 p-5 gpu-accelerated hover:border-secondary/30 transition-colors"
            >
              <s.icon className="h-7 w-7 text-secondary mb-2" />
              <p className="text-white/60 text-xs">{s.label}</p>
              <p className="text-2xl font-black mt-1">{s.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secondary" /> Referral growth (7 days)
            </h3>
            <div className="flex items-end gap-2 h-36">
              {chartBars.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(h, 6)}%` }} transition={{ delay: i * 0.06 }}
                    className="w-full bg-brand-gradient rounded-t-md min-h-[8px] gpu-accelerated"
                    style={{ maxHeight: '100%' }}
                  />
                  <span className="text-[10px] text-white/40">D{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Trophy className="h-5 w-5 text-accent" /> Leaderboard</h3>
            <ul className="space-y-2">
              {leaderboard.length === 0 ? (
                <p className="text-white/50 text-sm">Loading rankings…</p>
              ) : leaderboard.map((row) => (
                <li key={row.rank} className="flex justify-between text-sm py-2 border-b border-white/5">
                  <span>#{row.rank} {row.name}</span>
                  <span className="text-secondary font-semibold">{row.earnings}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Link2 className="h-5 w-5 text-primary" /> Referral toolkit</h3>
            <div className="flex gap-2 mb-4">
              <input readOnly value={promoter.referralLink || ''} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm" aria-label="Referral link" />
              <button type="button" onClick={copyLink} className="px-4 py-3 bg-brand-gradient rounded-xl font-semibold">
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
            {qrUrl && (
              <div className="flex flex-col sm:flex-row gap-6 items-center mb-4 p-4 bg-white/5 rounded-xl">
                <img src={qrUrl} alt="Referral QR code" width={140} height={140} className="rounded-lg bg-white p-2 interactive" />
                <p className="text-white/60 text-sm">Scan to register with your referral code automatically applied.</p>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={shareWhatsApp} className="flex items-center gap-2 px-4 py-2.5 bg-[#25D366]/20 text-[#25D366] rounded-xl text-sm font-semibold hover:bg-[#25D366]/30">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </button>
              <button type="button" onClick={copyLink} className="flex items-center gap-2 px-4 py-2.5 bg-white/10 rounded-xl text-sm hover:bg-white/15">
                <Share2 className="h-4 w-4" /> Share link
              </button>
              <button type="button" onClick={() => setShowTour(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white/10 rounded-xl text-sm">
                <QrCode className="h-4 w-4" /> Tour
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Target className="h-5 w-5 text-brandPink" /> Milestones</h3>
              <div className="space-y-3">
                {(promoter.milestones || []).map((m) => {
                  const pct = Math.min(100, (m.current / m.target) * 100)
                  return (
                    <div key={m.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{m.label}</span>
                        <span className="text-secondary">{m.current}/{m.target}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-gradient rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2"><Wallet className="h-5 w-5 text-accent" /> Request payout</h3>
              <p className="text-white/60 text-sm mb-3">Available: ₹{(promoter.pendingPayout || 0).toLocaleString('en-IN')} (min ₹500)</p>
              <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="Amount in ₹"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-3"
              />
              <button type="button" onClick={handleWithdraw} className="w-full py-3 bg-accent-gradient rounded-xl font-bold">Request Payout</button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h3 className="font-bold mb-4">Payout history</h3>
            {payouts.length === 0 ? (
              <p className="text-white/50 text-sm">No payouts yet.</p>
            ) : (
              <ul className="space-y-2 max-h-48 overflow-y-auto scroll-smooth-touch">
                {payouts.slice(0, 10).map((p, i) => (
                  <li key={i} className="flex justify-between text-sm border-b border-white/5 pb-2">
                    <span>₹{p.amount} <span className="text-white/40">({p.status})</span></span>
                    <span className="text-white/50">{new Date(p.createdAt).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h3 className="font-bold mb-4">Recent activity</h3>
            {history.length === 0 ? (
              <p className="text-white/50 text-sm">Share your link to start earning!</p>
            ) : (
              <ul className="space-y-2 max-h-48 overflow-y-auto scroll-smooth-touch">
                {history.map((h, i) => (
                  <li key={i} className="flex justify-between text-sm border-b border-white/5 pb-2">
                    <span className="capitalize">{h.type} {h.userName ? `— ${h.userName}` : ''}</span>
                    <span className="text-secondary font-semibold">₹{h.amount}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
