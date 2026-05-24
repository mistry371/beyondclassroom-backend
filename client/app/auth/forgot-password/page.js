'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff, KeyRound } from 'lucide-react'
import api from '@/utils/api'
import Link from 'next/link'

function ForgotPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const resetToken = searchParams.get('token')

  const [step, setStep] = useState(resetToken ? 2 : 1)
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRequestReset = async (e) => {
    e.preventDefault()
    if (!email) return setError('Email is required')
    try {
      setLoading(true)
      setError('')
      const res = await api.post('/auth/forgot-password', { email })
      if (res.data.success) {
        setStep(3)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link. Check your email address.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (newPassword.length < 6) return setError('Password must be at least 6 characters')
    if (newPassword !== confirmPassword) return setError('Passwords do not match')
    if (!resetToken) return setError('Invalid reset link. Please request a new one.')
    try {
      setLoading(true)
      setError('')
      const res = await api.post('/auth/reset-password', {
        token: resetToken,
        newPassword
      })
      if (res.data.success) {
        setStep(4)
        setTimeout(() => router.push('/auth/login'), 2500)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  const stepTitles = {
    1: 'Forgot Password',
    2: 'New Password',
    3: 'Check Your Email',
    4: 'Done!'
  }

  const stepDescriptions = {
    1: 'Enter your email and we will send a reset link',
    2: 'Set your new password',
    3: 'If an account exists for that email, a reset link has been sent',
    4: 'Password reset successful! Redirecting...'
  }

  const stepIcons = {
    1: <Mail className="h-8 w-8 text-white" />,
    2: <KeyRound className="h-8 w-8 text-white" />,
    3: <Mail className="h-8 w-8 text-white" />,
    4: <CheckCircle className="h-8 w-8 text-white" />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark via-dark-100 to-dark-200 p-4">
      <Link href="/auth/login" className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all">
        <ArrowLeft className="h-5 w-5" />
        <span className="hidden sm:inline font-medium">Back to Login</span>
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-dark-100/90 to-dark-200/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div key={step} initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4"
          >
            {stepIcons[step]}
          </motion.div>
          <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-2">
            {stepTitles[step]}
          </h1>
          <p className="text-gray-400 text-sm">{stepDescriptions[step]}</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form key="s1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              onSubmit={handleRequestReset} className="space-y-5"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              onSubmit={handleResetPassword} className="space-y-5"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} required
                    className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Min 6 characters"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                    className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Repeat password"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Resetting...
                  </>
                ) : (
                  <>
                    <KeyRound className="h-5 w-5" />
                    Reset Password
                  </>
                )}
              </button>
            </motion.form>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4 space-y-4">
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 text-sm text-left">
                <p className="text-primary font-medium mb-1">Check your inbox</p>
                <p className="text-gray-400">We sent a password reset link to <strong className="text-white">{email}</strong>. The link expires in 1 hour.</p>
              </div>
              <Link href="/auth/login" className="inline-block text-primary hover:text-secondary text-sm font-medium">
                Back to login
              </Link>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-10 w-10 text-green-400" />
              </div>
              <p className="text-white font-semibold text-lg mb-2">Password Reset Successful!</p>
              <p className="text-gray-400 text-sm">Redirecting to login...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>}>
      <ForgotPasswordContent />
    </Suspense>
  )
}
