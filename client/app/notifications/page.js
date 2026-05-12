'use client'

import { useEffect, useState } from 'react'
import { Bell, AlertCircle, MessageSquare, Info, Clock, CheckCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import api from '@/utils/api'
import { motion } from 'framer-motion'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications')
      setNotifications(response.data.notifications || [])
    } catch (error) {
      console.error('Fetch notifications failed:', error)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(notifications.map(n =>
        n._id === id ? { ...n, isRead: true } : n
      ))
    } catch (error) {
      console.error('Mark as read failed:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/mark-all-read')
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
    } catch (error) {
      // Fallback: mark individually
      const unread = notifications.filter(n => !n.isRead)
      await Promise.all(unread.map(n => markAsRead(n._id)))
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'alert': return <AlertCircle className="h-6 w-6 text-red-400" />
      case 'message': return <MessageSquare className="h-6 w-6 text-blue-400" />
      case 'expiry': return <Clock className="h-6 w-6 text-orange-400" />
      case 'success': return <CheckCircle className="h-6 w-6 text-green-400" />
      default: return <Info className="h-6 w-6 text-primary" />
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            Notifications
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                {unreadCount} new
              </span>
            )}
          </h1>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-all text-sm"
            >
              Mark all as read
            </button>
          )}
        </motion.div>

        {notifications.length === 0 ? (
          <div className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
            <Bell className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No notifications yet</p>
            <p className="text-gray-500 text-sm mt-2">You'll see updates about your courses here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => !notification.isRead && markAsRead(notification._id)}
                className={`bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border p-6 cursor-pointer transition-all hover:border-primary/30 ${
                  !notification.isRead
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-white/10'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white mb-1">{notification.title}</h3>
                    <p className="text-gray-400 text-sm mb-2">{notification.message}</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
