'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Clock, ShoppingCart, AlertTriangle, CheckCircle } from 'lucide-react'
import api from '@/utils/api'
import { motion } from 'framer-motion'

export default function TrialGuard({ children, courseId }) {
  const router = useRouter()
  const [status, setStatus] = useState(null) // null = loading
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkTrial()
  }, [])

  const checkTrial = async () => {
    try {
      const res = await api.get('/trial/status')
      setStatus(res.data)
    } catch (err) {
      // If 401 (unauthenticated), redirect to login
      if (err.response?.status === 401) {
        router.push('/auth/login')
        return
      }
      // On other errors (network, 5xx), default to expired to be safe
      setStatus({ trialActive: false, trialExpired: true, hasPurchasedCourses: false })
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

  // Trial expired and no purchased courses — show paywall
  if (status?.trialExpired && !status?.hasPurchasedCourses) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-dark-100 to-dark flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-dark-100/90 to-dark/90 backdrop-blur-xl rounded-3xl border border-white/10 p-10 max-w-lg w-full text-center shadow-2xl"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
            <Lock className="h-10 w-10 text-red-400" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">Your Free Trial Has Ended</h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Your 3-day free trial has expired. Purchase a course to continue your learning journey and unlock all content.
          </p>

          <div className="bg-white/5 rounded-2xl p-5 mb-8 text-left space-y-3">
            {[
              'Full access to all course modules',
              'Unlimited lessons and practice problems',
              'Module quizzes and certificates',
              'Live class access',
              'AI Tutor support',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{item}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/courses')}
              className="w-full px-6 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 text-lg"
            >
              <ShoppingCart className="h-5 w-5" />
              Browse & Purchase Courses
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Trial active — show banner + content
  return (
    <>
      {status?.trialActive && !status?.hasPurchasedCourses && (
        <TrialBanner daysLeft={status.daysLeft} hoursLeft={status.hoursLeft} onUpgrade={() => router.push('/courses')} />
      )}
      {children}
    </>
  )
}

function TrialBanner({ daysLeft, hoursLeft, onUpgrade }) {
  const isUrgent = daysLeft === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full px-4 py-3 flex items-center justify-between gap-4 flex-wrap ${
        isUrgent
          ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-b border-red-500/30'
          : 'bg-gradient-to-r from-yellow-500/15 to-orange-500/15 border-b border-yellow-500/30'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-lg ${isUrgent ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
          {isUrgent ? (
            <AlertTriangle className="h-4 w-4 text-red-400" />
          ) : (
            <Clock className="h-4 w-4 text-yellow-400" />
          )}
        </div>
        <p className={`text-sm font-medium ${isUrgent ? 'text-red-300' : 'text-yellow-300'}`}>
          {isUrgent
            ? `Your free trial expires in ${hoursLeft} hour${hoursLeft !== 1 ? 's' : ''} — purchase a course to keep learning.`
            : `Free trial: ${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining. Purchase a course to unlock full access.`}
        </p>
      </div>
      <button
        onClick={onUpgrade}
        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all flex-shrink-0 ${
          isUrgent
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-yellow-500 text-dark hover:bg-yellow-400'
        }`}
      >
        Upgrade Now
      </button>
    </motion.div>
  )
}
