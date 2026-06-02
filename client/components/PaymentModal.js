'use client'

import { useState } from 'react'
import { X, CreditCard, Lock, CheckCircle, ShoppingBag, Tag, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/utils/api'

export default function PaymentModal({ isOpen, onClose, course, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [promoApplied, setPromoApplied] = useState(null) // { discountPercent, discountAmount, finalAmount }
  const [promoError, setPromoError] = useState('')
  const [promoLoading, setPromoLoading] = useState(false)

  const originalAmount = course?.price || 0
  const finalAmount = promoApplied ? promoApplied.finalAmount : originalAmount

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return
    setPromoLoading(true)
    setPromoError('')
    setPromoApplied(null)
    try {
      const res = await api.post('/promo-codes/validate', {
        code: promoCode.trim(),
        amount: originalAmount,
      })
      if (res.data.success) {
        setPromoApplied(res.data)
      }
    } catch (err) {
      setPromoError(err.response?.data?.message || 'Invalid promo code')
    } finally {
      setPromoLoading(false)
    }
  }

  const handleRemovePromo = () => {
    setPromoApplied(null)
    setPromoCode('')
    setPromoError('')
  }

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true)
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })

  const handlePayment = async () => {
    if (!course?._id) return
    setLoading(true)

    try {
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        alert('Payment gateway failed to load. Please check your internet connection and try again.')
        setLoading(false)
        return
      }

      // Create Razorpay order with final (discounted) amount
      let orderData
      try {
        const res = await api.post('/payment/create-order', {
          courseId: course._id,
          amount: finalAmount,
          promoCode: promoApplied ? promoCode.trim() : undefined,
        })
        orderData = res.data
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to initiate payment. Please try again.')
        setLoading(false)
        return
      }

      const { order, keyId } = orderData
      const resolvedKey = keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

      if (!resolvedKey || !order?.id) {
        alert('Payment configuration error. Please contact support.')
        setLoading(false)
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
              // Record promo code usage
              if (promoApplied && promoCode) {
                try {
                  await api.post('/promo-codes/apply', { code: promoCode.trim() })
                } catch (_) {}
              }
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

                  <div className="bg-white/5 rounded-xl p-6 mb-4">
                    <h3 className="text-lg font-semibold text-white mb-1">{course?.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course?.description}</p>
                    <div className="space-y-2 pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Original Price</span>
                        <span className={`font-semibold ${promoApplied ? 'line-through text-gray-500' : 'text-white'}`}>
                          ₹{originalAmount}
                        </span>
                      </div>
                      {promoApplied && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-green-400 text-sm flex items-center gap-1">
                              <Tag className="h-3.5 w-3.5" /> {promoApplied.discountPercent}% off ({promoCode.toUpperCase()})
                            </span>
                            <span className="text-green-400 font-semibold">−₹{promoApplied.discountAmount}</span>
                          </div>
                          <div className="flex items-center justify-between border-t border-white/10 pt-2">
                            <span className="text-white font-bold">Total</span>
                            <span className="text-3xl font-black text-primary">₹{promoApplied.finalAmount}</span>
                          </div>
                        </>
                      )}
                      {!promoApplied && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Total Amount</span>
                          <span className="text-3xl font-bold text-primary">₹{originalAmount}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Promo Code */}
                  <div className="mb-4">
                    {promoApplied ? (
                      <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-green-400" />
                          <span className="text-green-400 font-semibold text-sm">{promoCode.toUpperCase()} applied</span>
                          <span className="text-green-300 text-xs">({promoApplied.discountPercent}% off)</span>
                        </div>
                        <button onClick={handleRemovePromo} className="text-gray-400 hover:text-white">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError('') }}
                          placeholder="Promo code (optional)"
                          className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-primary"
                          onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                        />
                        <button
                          onClick={handleApplyPromo}
                          disabled={!promoCode.trim() || promoLoading}
                          className="px-4 py-2.5 bg-primary/20 text-primary rounded-xl font-semibold text-sm hover:bg-primary/30 transition-all disabled:opacity-40 flex items-center gap-1"
                        >
                          {promoLoading ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-primary" /> : <>Apply <ChevronRight className="h-4 w-4" /></>}
                        </button>
                      </div>
                    )}
                    {promoError && <p className="text-red-400 text-xs mt-1.5 ml-1">{promoError}</p>}
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={loading || !course}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />Processing...</>
                    ) : (
                      <><ShoppingBag className="h-5 w-5" />Enroll Now — ₹{finalAmount}</>
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
