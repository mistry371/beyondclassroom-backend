'use client'

import { useState } from 'react'
import { X, CreditCard, Lock, CheckCircle, ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/utils/api'

export default function PaymentModal({ isOpen, onClose, course, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true)
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })

  // Direct enrollment — used when Razorpay keys are not configured
  const handleDirectEnroll = async () => {
    setLoading(true)
    try {
      // Add to cart then create order (reuses existing order flow)
      await api.post('/cart', { courseId: course._id }).catch(() => {})
      await api.post('/orders')
      setDone(true)
      setTimeout(() => {
        setDone(false)
        onSuccess()
        onClose()
      }, 1500)
    } catch (error) {
      alert(error.response?.data?.message || 'Enrollment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!course?._id) return
    setLoading(true)

    try {
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        // Razorpay script failed — fall back to direct enroll
        await handleDirectEnroll()
        return
      }

      // Try to create Razorpay order
      let orderData
      try {
        const res = await api.post('/payment/create-order', {
          courseId: course._id,
          amount: course.price,
        })
        orderData = res.data
      } catch {
        // Backend Razorpay not configured — fall back to direct enroll
        await handleDirectEnroll()
        return
      }

      const { order, keyId } = orderData
      const resolvedKey = keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_SRVzzcULeXSVOl'

      if (!resolvedKey || !order?.id) {
        await handleDirectEnroll()
        return
      }

      const options = {
        key: resolvedKey,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'Beyond Classroom',
        description: course.title,
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId: course._id,
            })
            if (verifyRes.data.success) {
              setDone(true)
              setTimeout(() => { setDone(false); onSuccess(); onClose() }, 1500)
            }
          } catch {
            alert('Payment verification failed. Please contact support.')
          }
        },
        theme: { color: '#D4AF37' },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error('Payment error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl border border-primary/20 p-8 max-w-md w-full shadow-2xl">
              {done ? (
                <div className="text-center py-6">
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Enrolled Successfully!</h2>
                  <p className="text-gray-400">You now have full access to this course.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Complete Purchase</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="bg-white/5 rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-semibold text-white mb-1">{course?.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course?.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <span className="text-gray-400">Total Amount</span>
                      <span className="text-3xl font-bold text-primary">₹{course?.price || 0}</span>
                    </div>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={loading || !course}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />Processing...</>
                    ) : (
                      <><ShoppingBag className="h-5 w-5" />Enroll Now — ₹{course?.price || 0}</>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 mt-4 text-gray-500 text-xs">
                    <Lock className="h-3 w-3" />
                    <span>Secure payment · Instant access</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
