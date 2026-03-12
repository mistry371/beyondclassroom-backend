'use client'

import { useEffect, useState } from 'react'
import { User, Mail, BookOpen, Award } from 'lucide-react'
import Navbar from '@/components/Navbar'
import api from '@/utils/api'
import { motion } from 'framer-motion'

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile')
      setProfile(response.data.user)
    } catch (error) {
      console.error('Fetch profile failed:', error)
    } finally {
      setLoading(false)
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {profile?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{profile?.name}</h1>
              <p className="text-gray-600 flex items-center gap-2 mt-2">
                <Mail className="h-4 w-4" />
                {profile?.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-indigo-50 rounded-lg p-6 text-center">
              <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{profile?.purchasedCourses?.length || 0}</p>
              <p className="text-gray-600">Enrolled Courses</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-6 text-center">
              <Award className="h-8 w-8 text-secondary mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-gray-600">Certificates</p>
            </div>
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <User className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">Active</p>
              <p className="text-gray-600">Status</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Courses</h2>
          {profile?.purchasedCourses?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.purchasedCourses.map((course) => (
                <div key={course._id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <div className="h-32 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-4">
                    <span className="text-white text-3xl font-bold">{course.title.charAt(0)}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm">{course.instructor}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No courses enrolled yet</p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
