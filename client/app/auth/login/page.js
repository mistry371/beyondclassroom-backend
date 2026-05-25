'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn, Home, ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react'
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
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setError('')
      const response = await api.post('/auth/login', {
        email: data.email?.toLowerCase().trim(),
        password: data.password,
      }, { timeout: 30000 })
      const payload = response.data
      dispatch(setCredentials({
        token: payload.token,
        user: {
          ...payload.user,
          _id: payload.user?.id || payload.user?._id,
        },
      }))

      const redirect = searchParams.get('redirect')
      if (redirect) {
        router.push(redirect)
        return
      }

      const userRole = payload.user?.role
      if (userRole === 'admin' || userRole === 'super_admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
        setError('Request timed out. Server may be busy — please try again.')
      } else {
        setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
      }
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
            <LogIn className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-400">Sign in to Beyond Classroom</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                Sign In
              </>
            )}
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
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-primary hover:text-secondary font-bold transition-colors">Sign Up Free</Link>
          </p>
        </form>
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
