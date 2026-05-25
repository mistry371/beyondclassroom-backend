'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Phone, Lock, TrendingUp, AlertCircle, Eye, EyeOff } from 'lucide-react'
import promoterApi, { savePromoterSession } from '@/utils/promoterApi'

export default function PromoterLoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      const res = await promoterApi.post('/promoters/login', {
        phone: phone.trim(),
        password,
      }, { timeout: 45000 })
      if (res.data.success) {
        savePromoterSession(res.data.token, res.data.promoter)
        router.push('/promoter/dashboard')
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Server is busy or waking up. Please wait 30-60 seconds and try again.')
      } else {
        setError(err.userMessage || err.response?.data?.message || 'Login failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-gradient flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="glass-dark rounded-3xl p-8 border border-white/10 shadow-premium">
          <div className="text-center mb-8">
            <Image src="/logo.jpeg" alt="" width={56} height={56} className="rounded-xl mx-auto mb-4 interactive" />
            <div className="w-14 h-14 bg-brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white">Promoter Login</h1>
            <p className="text-white/60 text-sm mt-2">Access your referral dashboard</p>
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl mb-4 text-sm flex gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />{error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-white/80 text-sm font-medium mb-2 block">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-secondary"
                  placeholder="9876543210"
                />
              </div>
            </div>
            <div>
              <label className="text-white/80 text-sm font-medium mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-secondary"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 bg-brand-gradient text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In to Dashboard'}
            </button>
          </form>
          <p className="text-center text-white/60 text-sm mt-6">
            New promoter? <Link href="/promoter/register" className="text-secondary font-semibold">Register here</Link>
          </p>
          <p className="text-center mt-4">
            <Link href="/promoter" className="text-white/50 text-sm hover:text-white">← Back to program</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
