'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { 
  Users, BookOpen, DollarSign, TrendingUp, Activity, 
  ShoppingCart, Award, Bell, Settings, BarChart3 
} from 'lucide-react'
import api from '@/utils/api'
import { motion } from 'framer-motion'

export default function AdminDashboard() {
  const router = useRouter()
  const { user, isAuthenticated } = useSelector(state => state.auth)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication and role
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    
    if (user && user.role !== 'admin' && user.role !== 'super_admin') {
      router.push('/dashboard')
      return
    }
    
    if (user) {
      fetchDashboardStats()
    }
  }, [user, isAuthenticated])

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/admin/dashboard/stats')
      setStats(res.data.stats)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'from-primary to-secondary',
      change: stats?.userGrowth?.percentage || 0
    },
    {
      title: 'Total Courses',
      value: stats?.totalCourses || 0,
      icon: BookOpen,
      color: 'from-secondary to-accent',
      change: 0
    },
    {
      title: 'Total Revenue',
      value: `₹${stats?.totalRevenue?.toFixed(2) || 0}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      change: 0
    },
    {
      title: 'Active Subscriptions',
      value: stats?.activeSubscriptions || 0,
      icon: Award,
      color: 'from-orange-500 to-red-500',
      change: 0
    }
  ]

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <div className="bg-gradient-to-r from-dark-100 via-dark-100 to-dark-100 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-400 mt-1">Welcome back, {user?.name}</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-dark-200 text-white rounded-lg hover:bg-gray-600 transition-all"
            >
              Back to Site
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                {stat.change !== 0 && (
                  <div className={`flex items-center gap-1 text-sm ${stat.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <TrendingUp className="h-4 w-4" />
                    {stat.change > 0 ? '+' : ''}{stat.change}%
                  </div>
                )}
              </div>
              <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions - All 20 Modules */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Content Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionCard
              title="Modules"
              description="Manage course modules"
              icon={BookOpen}
              color="from-primary to-secondary"
              onClick={() => router.push('/admin/modules')}
            />
            <QuickActionCard
              title="Lessons"
              description="Create and edit lessons"
              icon={BookOpen}
              color="from-secondary to-accent"
              onClick={() => router.push('/admin/lessons')}
            />
            <QuickActionCard
              title="Subtopics"
              description="Manage lesson subtopics"
              icon={BookOpen}
              color="from-teal-500 to-cyan-500"
              onClick={() => router.push('/admin/subtopics')}
            />
            <QuickActionCard
              title="Quizzes"
              description="Manage quizzes and questions"
              icon={BookOpen}
              color="from-accent to-primary"
              onClick={() => router.push('/admin/quizzes')}
            />
            <QuickActionCard
              title="Examinations"
              description="Create & manage full exams"
              icon={BookOpen}
              color="from-red-500 to-orange-500"
              onClick={() => router.push('/admin/exams')}
            />
            <QuickActionCard
              title="Media Library"
              description="Upload and manage media"
              icon={BookOpen}
              color="from-purple-500 to-pink-500"
              onClick={() => router.push('/admin/media')}
            />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Analytics & Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionCard
              title="Analytics"
              description="View platform analytics"
              icon={BarChart3}
              color="from-green-500 to-emerald-500"
              onClick={() => router.push('/admin/analytics')}
            />
            <QuickActionCard
              title="Progress Tracking"
              description="Monitor student progress"
              icon={TrendingUp}
              color="from-blue-500 to-cyan-500"
              onClick={() => router.push('/admin/progress')}
            />
            <QuickActionCard
              title="Activity Logs"
              description="View system activity"
              icon={Activity}
              color="from-gray-500 to-slate-500"
              onClick={() => router.push('/admin/logs')}
            />
            <QuickActionCard
              title="Orders"
              description="Manage orders and payments"
              icon={ShoppingCart}
              color="from-orange-500 to-red-500"
              onClick={() => router.push('/admin/orders')}
            />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Communication</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionCard
              title="Notifications"
              description="Send notifications"
              icon={Bell}
              color="from-yellow-500 to-orange-500"
              onClick={() => router.push('/admin/notifications')}
            />
            <QuickActionCard
              title="Emails"
              description="Manage email campaigns"
              icon={Bell}
              color="from-indigo-500 to-purple-500"
              onClick={() => router.push('/admin/emails')}
            />
            <QuickActionCard
              title="Announcements"
              description="Platform announcements"
              icon={Bell}
              color="from-pink-500 to-rose-500"
              onClick={() => router.push('/admin/announcements')}
            />
            <QuickActionCard
              title="Certificates"
              description="Manage certificates"
              icon={Award}
              color="from-amber-500 to-yellow-500"
              onClick={() => router.push('/admin/certificates')}
            />
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Platform Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionCard
              title="Users"
              description="Manage all users"
              icon={Users}
              color="from-primary to-secondary"
              onClick={() => router.push('/admin/users')}
            />
            <QuickActionCard
              title="Courses"
              description="Manage courses"
              icon={BookOpen}
              color="from-secondary to-accent"
              onClick={() => router.push('/admin/courses')}
            />
            <QuickActionCard
              title="Content"
              description="Edit website content"
              icon={BookOpen}
              color="from-teal-500 to-green-500"
              onClick={() => router.push('/admin/content')}
            />
            <QuickActionCard
              title="Badges"
              description="Create achievement badges"
              icon={Award}
              color="from-violet-500 to-purple-500"
              onClick={() => router.push('/admin/badges')}
            />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Security & Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionCard
              title="Security"
              description="Monitor security"
              icon={Settings}
              color="from-red-500 to-pink-500"
              onClick={() => router.push('/admin/security')}
            />
            <QuickActionCard
              title="Tools"
              description="Manage learning tools"
              icon={Settings}
              color="from-cyan-500 to-blue-500"
              onClick={() => router.push('/admin/tools')}
            />
            <QuickActionCard
              title="Settings"
              description="Platform settings"
              icon={Settings}
              color="from-green-500 to-emerald-500"
              onClick={() => router.push('/admin/settings')}
            />
            <QuickActionCard
              title="Live Classes"
              description="Schedule & manage live sessions"
              icon={Activity}
              color="from-red-500 to-orange-500"
              onClick={() => router.push('/admin/live')}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Users
            </h2>
            <div className="space-y-3">
              {stats?.recentUsers?.slice(0, 5).map(user => (
                <div key={user._id} className="flex items-center justify-between p-3 bg-dark-200/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-secondary" />
              Recent Orders
            </h2>
            <div className="space-y-3">
              {stats?.recentOrders?.slice(0, 5).map(order => (
                <div key={order._id} className="flex items-center justify-between p-3 bg-dark-200/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">₹{order.totalAmount}</p>
                    <p className="text-gray-400 text-sm">{order.courses?.length} course(s)</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickActionCard({ title, description, icon: Icon, color, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-left hover:border-primary/30 transition-all"
    >
      <div className={`p-3 rounded-xl bg-gradient-to-r ${color} w-fit mb-4`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </motion.button>
  )
}
