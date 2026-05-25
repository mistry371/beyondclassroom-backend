'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { ArrowLeft, ShoppingCart, RefreshCw, Download, ChevronDown, ChevronUp } from 'lucide-react'
import api from '@/utils/api'
import { motion } from 'framer-motion'

export default function AdminOrders() {
  const router = useRouter()
  const { user } = useSelector(state => state.auth)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [expandedOrder, setExpandedOrder] = useState(null)

  useEffect(() => {
    fetchOrders()
  }, [user, filter])

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/admin/orders?status=${filter}`)
      setOrders(res.data.orders || [])
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefund = async (orderId) => {
    if (!confirm('Process refund for this order?')) return
    try {
      await api.post(`/admin/orders/${orderId}/refund`)
      alert('Refund processed successfully')
      fetchOrders()
    } catch (error) {
      alert('Refund failed')
    }
  }

  const exportOrders = async () => {
    try {
      const res = await api.get('/admin/orders/export', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'orders.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      alert('Export failed')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark">
      <div className="bg-gradient-to-r from-dark-100 via-dark-100 to-dark-100 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/admin')} className="p-2 hover:bg-dark-200 rounded-lg transition-all">
                <ArrowLeft className="h-5 w-5 text-gray-400" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Order Management
                </h1>
                <p className="text-gray-400 mt-1">{orders.length} orders</p>
              </div>
            </div>
            <button
              onClick={exportOrders}
              className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-all flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-3 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
          >
            <option value="all">All Orders</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">Order #{order._id.slice(-8)}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      order.status === 'refunded' ? 'bg-red-500/20 text-red-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">Customer: {order.user?.name || 'Unknown'}</p>
                  <p className="text-gray-400 text-sm">{order.user?.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">₹{order.totalAmount}</p>
                  <p className="text-gray-400 text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mb-4">
                <p className="text-gray-400 text-sm mb-2">Courses:</p>
                <div className="space-y-1">
                  {order.courses?.map(course => (
                    <p key={course._id} className="text-white text-sm">• {course.title}</p>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                  className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all text-sm flex items-center gap-2"
                >
                  {expandedOrder === order._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {expandedOrder === order._id ? 'Hide Details' : 'View Details'}
                </button>
                {order.status === 'completed' && (
                  <button
                    onClick={() => handleRefund(order._id)}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Process Refund
                  </button>
                )}
              </div>

              {expandedOrder === order._id && (
                <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Order ID</p>
                    <p className="text-white font-mono">{order._id}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Payment Method</p>
                    <p className="text-white">{order.paymentMethod || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Created At</p>
                    <p className="text-white">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  {order.refundedAt && (
                    <div>
                      <p className="text-gray-500 mb-1">Refunded At</p>
                      <p className="text-white">{new Date(order.refundedAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {orders.length === 0 && (
          <div className="text-center py-20">
            <ShoppingCart className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl">No orders found</p>
          </div>
        )}
      </div>
    </div>
  )
}
