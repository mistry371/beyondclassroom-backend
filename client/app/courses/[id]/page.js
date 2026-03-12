'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { Clock, Users, Star, ShoppingCart, Heart, BookOpen, Award, CheckCircle, PlayCircle, Lock } from 'lucide-react'
import Navbar from '@/components/Navbar'
import api from '@/utils/api'
import { motion } from 'framer-motion'

export default function CourseDetails() {
  const params = useParams()
  const router = useRouter()
  const { user } = useSelector((state) => state.auth)
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchCourse()
  }, [params.id])

  const fetchCourse = async () => {
    try {
      const response = await api.get(`/courses/${params.id}`)
      setCourse(response.data.course)
    } catch (error) {
      console.error('Fetch course failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    // Check if user is logged in
    if (!user) {
      router.push('/auth/login?redirect=/courses/' + params.id)
      return
    }
    
    try {
      await api.post('/cart', { courseId: course._id })
      router.push('/cart')
    } catch (error) {
      console.error('Add to cart failed:', error)
      alert('Failed to add to cart. Please try again.')
    }
  }

  const handleEnroll = async () => {
    // Check if user is logged in
    if (!user) {
      router.push('/auth/login?redirect=/courses/' + params.id)
      return
    }
    
    try {
      await api.post('/orders', { courses: [course._id] })
      router.push('/dashboard')
    } catch (error) {
      console.error('Enrollment failed:', error)
      alert('Failed to enroll. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-dark-100 to-dark">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-dark-100 to-dark">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-white text-xl">Course not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-100 to-dark">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Course Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-1 rounded-full text-sm font-semibold">
                  {course.category}
                </span>
                <span className="bg-white/10 backdrop-blur-sm text-white px-4 py-1 rounded-full text-sm">
                  {course.difficulty}
                </span>
              </div>

              <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                {course.title}
              </h1>

              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                {course.description}
              </p>

              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center text-yellow-400">
                  <Star className="h-6 w-6 fill-current" />
                  <span className="ml-2 text-xl font-bold">{course.rating || 4.8}</span>
                  <span className="ml-2 text-gray-400">({course.enrolledCount || 0} students)</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-gray-300 mb-8">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-secondary" />
                  <span>{course.topics?.length || 0} Topics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                  <span>Certificate</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-white">
                  <span className="text-5xl font-bold">₹{course.price}</span>
                  {course.discountPrice && (
                    <span className="text-2xl text-gray-400 line-through ml-3">₹{course.discountPrice}</span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right: Course Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-dark-100/90 to-dark/90 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl"
            >
              <div className="aspect-video bg-gradient-to-br from-primary to-secondary rounded-xl mb-6 flex items-center justify-center">
                <PlayCircle className="h-20 w-20 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-4">Enroll in this course</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  <span>Lifetime access</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  <span>Certificate of completion</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  <span>24/7 support</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  <span>Practice exercises</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleEnroll}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  {user ? 'Enroll Now' : (
                    <>
                      <Lock className="h-5 w-5" />
                      Login to Enroll
                    </>
                  )}
                </button>
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white py-4 rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart
                </button>
              </div>

              {!user && (
                <p className="text-center text-gray-400 text-sm mt-4">
                  Please login to purchase this course
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-br from-dark-100/90 to-dark/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-8 py-4 font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`px-8 py-4 font-semibold transition-all ${
                activeTab === 'curriculum'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Curriculum
            </button>
            <button
              onClick={() => setActiveTab('instructor')}
              className={`px-8 py-4 font-semibold transition-all ${
                activeTab === 'instructor'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Instructor
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">What you'll learn</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {course.topics?.map((topic, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
                        <span className="text-gray-300">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">Course Description</h2>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {course.description}
                  </p>
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">Requirements</h2>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-primary rounded-full"></div>
                      Basic understanding of mathematics
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-primary rounded-full"></div>
                      Willingness to learn and practice
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-primary rounded-full"></div>
                      Computer or mobile device with internet
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}

            {activeTab === 'curriculum' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <h2 className="text-3xl font-bold text-white mb-6">Course Curriculum</h2>
                {course.topics?.map((topic, index) => (
                  <div
                    key={index}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-r from-primary to-secondary text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">{topic}</h3>
                          <p className="text-gray-400 text-sm">Module {index + 1}</p>
                        </div>
                      </div>
                      <Lock className="h-5 w-5 text-gray-500" />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'instructor' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold text-white mb-6">Meet Your Instructor</h2>
                <div className="flex items-start gap-6">
                  <div className="bg-gradient-to-br from-primary to-secondary w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                    {course.instructor?.charAt(0) || 'I'}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{course.instructor}</h3>
                    <p className="text-gray-300 leading-relaxed">
                      Expert mathematics educator with years of experience in teaching students from Grade 5-12. 
                      Specialized in making complex mathematical concepts easy to understand through practical examples 
                      and interactive learning methods.
                    </p>
                    <div className="flex items-center gap-6 mt-4 text-gray-400">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <span>{course.enrolledCount || 0} Students</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <span>{course.rating || 4.8} Rating</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
