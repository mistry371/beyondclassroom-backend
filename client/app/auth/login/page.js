'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, LogIn, Home, ArrowLeft, Shield, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { setCredentials } from '@/store/slices/authSlice'
import api from '@/utils/api'
import Link from 'next/link'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useDispatch()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: credentials, 2: OTP
  const [pendingUser, setPendingUser] = useState(null)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [resendTimer, setResendTimer] = useState(0)
  const [showPassword, setShowPassword] = useState(false)

  const startResendTimer = () => {
    setResendTimer(60)
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setError('')
      const checkRes = await api.post('/auth/login-precheck', data)
      if (checkRes.data.success) {
        setPendingUser({ email: data.email, password: data.password })
        const otpRes = await api.post('/otp/send', { email: data.email, purpose: 'login' })
        if (otpRes.data.success) {
          setStep(2)
          startResendTimer()
          if (otpRes.data.otp) {
            console.log('🔐 Login OTP:', otpRes.data.otp)
            const otpDigits = otpRes.data.otp.toString().split('').slice(0, 6)
            setOtp([...otpDigits, ...Array(6).fill('')].slice(0, 6))
          }
        }
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Server is starting up (Render cold start). Please wait 30 seconds and try again.')
      } else {
        setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  const onSubmitOTP = async () => {
    try {
      setLoading(true)
      setError('')
      const otpCode = otp.join('')
      if (otpCode.length !== 6) { setError('Please enter complete 6-digit OTP'); setLoading(false); return }

      const verifyRes = await api.post('/otp/verify', { email: pendingUser.email, otp: otpCode, purpose: 'login' })
      if (!verifyRes.data.success) { setError(verifyRes.data.message || 'Invalid OTP'); setLoading(false); return }

      const response = await api.post('/auth/login', { email: pendingUser.email, password: pendingUser.password, otpVerified: true })
      dispatch(setCredentials(response.data))

      const redirect = searchParams.get('redirect')
      if (redirect) { router.push(redirect); return }

      const userRole = response.data.user?.role
      if (userRole === 'admin' || userRole === 'super_admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) document.getElementById(`login-otp-${index + 1}`)?.focus()
  }

  const handleOtpPaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').slice(0, 6)
    setOtp(pasted.split('').concat(Array(6).fill('')).slice(0, 6))
  }

  const handleResendOTP = async () => {
    if (resendTimer > 0 || !pendingUser) return
    try {
      setLoading(true)
      setOtp(['', '', '', '', '', ''])
      const otpRes = await api.post('/otp/send', { email: pendingUser.email, purpose: 'login' })
      if (otpRes.data.success) {
        startResendTimer()
        if (otpRes.data.otp) {
          const otpDigits = otpRes.data.otp.toString().split('').slice(0, 6)
          setOtp([...otpDigits, ...Array(6).fill('')].slice(0, 6))
        }
      }
    } catch (err) {
      setError('Failed to resend OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.post('/auth/guest')
      dispatch(setCredentials(response.data))
      router.push('/dashboard')
    } catch (err) {
      setError('Guest login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark via-dark-100 to-dark-200 p-4 relative">
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all group">
        <Home className="h-5 w-5 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline font-medium">Home</span>
      </Link>
      <Link href="/courses" className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all group">
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        <span className="hidden sm:inline font-medium">Courses</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-dark-100/90 to-dark-200/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4"
          >
            {step === 1 ? <LogIn className="h-8 w-8 text-white" /> : <Shield className="h-8 w-8 text-white" />}
          </motion.div>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-2">
            {step === 1 ? 'Welcome Back' : 'Verify OTP'}
          </h1>
          <p className="text-gray-400">
            {step === 1 ? 'Sign in to Beyond Classroom' : `OTP sent to ${pendingUser?.email}`}
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
          {step === 1 ? (
            <motion.form key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSubmit(onSubmit)} className="space-y-5"
            >
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' } })}
                    type="email"
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="your@email.com"
                  />
                </div>
                {errors.email && <p className="text-red-400 text-sm mt-2">⚠ {errors.email.message}</p>}
              </div>

              {/* Password with show/hide */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-300">Password</label>
                  <Link href="/auth/forgot-password" className="text-xs text-primary hover:text-secondary transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-sm mt-2">⚠ {errors.password.message}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-primary/20"
              >
                {loading ? <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>Please wait...</> : <><Shield className="h-5 w-5" />Continue with OTP</>}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-4 bg-dark-100 text-gray-400">Or</span></div>
              </div>

              <button type="button" onClick={handleGuestLogin} disabled={loading}
                className="w-full border-2 border-white/20 text-white py-3 rounded-xl font-semibold hover:bg-white/10 transition-all disabled:opacity-50"
              >
                Continue as Guest
              </button>

              <p className="text-center text-gray-400 text-sm pt-2">
                Don't have an account?{' '}
                <Link href="/auth/register" className="text-primary hover:text-secondary font-bold transition-colors">Sign Up Free</Link>
              </p>
            </motion.form>
          ) : (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <button onClick={() => { setStep(1); setOtp(['', '', '', '', '', '']); setError('') }}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4 text-center">Enter 6-digit OTP</label>
                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, index) => (
                    <input key={index} id={`login-otp-${index}`} type="text" maxLength={1} value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Backspace' && !digit && index > 0) document.getElementById(`login-otp-${index - 1}`)?.focus() }}
                      className="w-12 h-14 text-center text-2xl font-bold bg-dark-200/50 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  ))}
                </div>
              </div>

              <button onClick={onSubmitOTP} disabled={loading || otp.join('').length !== 6}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>Verifying...</> : <><CheckCircle className="h-5 w-5" />Verify & Sign In</>}
              </button>

              <div className="text-center">
                <button onClick={handleResendOTP} disabled={resendTimer > 0 || loading}
                  className="text-sm text-primary hover:text-secondary disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
                >
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>

              <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-sm">
                <p className="text-primary font-medium mb-1">📧 Check your email</p>
                <p className="text-gray-400">OTP has been sent to your email. If not received, it has been auto-filled above.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>}>
      <LoginContent />
    </Suspense>
  )
}
