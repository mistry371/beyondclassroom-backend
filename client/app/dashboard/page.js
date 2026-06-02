'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { BookOpen, TrendingUp, Award, Clock, PlayCircle, Lock, AlertTriangle, ShoppingCart, User, Package } from 'lucide-react'
import Navbar from '@/components/Navbar'
import api from '@/utils/api'
import { cachedGet } from '@/utils/api'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const router = useRouter()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const [purchasedCourses, setPurchasedCourses] = useState([])
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [trialStatus, setTrialStatus] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    fetchDashboardData()
  }, [isAuthenticated])

  const fetchDashboardData = async () => {
    try {
      const profileRes = await cachedGet('/profile', 30 * 1000)
      const userCourses = profileRes.data.user.purchasedCourses || []

      const courses = await Promise.all(
        userCourses.map(async (item) => {
          if (item && typeof item === 'object' && item._id) return item
          try {
            const res = await cachedGet(`/courses/${item}`, 60 * 1000)
            return res.data.course
          } catch { return null }
        })
      )
      const validCourses = courses.filter(Boolean)
      setPurchasedCourses(validCourses)

      const progressResults = await Promise.all(
        validCourses.map(course =>
          cachedGet(`/progress/course/${course._id}`, 20 * 1000).catch(() => null)
        )
      )
      setProgress(progressResults.filter(r => r !== null).map(r => r.data.progress))

      try {
        const trialRes = await cachedGet('/trial/status', 20 * 1000)
        setTrialStatus(trialRes.data)
      } catch {}
    } catch (error) {
      setFetchError(error.userMessage || 'Could not load your dashboard.')
    } finally {
      setLoading(false)
    }
  }

  const getCourseProgress = (courseId) => {
    const courseProgress = progress.find(p => p?.courseId === courseId)
    return courseProgress?.completionPercentage || 0
  }

  const avgProgress = useMemo(() => {
    if (progress.length === 0) return 0
    return Math.round(progress.reduce((sum, p) => sum + (p?.completionPercentage || 0), 0) / progress.length)
  }, [progress])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl font-black text-slate-800 mb-1">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-slate-500">Continue your learning journey</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {fetchError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex justify-between items-center gap-4 flex-wrap">
            <span>{fetchError}</span>
            <button type="button" onClick={() => { setLoading(true); fetchDashboardData() }} className="font-semibold underline">Retry</button>
          </div>
        )}

        {/* Trial Banner */}
        {trialStatus && !trialStatus.hasPurchasedCourses && (
          trialStatus.trialExpired ? (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-xl"><Lock className="h-5 w-5 text-red-600" /></div>
                <div>
                  <p className="text-red-800 font-bold">Your free trial has expired</p>
                  <p className="text-red-600 text-sm">Purchase a course to continue learning.</p>
                </div>
              </div>
              <button onClick={() => router.push('/courses')}
                className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:opacity-90 transition-all flex items-center gap-2 flex-shrink-0"
              >
                <ShoppingCart className="h-4 w-4" /> Browse Courses
              </button>
            </motion.div>
          ) : trialStatus.trialActive ? (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className={`mb-6 border rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap ${
                trialStatus.daysLeft === 0 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${trialStatus.daysLeft === 0 ? 'bg-red-100' : 'bg-amber-100'}`}>
                  <AlertTriangle className={`h-5 w-5 ${trialStatus.daysLeft === 0 ? 'text-red-600' : 'text-amber-600'}`} />
                </div>
                <div>
                  <p className={`font-bold ${trialStatus.daysLeft === 0 ? 'text-red-800' : 'text-amber-800'}`}>
                    {trialStatus.daysLeft === 0
                      ? `Trial expires in ${trialStatus.hoursLeft} hour${trialStatus.hoursLeft !== 1 ? 's' : ''}`
                      : `Free trial: ${trialStatus.daysLeft} day${trialStatus.daysLeft !== 1 ? 's' : ''} remaining`}
                  </p>
                  <p className={`text-sm ${trialStatus.daysLeft === 0 ? 'text-red-600' : 'text-amber-600'}`}>Purchase a course for full access.</p>
                </div>
              </div>
              <button onClick={() => router.push('/courses')}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 flex-shrink-0 ${
                  trialStatus.daysLeft === 0 ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-amber-500 text-white hover:bg-amber-600'
                }`}
              >
                <ShoppingCart className="h-4 w-4" /> Upgrade Now
              </button>
            </motion.div>
          ) : null
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { icon: BookOpen, label: 'Enrolled Courses', value: purchasedCourses.length, color: 'bg-primary/10 text-primary', delay: 0.1 },
            { icon: TrendingUp, label: 'Avg. Progress', value: `${avgProgress}%`, color: 'bg-secondary/10 text-secondary', delay: 0.2 },
            { icon: Award, label: 'Completed', value: progress.filter(p => p?.completionPercentage === 100).length, color: 'bg-green-100 text-green-600', delay: 0.3 },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay }}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-slate-500 text-sm">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-800">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* My Courses */}
        <div className="mb-8">
          <h2 className="text-xl font-black text-slate-800 mb-5 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> My Courses
          </h2>

          {purchasedCourses.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
              <Lock className="h-14 w-14 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">No Courses Yet</h3>
              <p className="text-slate-500 mb-6">Start your learning journey by enrolling in a course</p>
              <button
                onClick={() => router.push('/courses')}
                className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:opacity-90 transition-all"
              >
                Browse Courses
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchasedCourses.map((course, index) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/30 transition-all group"
                >
                  <div className="h-1.5 bg-gradient-to-r from-primary to-secondary" />
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-4">{course.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Progress</span>
                        <span className="text-primary font-bold">{getCourseProgress(course._id)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${getCourseProgress(course._id)}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration || 'Self-paced'}</span>
                      <span className="mx-1">·</span>
                      <span className="px-2 py-0.5 bg-secondary/10 text-secondary rounded-full text-xs font-semibold">
                        {course.difficulty}
                      </span>
                    </div>

                    <button
                      onClick={() => router.push(`/learn/${course._id}/advanced`)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                      <PlayCircle className="h-5 w-5" /> Continue Learning
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: BookOpen, title: 'Browse Courses', desc: 'Explore our full course catalog', href: '/courses', color: 'bg-primary/10 text-primary' },
            { icon: User, title: 'My Profile', desc: 'View and update your profile', href: '/profile', color: 'bg-secondary/10 text-secondary' },
            { icon: Package, title: 'Our Packages', desc: 'View available learning packages', href: '/packages', color: 'bg-accent/10 text-accent' },
          ].map((action) => (
            <motion.button
              key={action.title}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(action.href)}
              className="bg-white border border-slate-200 rounded-2xl p-6 text-left hover:border-primary/30 hover:shadow-md transition-all shadow-sm"
            >
              <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-4`}>
                <action.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">{action.title}</h3>
              <p className="text-slate-500 text-sm">{action.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
