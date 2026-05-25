'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import {
  Users, BookOpen, DollarSign, TrendingUp, Activity,
  ShoppingCart, Award, Bell, Settings, BarChart3,
} from 'lucide-react'
import api from '@/utils/api'
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
    { title: 'Total Users', value: stats?.totalUsers ?? '—', icon: Users, color: 'from-primary to-secondary', change: stats?.userGrowth?.percentage || 0 },
    { title: 'Total Courses', value: stats?.totalCourses ?? '—', icon: BookOpen, color: 'from-secondary to-accent', change: 0 },
    { title: 'Total Revenue', value: stats?.totalRevenue != null ? `₹${Number(stats.totalRevenue).toFixed(2)}` : '—', icon: DollarSign, color: 'from-green-500 to-emerald-500', change: 0 },
    { title: 'Active Subscriptions', value: stats?.activeSubscriptions ?? '—', icon: Award, color: 'from-orange-500 to-red-500', change: 0 },
  ]

  return (
    <div className="min-h-screen bg-dark">
      <div className="bg-gradient-to-r from-dark-100 via-dark-100 to-dark-100 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-400 mt-1">Welcome back, {user?.name || 'Admin'}</p>
            </div>
            <Link href="/" className="px-4 py-2 bg-dark-200 text-white rounded-lg hover:bg-gray-600 transition-all">
              Back to Site
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {fetchError && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-sm flex flex-wrap justify-between items-center gap-3">
            <span>{fetchError}</span>
            <button type="button" onClick={fetchDashboardStats} className="font-semibold underline text-white">
              Retry stats
            </button>
          </div>
        )}

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 ${statsLoading ? 'opacity-60' : ''}`}>
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl"
            >
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} w-fit mb-4`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-white">{statsLoading ? '...' : stat.value}</p>
            </motion.div>
          ))}
        </div>

        <AdminSection title="Content Management">
          <QuickActionCard href="/admin/modules" title="Modules" description="Manage course modules" icon={BookOpen} color="from-primary to-secondary" />
          <QuickActionCard href="/admin/lessons" title="Lessons" description="Create and edit lessons" icon={BookOpen} color="from-secondary to-accent" />
          <QuickActionCard href="/admin/subtopics" title="Subtopics" description="Manage lesson subtopics" icon={BookOpen} color="from-teal-500 to-cyan-500" />
          <QuickActionCard href="/admin/quizzes" title="Quizzes" description="Manage quizzes and questions" icon={BookOpen} color="from-accent to-primary" />
          <QuickActionCard href="/admin/custom-requests" title="Custom Requests" description="Manage student custom requests" icon={BookOpen} color="from-pink-500 to-rose-500" />
          <QuickActionCard href="/admin/promoters" title="Promoters" description="Referrals, commissions & payouts" icon={Users} color="from-secondary to-primary" />
          <QuickActionCard href="/admin/exams" title="Examinations" description="Create & manage full exams" icon={BookOpen} color="from-red-500 to-orange-500" />
          <QuickActionCard href="/admin/media" title="Media Library" description="Upload and manage media" icon={BookOpen} color="from-purple-500 to-pink-500" />
        </AdminSection>

        <AdminSection title="Analytics & Reports">
          <QuickActionCard href="/admin/analytics" title="Analytics" description="View platform analytics" icon={BarChart3} color="from-green-500 to-emerald-500" />
          <QuickActionCard href="/admin/progress" title="Progress Tracking" description="Monitor student progress" icon={TrendingUp} color="from-blue-500 to-cyan-500" />
          <QuickActionCard href="/admin/logs" title="Activity Logs" description="View system activity" icon={Activity} color="from-gray-500 to-slate-500" />
          <QuickActionCard href="/admin/orders" title="Orders" description="Manage orders and payments" icon={ShoppingCart} color="from-orange-500 to-red-500" />
        </AdminSection>

        <AdminSection title="Communication">
          <QuickActionCard href="/admin/notifications" title="Notifications" description="Send notifications" icon={Bell} color="from-yellow-500 to-orange-500" />
          <QuickActionCard href="/admin/emails" title="Emails" description="Manage email campaigns" icon={Bell} color="from-indigo-500 to-purple-500" />
          <QuickActionCard href="/admin/announcements" title="Announcements" description="Platform announcements" icon={Bell} color="from-pink-500 to-rose-500" />
          <QuickActionCard href="/admin/certificates" title="Certificates" description="Manage certificates" icon={Award} color="from-amber-500 to-yellow-500" />
        </AdminSection>

        <AdminSection title="Platform Management">
          <QuickActionCard href="/admin/users" title="Users" description="Manage all users" icon={Users} color="from-primary to-secondary" />
          <QuickActionCard href="/admin/courses" title="Courses" description="Manage courses" icon={BookOpen} color="from-secondary to-accent" />
          <QuickActionCard href="/admin/content" title="Content" description="Edit website content" icon={BookOpen} color="from-teal-500 to-cyan-500" />
          <QuickActionCard href="/admin/badges" title="Badges" description="Create achievement badges" icon={Award} color="from-purple-500 to-pink-500" />
        </AdminSection>

        <AdminSection title="Security & Tools">
          <QuickActionCard href="/admin/security" title="Security" description="Monitor security" icon={Settings} color="from-pink-500 to-rose-500" />
          <QuickActionCard href="/admin/tools" title="Tools" description="Manage learning tools" icon={Settings} color="from-primary to-secondary" />
          <QuickActionCard href="/admin/settings" title="Settings" description="Platform settings" icon={Settings} color="from-green-500 to-emerald-500" />
          <QuickActionCard href="/admin/live" title="Live Classes" description="Schedule & manage live sessions" icon={Activity} color="from-orange-500 to-red-500" />
        </AdminSection>

        {!statsLoading && stats?.recentUsers?.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <div className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Recent Users
              </h2>
              <div className="space-y-3">
                {stats.recentUsers.slice(0, 5).map((u) => (
                  <div key={u._id} className="flex items-center justify-between p-3 bg-dark-200/30 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{u.name}</p>
                      <p className="text-gray-400 text-sm">{u.email}</p>
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
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{children}</div>
    </div>
  )
}

function QuickActionCard({ href, title, description, icon: Icon, color }) {
  return (
    <Link
      href={href}
      className="block bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-left hover:border-primary/40 hover:scale-[1.02] transition-all cursor-pointer relative z-10"
    >
      <div className={`p-3 rounded-xl bg-gradient-to-r ${color} w-fit mb-4`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </Link>
  )
}
