'use client'

import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { BookOpen, TrendingUp, Award, Clock, PlayCircle, Lock } from 'lucide-react'
import Navbar from '@/components/Navbar'
import api from '@/utils/api'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const router = useRouter()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const [purchasedCourses, setPurchasedCourses] = useState([])
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    fetchDashboardData()
  }, [isAuthenticated])

  const fetchDashboardData = async () => {
    try {
      // Fetch user profile with purchased courses
      const profileRes = await api.get('/profile')
      const userCourses = profileRes.data.user.purchasedCourses || []
      
      // Fetch full course details
      const coursesPromises = userCourses.map(courseId => 
        api.get(`/courses/${courseId}`).catch(() => null)
      )
      const coursesResults = await Promise.all(coursesPromises)
      const courses = coursesResults
        .filter(res => res !== null)
        .map(res => res.data.course)
      
      setPurchasedCourses(courses)
      
      // Fetch progress for each course
      const progressPromises = courses.map(course =>
        api.get(`/progress/course/${course._id}`).catch(() => null)
      )
      const progressResults = await Promise.all(progressPromises)
      const progressData = progressResults
        .filter(res => res !== null)
        .map(res => res.data.progress)
      
      setProgress(progressData)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
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
                onClick={() => router.push('/')}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <p className="text-gray-400 text-sm">Access 26 powerful mathematical calculators</p>
          </motion.button>
        </div>
      </div>
    </div>
  )
}
