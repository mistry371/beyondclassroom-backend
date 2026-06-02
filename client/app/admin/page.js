'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import {
  Users, BookOpen, DollarSign, Award, Activity,
  ShoppingCart, Bell, Settings, BarChart3, TrendingUp, Package,
} from 'lucide-react'
import { cachedGet } from '@/utils/api'
import { motion } from 'framer-motion'

export default function AdminDashboard() {
  const { authReady, user } = useAdminAuth()
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  useEffect(() => {
    if (!authReady) return
    fetchDashboardStats()
  }, [authReady])

  const fetchDashboardStats = async () => {
    setStatsLoading(true)
    setFetchError('')
    try {
      const res = await cachedGet('/admin/dashboard/stats', 30 * 1000)
      setStats(res.data.stats || {})
    } catch (error) {
      setFetchError(error.userMessage || 'Stats could not load. You can still use the menu below.')
      setStats({})
    } finally {
      setStatsLoading(false)
    }
  }

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers ?? '—', icon: Users, color: 'bg-primary/10 text-primary' },
    { title: 'Total Courses', value: stats?.totalCourses ?? '—', icon: BookOpen, color: 'bg-secondary/10 text-secondary' },
    { title: 'Total Revenue', value: stats?.totalRevenue != null ? `₹${Number(stats.totalRevenue).toFixed(2)}` : '—', icon: DollarSign, color: 'bg-green-100 text-green-600' },
    { title: 'Active Subscriptions', value: stats?.activeSubscriptions ?? '—', icon: Award, color: 'bg-amber-100 text-amber-600' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-800">Admin Dashboard</h1>
              <p className="text-slate-500 text-sm mt-0.5">Welcome back, {user?.name || 'Admin'}</p>
            </div>
            <Link href="/" className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all text-sm">
              Back to Site
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {fetchError && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex flex-wrap justify-between items-center gap-3">
            <span>{fetchError}</span>
            <button type="button" onClick={fetchDashboardStats} className="font-semibold underline">Retry stats</button>
          </div>
        )}

        {/* Stat Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 ${statsLoading ? 'opacity-60' : ''}`}>
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
            >
              <div className={`w-11 h-11 rounded-xl ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-slate-500 text-sm mb-1">{stat.title}</p>
              <p className="text-3xl font-black text-slate-800">{statsLoading ? '…' : stat.value}</p>
            </motion.div>
          ))}
        </div>

        <AdminSection title="Content Management">
          <QuickActionCard href="/admin/packages" title="Packages" description="Create & manage learning packages" icon={Package} color="bg-emerald-100 text-emerald-600" />
          <QuickActionCard href="/admin/promo-codes" title="Promo Codes" description="Monthly promo codes & discounts" icon={Award} color="bg-amber-100 text-amber-600" />
          <QuickActionCard href="/admin/modules" title="Modules" description="Manage course modules" icon={BookOpen} color="bg-primary/10 text-primary" />
          <QuickActionCard href="/admin/lessons" title="Lessons" description="Create and edit lessons" icon={BookOpen} color="bg-secondary/10 text-secondary" />
          <QuickActionCard href="/admin/subtopics" title="Subtopics" description="Manage lesson subtopics" icon={BookOpen} color="bg-teal-100 text-teal-600" />
          <QuickActionCard href="/admin/quizzes" title="Quizzes" description="Manage quizzes and questions" icon={BookOpen} color="bg-purple-100 text-purple-600" />
          <QuickActionCard href="/admin/custom-requests" title="Custom Requests" description="Manage student custom requests" icon={BookOpen} color="bg-pink-100 text-pink-600" />
          <QuickActionCard href="/admin/promoters" title="Promoters" description="Referrals, commissions & payouts" icon={Users} color="bg-secondary/10 text-secondary" />
          <QuickActionCard href="/admin/exams" title="Examinations" description="Create & manage full exams" icon={BookOpen} color="bg-red-100 text-red-600" />
          <QuickActionCard href="/admin/media" title="Media Library" description="Upload and manage media" icon={BookOpen} color="bg-violet-100 text-violet-600" />
        </AdminSection>

        <AdminSection title="Analytics & Reports">
          <QuickActionCard href="/admin/analytics" title="Analytics" description="View platform analytics" icon={BarChart3} color="bg-green-100 text-green-600" />
          <QuickActionCard href="/admin/progress" title="Progress Tracking" description="Monitor student progress" icon={TrendingUp} color="bg-blue-100 text-blue-600" />
          <QuickActionCard href="/admin/logs" title="Activity Logs" description="View system activity" icon={Activity} color="bg-slate-200 text-slate-600" />
          <QuickActionCard href="/admin/orders" title="Orders" description="Manage orders and payments" icon={ShoppingCart} color="bg-orange-100 text-orange-600" />
        </AdminSection>

        <AdminSection title="Communication">
          <QuickActionCard href="/admin/notifications" title="Notifications" description="Send notifications" icon={Bell} color="bg-yellow-100 text-yellow-600" />
          <QuickActionCard href="/admin/emails" title="Emails" description="Manage email campaigns" icon={Bell} color="bg-indigo-100 text-indigo-600" />
          <QuickActionCard href="/admin/announcements" title="Announcements" description="Platform announcements" icon={Bell} color="bg-pink-100 text-pink-600" />
          <QuickActionCard href="/admin/certificates" title="Certificates" description="Manage certificates" icon={Award} color="bg-amber-100 text-amber-600" />
        </AdminSection>

        <AdminSection title="Platform Management">
          <QuickActionCard href="/admin/users" title="Users" description="Manage all users" icon={Users} color="bg-primary/10 text-primary" />
          <QuickActionCard href="/admin/courses" title="Courses" description="Manage courses" icon={BookOpen} color="bg-secondary/10 text-secondary" />
          <QuickActionCard href="/admin/content" title="Content" description="Edit website content" icon={BookOpen} color="bg-teal-100 text-teal-600" />
          <QuickActionCard href="/admin/badges" title="Badges" description="Create achievement badges" icon={Award} color="bg-purple-100 text-purple-600" />
        </AdminSection>

        <AdminSection title="Security & Tools">
          <QuickActionCard href="/admin/security" title="Security" description="Monitor security" icon={Settings} color="bg-red-100 text-red-600" />
          <QuickActionCard href="/admin/tools" title="Tools" description="Manage learning tools" icon={Settings} color="bg-primary/10 text-primary" />
          <QuickActionCard href="/admin/settings" title="Settings" description="Platform settings" icon={Settings} color="bg-green-100 text-green-600" />
          <QuickActionCard href="/admin/live" title="Live Classes" description="Schedule & manage live sessions" icon={Activity} color="bg-orange-100 text-orange-600" />
        </AdminSection>

        {/* Recent Users */}
        {!statsLoading && stats?.recentUsers?.length > 0 && (
          <div className="mt-4">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Recent Users
              </h2>
              <div className="space-y-2">
                {stats.recentUsers.slice(0, 5).map((u) => (
                  <div key={u._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-slate-800 font-semibold text-sm">{u.name}</p>
                        <p className="text-slate-500 text-xs">{u.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function AdminSection({ title, children }) {
  return (
    <div className="mb-6">
      <h2 className="text-base font-bold text-slate-500 uppercase tracking-wide mb-3">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{children}</div>
    </div>
  )
}

function QuickActionCard({ href, title, description, icon: Icon, color }) {
  return (
    <Link
      href={href}
      className="block bg-white border border-slate-200 rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all cursor-pointer"
    >
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-4`}>
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-slate-500 text-sm">{description}</p>
    </Link>
  )
}
