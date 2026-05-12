'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Shield, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { setCredentials } from '@/store/slices/authSlice'
import api from '@/utils/api'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: Details, 2: OTP
  const [formData, setFormData] = useState(null)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [resendTimer, setResendTimer] = useState(0)
  const [showPassword, setShowPassword] = useState(false)

  // Step 1: Send OTP
  const onSubmitDetails = async (data) => {
    try {
      setLoading(true)
      setError('')
      
      // Send OTP
      const otpRes = await api.post('/otp/send', {
        email: data.email,
        purpose: 'registration'
      })
      
      if (otpRes.data.success) {
        setFormData(data)
        setStep(2)
        startResendTimer()
        
        if (otpRes.data.otp) {
          console.log('🔐 OTP for testing:', otpRes.data.otp)
          // Auto-fill OTP boxes
          const otpDigits = otpRes.data.otp.toString().split('').slice(0, 6)
          setOtp([...otpDigits, ...Array(6).fill('')].slice(0, 6))
        }
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Server is starting up. Please wait 30 seconds and try again.')
      } else {
        setError(err.response?.data?.message || 'Failed to send OTP')
      }
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP and Register
  const onSubmitOTP = async () => {
    try {
      setLoading(true)
      setError('')
      
      const otpCode = otp.join('')
      
      if (otpCode.length !== 6) {
        setError('Please enter complete 6-digit OTP')
        setLoading(false)
        return
      }
      
      // Verify OTP first
      const verifyRes = await api.post('/otp/verify', {
        email: formData.email,
        otp: otpCode,
        purpose: 'registration'
      })
      
      if (!verifyRes.data.success) {
        setError(verifyRes.data.message)
        setLoading(false)
        return
      }
      
      // Register with verified OTP
      const response = await api.post('/auth/register', {
        ...formData,
        otp: otpCode
      })
      
      dispatch(setCredentials(response.data))
      
      // Redirect based on role or redirect parameter
      const urlParams = new URLSearchParams(window.location.search)
      const redirectUrl = urlParams.get('redirect')
      
      if (redirectUrl) {
        router.push(redirectUrl)
      } else {
        const userRole = response.data.user?.role
        if (userRole === 'admin' || userRole === 'super_admin') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6)
    setOtp(newOtp)
  }

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return
    
    try {
      setLoading(true)
      setError('')
      setOtp(['', '', '', '', '', ''])
      
      const otpRes = await api.post('/otp/send', {
        email: formData.email,
        purpose: 'registration'
      })
      
      if (otpRes.data.success) {
        startResendTimer()
        
        if (otpRes.data.otp) {
          console.log('🔐 New OTP:', otpRes.data.otp)
          const otpDigits = otpRes.data.otp.toString().split('').slice(0, 6)
          setOtp([...otpDigits, ...Array(6).fill('')].slice(0, 6))
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  // Start resend timer
  const startResendTimer = () => {
    setResendTimer(60)
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark via-dark-100 to-dark p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-dark-100/90 to-dark/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 w-full max-w-md"
      >
        {/* Back to Home Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4"
          >
            {step === 1 ? (
              <User className="h-8 w-8 text-white" />
            ) : (
              <Shield className="h-8 w-8 text-white" />
            )}
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            {step === 1 ? 'Create Account' : 'Verify OTP'}
          </h1>
          <p className="text-gray-400">
            {step === 1 ? 'Start your learning journey' : `OTP sent to ${formData?.email}`}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm flex items-center gap-2"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSubmit(onSubmitDetails)}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <input
                    {...register('name', { required: 'Name is required' })}
                    type="text"
                    className="w-full pl-10 pr-4 py-3 bg-dark-200/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <input
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    className="w-full pl-10 pr-4 py-3 bg-dark-200/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <input
                    {...register('password', { 
                      required: 'Password is required', 
                      minLength: { value: 6, message: 'Min 6 characters' } 
                    })}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-10 pr-12 py-3 bg-dark-200/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5" />
                    Send OTP
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to details
              </button>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
                  Enter 6-digit OTP
                </label>
                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      className="w-12 h-14 text-center text-2xl font-bold bg-dark-200/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={onSubmitOTP}
                disabled={loading || otp.join('').length !== 6}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Verify & Register
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0 || loading}
                  className="text-sm text-primary hover:text-primary disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>

              <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-sm text-primary">
                <p className="font-medium mb-1">📧 Check your email</p>
                <p className="text-gray-400">OTP has been sent to your email address</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary hover:text-primary font-semibold">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
