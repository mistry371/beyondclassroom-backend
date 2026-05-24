'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Phone, TrendingUp, AlertCircle, Eye, EyeOff } from 'lucide-react'
import promoterApi, { savePromoterSession } from '@/utils/promoterApi'

export default function PromoterRegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')
      const res = await promoterApi.post('/promoters/register', form)
      if (res.data.success) {
        savePromoterSession(res.data.token, res.data.promoter)
        router.push('/promoter/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-gradient flex items-center justify-center p-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="glass-dark rounded-3xl p-8 border border-white/10">
          <div className="text-center mb-8">
            <Image src="/logo.jpeg" alt="" width={48} height={48} className="rounded-xl mx-auto mb-4 interactive" />
            <h1 className="text-2xl font-black text-white">Become a Promoter</h1>
            <p className="text-white/60 text-sm mt-2">Start earning with referrals</p>
          </div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl mb-4 text-sm flex gap-2">
              <AlertCircle className="h-5 w-5" />{error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', icon: User, label: 'Full Name', type: 'text' },
              { key: 'email', icon: Mail, label: 'Email', type: 'email' },
              { key: 'phone', icon: Phone, label: 'Phone', type: 'tel' },
            ].map(({ key, icon: Icon, label, type }) => (
              <div key={key}>
                <label className="text-white/80 text-sm mb-1 block">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <input type={type} required value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-secondary"
                  />
                </div>
              </div>
            ))}
            <div>
              <label className="text-white/80 text-sm mb-1 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input type={showPassword ? 'text' : 'password'} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-secondary"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-4 bg-brand-gradient text-white font-bold rounded-xl flex items-center justify-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {loading ? 'Creating...' : 'Create Promoter Account'}
            </button>
          </form>
          <p className="text-center text-white/60 text-sm mt-6">
            Have an account? <Link href="/promoter/login" className="text-secondary font-semibold">Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
