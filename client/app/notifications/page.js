'use client'

import { useEffect, useState } from 'react'
import { Bell, AlertCircle, MessageSquare, Info, Clock } from 'lucide-react'
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
      setNotifications(response.data.notifications)
    } catch (error) {
      console.error('Fetch notifications failed:', error)
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

  const getIcon = (type) => {
    switch (type) {
      case 'alert': return <AlertCircle className="h-6 w-6 text-red-500" />
      case 'message': return <MessageSquare className="h-6 w-6 text-blue-500" />
      case 'expiry': return <Clock className="h-6 w-6 text-orange-500" />
      default: return <Info className="h-6 w-6 text-gray-500" />
    }
  }

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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Bell className="h-8 w-8" />
            Notifications
          </h1>
        </motion.div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => !notification.isRead && markAsRead(notification._id)}
                className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all hover:shadow-lg ${
                  !notification.isRead ? 'border-l-4 border-primary' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{notification.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
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
