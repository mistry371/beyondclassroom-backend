'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, ShoppingBag } from 'lucide-react'
import Navbar from '@/components/Navbar'
import api from '@/utils/api'
import { motion } from 'framer-motion'

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState({ items: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart')
      setCart(response.data.cart)
    } catch (error) {
      console.error('Fetch cart failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (courseId) => {
    try {
      await api.delete(`/cart/${courseId}`)
      fetchCart()
    } catch (error) {
      console.error('Remove item failed:', error)
    }
  }

  const checkout = async () => {
    try {
      const courseIds = cart.items.map(item => item.course._id)
      await api.post('/orders', { courses: courseIds })
      router.push('/profile')
    } catch (error) {
      console.error('Checkout failed:', error)
    }
  }

  const total = cart.items.reduce((sum, item) => sum + (item.course?.price || 0), 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {cart.items.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Your cart is empty</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 bg-primary text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
            >
              Browse Courses
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
                  className="bg-white rounded-lg shadow p-6 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {item.course?.title?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{item.course?.title}</h3>
                      <p className="text-gray-600 text-sm">{item.course?.instructor}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-gray-900">
                      ${item.course?.price}
                    </span>
                    <button
                      onClick={() => removeItem(item.course._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${total}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>${total}</span>
                  </div>
                </div>
                <button
                  onClick={checkout}
                  className="w-full bg-primary text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
