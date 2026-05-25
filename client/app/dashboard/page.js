'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { BookOpen, TrendingUp, Award, Clock, PlayCircle, Lock, AlertTriangle, ShoppingCart } from 'lucide-react'
import Navbar from '@/components/Navbar'
import EmptyState from '@/components/ui/EmptyState'
import api from '@/utils/api'
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
      const profileRes = await api.get('/profile')
      const userCourses = profileRes.data.user.purchasedCourses || []

      const courses = await Promise.all(
        userCourses.map(async (item) => {
          if (item && typeof item === 'object' && item._id) return item
          try {
            const res = await api.get(`/courses/${item}`)
            return res.data.course
          } catch { return null }
        })
      )
      const validCourses = courses.filter(Boolean)
      setPurchasedCourses(validCourses)

      const progressResults = await Promise.all(
        validCourses.map(course =>
          api.get(`/progress/course/${course._id}`).catch(() => null)
        )
      )
      setProgress(progressResults.filter(r => r !== null).map(r => r.data.progress))

      // Fetch trial status
      try {
        const trialRes = await api.get('/trial/status')
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

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-dark-100 via-dark-100 to-dark-100 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-gray-300 text-lg">Continue your learning journey</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {fetchError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm flex justify-between items-center gap-4 flex-wrap">
            <span>{fetchError}</span>
            <button type="button" onClick={() => { setLoading(true); fetchDashboardData() }} className="font-semibold underline text-white">Retry</button>
          </div>
        )}
        {/* Trial Banner */}
        {trialStatus && !trialStatus.hasPurchasedCourses && (
          trialStatus.trialExpired ? (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-xl"><Lock className="h-5 w-5 text-red-400" /></div>
                <div>
                  <p className="text-red-300 font-bold">Your free trial has expired</p>
                  <p className="text-gray-400 text-sm">Purchase a course to continue learning and unlock all content.</p>
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
                trialStatus.daysLeft === 0
                  ? 'bg-gradient-to-r from-red-500/15 to-orange-500/15 border-red-500/30'
                  : 'bg-gradient-to-r from-yellow-500/15 to-orange-500/15 border-yellow-500/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${trialStatus.daysLeft === 0 ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
                  <AlertTriangle className={`h-5 w-5 ${trialStatus.daysLeft === 0 ? 'text-red-400' : 'text-yellow-400'}`} />
                </div>
                <div>
                  <p className={`font-bold ${trialStatus.daysLeft === 0 ? 'text-red-300' : 'text-yellow-300'}`}>
                    {trialStatus.daysLeft === 0
                      ? `Free trial expires in ${trialStatus.hoursLeft} hour${trialStatus.hoursLeft !== 1 ? 's' : ''}`
                      : `Free trial: ${trialStatus.daysLeft} day${trialStatus.daysLeft !== 1 ? 's' : ''} remaining`}
                  </p>
                  <p className="text-gray-400 text-sm">You have limited access. Purchase a course for full access.</p>
                </div>
              </div>
              <button onClick={() => router.push('/courses')}
                className={`px-5 py-2.5 rounded-xl font-semibold transition-all flex items-center gap-2 flex-shrink-0 ${
                  trialStatus.daysLeft === 0 ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-yellow-500 text-dark hover:bg-yellow-400'
                }`}
              >
                <ShoppingCart className="h-4 w-4" /> Upgrade Now
              </button>
            </motion.div>
          ) : null
        )}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-xl rounded-2xl border border-primary/30 p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-xl">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Enrolled Courses</p>
                <p className="text-3xl font-bold text-white">{purchasedCourses.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-secondary/20 to-accent/20 backdrop-blur-xl rounded-2xl border border-secondary/30 p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/20 rounded-xl">
                <TrendingUp className="h-8 w-8 text-secondary" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Avg. Progress</p>
                <p className="text-3xl font-bold text-white">
                  {progress.length > 0 
                    ? Math.round(progress.reduce((sum, p) => sum + (p?.completionPercentage || 0), 0) / progress.length)
                    : 0}%
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Award className="h-8 w-8 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-3xl font-bold text-white">
                  {progress.filter(p => p?.completionPercentage === 100).length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* My Courses */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            My Courses
          </h2>

          {purchasedCourses.length === 0 ? (
            <div className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
              <Lock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Courses Yet</h3>
              <p className="text-gray-400 mb-6">Start your learning journey by enrolling in a course</p>
              <button
                onClick={() => router.push('/courses')}
                className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all"
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
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden hover:border-primary/30 transition-all group"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-2">{course.description}</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-primary font-semibold">{getCourseProgress(course._id)}%</span>
                      </div>
                      <div className="w-full bg-dark-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${getCourseProgress(course._id)}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className="h-full bg-gradient-to-r from-primary to-secondary"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                      <span className="mx-2">•</span>
                      <span className="px-2 py-1 bg-secondary/20 text-secondary rounded text-xs">
                        {course.difficulty}
                      </span>
                    </div>

                    <button
                      onClick={() => router.push(`/learn/${course._id}/advanced`)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 font-medium"
                    >
                      <PlayCircle className="h-5 w-5" />
                      Continue Learning
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/')}
            className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-left hover:border-primary/30 transition-all"
          >
            <BookOpen className="h-8 w-8 text-primary mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Browse More Courses</h3>
            <p className="text-gray-400 text-sm">Explore our catalog and find your next course</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/tools')}
            className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-left hover:border-secondary/30 transition-all"
          >
            <Award className="h-8 w-8 text-secondary mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Math Tools</h3>
            <p className="text-gray-400 text-sm">Access 40 powerful mathematical calculators</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/live')}
            className="bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-xl rounded-2xl border border-red-500/20 p-6 text-left hover:border-red-500/40 transition-all"
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-8 w-8 text-red-400" />
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Live Classes</h3>
            <p className="text-gray-400 text-sm">Join live sessions with expert instructors</p>
          </motion.button>
        </div>
      </div>
    </div>
  )
}
