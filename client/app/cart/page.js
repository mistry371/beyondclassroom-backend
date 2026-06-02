'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, ShoppingBag, CreditCard, ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import PaymentModal from '@/components/PaymentModal'
import api from '@/utils/api'
import { motion } from 'framer-motion'

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState({ items: [] })
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)
  const [error, setError] = useState('')
  const [paymentCourse, setPaymentCourse] = useState(null)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart')
      setCart(response.data.cart || { items: [] })
    } catch (error) {
      if (error.response?.status === 401) {
        router.push('/auth/login?redirect=/cart')
        return
      }
      setCart({ items: [] })
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (courseId) => {
    try {
      await api.delete(`/cart/${courseId}`)
      fetchCart()
    } catch (error) {
      setError('Failed to remove item. Please try again.')
    }
  }

  const checkout = async () => {
    setCheckingOut(true)
    setError('')
    try {
      // Check if any items are paid courses
      const paidItems = cart.items.filter(item => item.course?.price > 0 && !item.course?.isFree && !item.course?.isDemo)
      
      if (paidItems.length > 0) {
        // For paid courses, open payment modal for first paid course
        setPaymentCourse(paidItems[0].course)
        setCheckingOut(false)
        return
      }

      // All free/demo courses — direct order
      await api.post('/orders', {})
      router.push('/dashboard')
    } catch (error) {
      setError(error.response?.data?.message || 'Checkout failed. Please try again.')
    } finally {
      setCheckingOut(false)
    }
  }

  const handlePaymentSuccess = () => {
    setPaymentCourse(null)
    fetchCart()
    router.push('/dashboard')
  }

  const total = cart.items.reduce((sum, item) => sum + (item.course?.price || 0), 0)
  const hasPaidItems = cart.items.some(item => item.course?.price > 0 && !item.course?.isFree && !item.course?.isDemo)

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <ShoppingBag className="h-8 w-8 text-primary" />
          Shopping Cart
          {cart.items.length > 0 && (
            <span className="text-lg font-normal text-gray-400">({cart.items.length} item{cart.items.length !== 1 ? 's' : ''})</span>
          )}
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

        {cart.items.length === 0 ? (
          <div className="text-center py-20 bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10">
            <ShoppingBag className="h-24 w-24 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">Your cart is empty</p>
            <p className="text-gray-500 text-sm mb-6">Add courses to get started on your learning journey</p>
            <button
              onClick={() => router.push('/courses')}
              className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all inline-flex items-center gap-2"
            >
              Browse Courses <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-2xl font-bold">
                        {item.course?.title?.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-white truncate">{item.course?.title}</h3>
                      <p className="text-gray-400 text-sm">{item.course?.instructor}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded">
                          {item.course?.difficulty}
                        </span>
                        {(item.course?.isFree || item.course?.isDemo) && (
                          <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">Free</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-xl font-bold text-white">
                      {item.course?.isFree || item.course?.isDemo ? (
                        <span className="text-green-400">FREE</span>
                      ) : (
                        `₹${item.course?.price}`
                      )}
                    </span>
                    <button
                      onClick={() => removeItem(item.course?._id)}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                      aria-label="Remove from cart"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sticky top-24">
                <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  {cart.items.map((item) => (
                    <div key={item._id} className="flex justify-between text-sm text-gray-400">
                      <span className="truncate mr-2">{item.course?.title}</span>
                      <span className="flex-shrink-0">
                        {item.course?.isFree || item.course?.isDemo ? 'Free' : `₹${item.course?.price}`}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-white/10 pt-3 flex justify-between text-lg font-bold text-white">
                    <span>Total</span>
                    <span className="text-primary">₹{total}</span>
                  </div>
                </div>

                <button
                  onClick={checkout}
                  disabled={checkingOut}
                  className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {checkingOut ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {hasPaidItems ? <CreditCard className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
                      {hasPaidItems ? 'Proceed to Payment' : 'Complete Order'}
                    </>
                  )}
                </button>

                {hasPaidItems && (
                  <p className="text-gray-500 text-xs text-center mt-3">
                    Secure payment via Razorpay
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {paymentCourse && (
        <PaymentModal
          isOpen={!!paymentCourse}
          onClose={() => setPaymentCourse(null)}
          course={paymentCourse}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}
