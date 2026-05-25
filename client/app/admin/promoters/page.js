'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/utils/api'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { Trophy, Wallet, Users, Check, X } from 'lucide-react'

export default function AdminPromotersPage() {
  const router = useRouter()
  const { isAdmin, loading: authLoading } = useAdminAuth()
  const [promoters, setPromoters] = useState([])
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!isAdmin) {
      router.replace('/auth/login?redirect=%2Fadmin%2Fpromoters')
      return
    }
    loadData()
  }, [isAdmin, authLoading, router])

  const loadData = async () => {
    try {
      const [pRes, payRes] = await Promise.all([
        api.get('/promoters/admin/list'),
        api.get('/promoters/admin/payouts'),
      ])
      if (pRes.data.success) setPromoters(pRes.data.promoters || [])
      if (payRes.data.success) setPayouts(payRes.data.payouts || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const processPayout = async (id, status) => {
    try {
      await api.put(`/promoters/admin/payouts/${id}`, { status })
      await loadData()
    } catch (e) {
      alert(e.response?.data?.message || 'Failed')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => router.push('/admin')} className="text-gray-400 hover:text-primary mb-6">
          ← Back to Admin
        </button>
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" /> Promoter Management
        </h1>

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="h-5 w-5" /> Promoters ({promoters.length})
          </h2>
          <div className="bg-dark-100 rounded-xl border border-primary/20 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-primary/10">
                  <th className="p-4 text-left">Name</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">Code</th>
                  <th className="p-4 text-center">Referrals</th>
                  <th className="p-4 text-right">Earnings</th>
                  <th className="p-4 text-right">Pending</th>
                </tr>
              </thead>
              <tbody>
                {promoters.map((p) => (
                  <tr key={p.id} className="border-b border-primary/5 text-gray-300">
                    <td className="p-4">{p.name}</td>
                    <td className="p-4">{p.email}</td>
                    <td className="p-4 font-mono text-primary">{p.referralCode}</td>
                    <td className="p-4 text-center">{p.referrals}</td>
                    <td className="p-4 text-right text-secondary">₹{p.earnings?.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-right">₹{p.pendingPayout?.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Wallet className="h-5 w-5" /> Payout Requests
          </h2>
          <div className="space-y-4">
            {payouts.filter((p) => p.status === 'pending').length === 0 && (
              <p className="text-gray-500">No pending payouts</p>
            )}
            {payouts.filter((p) => p.status === 'pending').map((p) => (
              <div key={p._id} className="bg-dark-100 rounded-xl p-4 border border-primary/20 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-white font-semibold">{p.promoterName}</p>
                  <p className="text-gray-400 text-sm">{p.promoterEmail}</p>
                  <p className="text-primary font-bold mt-1">₹{p.amount?.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => processPayout(p._id, 'paid')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-1 hover:bg-green-500"
                  >
                    <Check className="h-4 w-4" /> Approve & Pay
                  </button>
                  <button onClick={() => processPayout(p._id, 'rejected')}
                    className="px-4 py-2 bg-red-600/80 text-white rounded-lg flex items-center gap-1 hover:bg-red-500"
                  >
                    <X className="h-4 w-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
