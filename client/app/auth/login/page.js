'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn } from 'lucide-react'
import { setCredentials } from '@/store/slices/authSlice'
import api from '@/utils/api'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setError('')
      const response = await api.post('/auth/login', data)
      dispatch(setCredentials(response.data))
      
      // Redirect based on role
      const userRole = response.data.user?.role
      if (userRole === 'admin' || userRole === 'super_admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    try {
      setLoading(true)
      const response = await api.post('/auth/guest')
      dispatch(setCredentials(response.data))
      router.push('/dashboard')
    } catch (err) {
      setError('Guest login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to continue learning</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                {...register('email', { required: 'Email is required' })}
                type="email"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                {...register('password', { required: 'Password is required' })}
                type="password"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn className="h-5 w-5" />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <button
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Continue as Guest
          </button>

          <div className="text-center space-y-2">
            <Link href="/auth/forgot-password" className="text-primary hover:underline text-sm block">
              Forgot Password?
            </Link>
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-primary hover:underline font-semibold">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
