'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Shield, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff, KeyRound } from 'lucide-react'
import api from '@/utils/api'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: email, 2: OTP, 3: new password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)

  const startResendTimer = () => {
    setResendTimer(60)
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  // Step 1: Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (!email) return setError('Email is required')
    try {
      setLoading(true)
      setError('')
      const res = await api.post('/otp/send', { email, purpose: 'password_reset' })
      if (res.data.success) {
        setStep(2)
        startResendTimer()
        if (res.data.otp) {
          const digits = res.data.otp.toString().split('').slice(0, 6)
          setOtp([...digits, ...Array(6).fill('')].slice(0, 6))
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Check your email address.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOTP = async () => {
    const otpCode = otp.join('')
    if (otpCode.length !== 6) return setError('Please enter complete 6-digit OTP')
    try {
      setLoading(true)
      setError('')
      const res = await api.post('/otp/verify', { email, otp: otpCode, purpose: 'password_reset' })
      if (res.data.success) {
        setStep(3)
      } else {
        setError(res.data.message || 'Invalid OTP')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (newPassword.length < 6) return setError('Password must be at least 6 characters')
    if (newPassword !== confirmPassword) return setError('Passwords do not match')
    try {
      setLoading(true)
      setError('')
      const res = await api.post('/auth/reset-password', {
        email,
        otp: otp.join(''),
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

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) document.getElementById(`fp-otp-${index + 1}`)?.focus()
  }

  const handleResend = async () => {
    if (resendTimer > 0) return
    try {
      setLoading(true)
      setOtp(['', '', '', '', '', ''])
      const res = await api.post('/otp/send', { email, purpose: 'password_reset' })
      if (res.data.success) {
        startResendTimer()
        if (res.data.otp) {
          const digits = res.data.otp.toString().split('').slice(0, 6)
          setOtp([...digits, ...Array(6).fill('')].slice(0, 6))
        }
      }
    } catch (err) {
      setError('Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  const stepTitles = ['Forgot Password', 'Verify OTP', 'New Password', 'Done!']
  const stepIcons = [<Mail key="m" className="h-8 w-8 text-white" />, <Shield key="s" className="h-8 w-8 text-white" />, <KeyRound key="k" className="h-8 w-8 text-white" />, <CheckCircle key="c" className="h-8 w-8 text-white" />]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark via-dark-100 to-dark-200 p-4">
      <Link href="/auth/login" className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all">
        <ArrowLeft className="h-5 w-5" />
        <span className="hidden sm:inline font-medium">Back to Login</span>
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-dark-100/90 to-dark-200/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div key={step} initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4"
          >
            {stepIcons[step - 1]}
          </motion.div>
          <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-2">
            {stepTitles[step - 1]}
          </h1>
          <p className="text-gray-400 text-sm">
            {step === 1 && 'Enter your email to receive a reset OTP'}
            {step === 2 && `OTP sent to ${email}`}
            {step === 3 && 'Set your new password'}
            {step === 4 && 'Password reset successful! Redirecting...'}
          </p>
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
          {/* Step 1: Email */}
          {step === 1 && (
            <motion.form key="s1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSendOTP} className="space-y-5"
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
                {loading ? <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>Sending...</> : <><Shield className="h-5 w-5" />Send Reset OTP</>}
              </button>
            </motion.form>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <button onClick={() => { setStep(1); setError('') }} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4 text-center">Enter 6-digit OTP</label>
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, index) => (
                    <input key={index} id={`fp-otp-${index}`} type="text" maxLength={1} value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Backspace' && !digit && index > 0) document.getElementById(`fp-otp-${index - 1}`)?.focus() }}
                      className="w-12 h-14 text-center text-2xl font-bold bg-dark-200/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  ))}
                </div>
              </div>
              <button onClick={handleVerifyOTP} disabled={loading || otp.join('').length !== 6}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>Verifying...</> : <><CheckCircle className="h-5 w-5" />Verify OTP</>}
              </button>
              <div className="text-center">
                <button onClick={handleResend} disabled={resendTimer > 0 || loading}
                  className="text-sm text-primary hover:text-secondary disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <motion.form key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
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
                {loading ? <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>Resetting...</> : <><KeyRound className="h-5 w-5" />Reset Password</>}
              </button>
            </motion.form>
          )}

          {/* Step 4: Success */}
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
