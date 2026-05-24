'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  TrendingUp, Users, DollarSign, Link2, Copy, Check, QrCode,
  Bell, LogOut, Trophy, Target, Wallet, Share2, Flame, Award,
} from 'lucide-react'
import promoterApi, { clearPromoterSession, getStoredPromoter } from '@/utils/promoterApi'

export default function PromoterDashboardPage() {
  const router = useRouter()
  const [promoter, setPromoter] = useState(null)
  const [chartBars, setChartBars] = useState([0, 0, 0, 0, 0, 0, 0])
  const [history, setHistory] = useState([])
  const [copied, setCopied] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [notification, setNotification] = useState('')
  const [loading, setLoading] = useState(true)

  const loadDashboard = async () => {
    try {
      const res = await promoterApi.get('/promoters/dashboard')
      if (res.data.success) {
        setPromoter(res.data.promoter)
        setChartBars(res.data.chartBars || [0, 0, 0, 0, 0, 0, 0])
        setHistory(res.data.history || [])
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
    loadDashboard()
  }, [router])

  const copyLink = () => {
    if (!promoter?.referralLink) return
    navigator.clipboard.writeText(promoter.referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
    { label: 'Total Earnings', value: `₹${(promoter.earnings || 0).toLocaleString('en-IN')}`, icon: DollarSign, color: 'from-secondary to-primary' },
    { label: 'Students Joined', value: promoter.studentsJoined || 0, icon: Users, color: 'from-primary to-brandPurple' },
    { label: 'Referrals', value: promoter.referrals || 0, icon: TrendingUp, color: 'from-brandPurple to-brandPink' },
    { label: 'Pending Payout', value: `₹${(promoter.pendingPayout || 0).toLocaleString('en-IN')}`, icon: Wallet, color: 'from-accent to-orange' },
  ]

  return (
    <div className="min-h-screen bg-[#050B2B] text-white">
      <header className="border-b border-white/10 bg-[#050B2B]/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/promoter/dashboard" className="flex items-center gap-3">
            <Image src="/logo.jpeg" alt="" width={36} height={36} className="rounded-lg interactive" />
            <div>
              <p className="font-bold text-sm">Promoter Hub</p>
              <p className="text-white/50 text-xs">{promoter.name}</p>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/20 text-secondary text-sm font-semibold">
              <Trophy className="h-4 w-4" /> {promoter.rank || 'Bronze'}
            </span>
            <button className="relative p-2 hover:bg-white/10 rounded-lg"><Bell className="h-5 w-5" /></button>
            <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg text-red-400"><LogOut className="h-5 w-5" /></button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 pb-24">
        {notification && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-secondary/20 border border-secondary/40 rounded-xl text-secondary text-sm"
          >
            {notification}
          </motion.div>
        )}

        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
            <Flame className="h-5 w-5 text-accent" />
            <span className="font-semibold">{promoter.streak || 0} day streak</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-gradient">
            <Award className="h-5 w-5" />
            <span className="font-semibold">Code: {promoter.referralCode}</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6"
            >
              <s.icon className="h-8 w-8 text-secondary mb-3" />
              <p className="text-white/60 text-sm">{s.label}</p>
              <p className="text-2xl font-black mt-1">{s.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-6">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secondary" /> Referral Performance (7 days)
            </h3>
            <div className="flex items-end gap-3 h-40">
              {chartBars.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(h, 8)}%` }} transition={{ delay: i * 0.1 }}
                    className="w-full bg-brand-gradient rounded-t-lg min-h-[12px]"
                  />
                  <span className="text-xs text-white/40">D{i + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-brandPink" /> Milestones
            </h3>
            <div className="space-y-4">
              {(promoter.milestones || []).map((m) => {
                const pct = Math.min(100, (m.current / m.target) * 100)
                return (
                  <div key={m.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/80">{m.label}</span>
                      <span className="text-secondary">{m.current}/{m.target}</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-gradient rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" /> Your Referral Link
            </h3>
            <div className="flex gap-2 mb-4">
              <input readOnly value={promoter.referralLink || ''} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/90" />
              <button onClick={copyLink} className="px-4 py-3 bg-brand-gradient rounded-xl font-semibold flex items-center gap-2">
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={copyLink} className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-sm hover:bg-white/15">
                <Share2 className="h-4 w-4" /> Share
              </button>
              <button onClick={copyLink} className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-sm hover:bg-white/15">
                <QrCode className="h-4 w-4" /> Copy Link
              </button>
            </div>
            <p className="text-white/50 text-xs mt-4">Coupon: <span className="text-secondary font-mono">{promoter.referralCode}</span></p>
            <p className="text-white/40 text-xs mt-2">Commission rate: {((promoter.commissionRate || 0.2) * 100).toFixed(0)}% per paid enrollment</p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-accent" /> Withdrawal Request
            </h3>
            <p className="text-white/60 text-sm mb-4">Available: ₹{(promoter.pendingPayout || 0).toLocaleString('en-IN')} (min ₹500)</p>
            <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="Enter amount"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-4 text-white"
            />
            <button onClick={handleWithdraw} className="w-full py-3 bg-accent-gradient rounded-xl font-bold">
              Request Payout
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-white/5 border border-white/10 p-6">
          <h3 className="font-bold mb-4">Recent Activity</h3>
          {history.length === 0 ? (
            <p className="text-white/50 text-sm">No activity yet. Share your link to start earning!</p>
          ) : (
            <ul className="space-y-3">
              {history.map((h, i) => (
                <li key={i} className="flex justify-between text-sm border-b border-white/5 pb-2">
                  <span className="text-white/80 capitalize">
                    {h.type} {h.userName ? `— ${h.userName}` : ''} <span className="text-white/40">({h.status})</span>
                  </span>
                  <span className="text-secondary font-semibold">₹{h.amount}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}
