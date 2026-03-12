'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import ParticleBackground from '@/components/ParticleBackground'
import { motion } from 'framer-motion'
import { BookOpen, Users, Award, Calculator, Star, ArrowRight, Clock, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import api from '@/utils/api'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses')
      setCourses(res.data.courses || [])
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { icon: Users, value: '50K+', label: 'Active Students', color: 'from-primary to-secondary' },
    { icon: BookOpen, value: `${courses.length}+`, label: 'Expert Courses', color: 'from-secondary to-accent' },
    { icon: Calculator, value: '26', label: 'Math Tools', color: 'from-accent to-primary' },
    { icon: Award, value: '95%', label: 'Success Rate', color: 'from-primary via-secondary to-accent' },
  ]

  return (
    <div className="min-h-screen bg-dark">
      <ParticleBackground />
      <Navbar />
      <Hero />

      {/* Stats Section */}
      <section className="relative py-20 bg-gradient-to-b from-dark to-dark-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                  className="relative group"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity`}></div>
                  <div className="relative bg-dark-100/80 backdrop-blur-xl rounded-2xl p-8 border border-primary/10">
                    <Icon className="h-12 w-12 text-white mx-auto mb-4" />
                    <div className="text-5xl font-black text-white mb-2">{stat.value}</div>
                    <div className="text-gray-400 font-medium">{stat.label}</div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="relative py-20 bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                Featured Courses
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Master mathematics with our comprehensive courses from Class 5 to 12, JEE, and Board exams
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.slice(0, 9).map((course, index) => (
                <motion.div
                  key={course._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-6 border border-primary/10 group-hover:border-primary/50 transition-all h-full flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <span className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-sm font-semibold">
                        {course.category}
                      </span>
                      <span className="px-3 py-1 bg-secondary/20 text-secondary rounded-lg text-sm font-semibold">
                        {course.difficulty}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-grow">
                      {course.description}
                    </p>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Users className="h-4 w-4 text-primary" />
                        <span>{course.enrolledCount} students</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="h-4 w-4 text-secondary" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(course.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-400">({course.rating})</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                      <div>
                        <span className="text-2xl font-bold text-primary">₹{course.price}</span>
                      </div>
                      <Link
                        href={`/courses/${course._id}`}
                        className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-dark rounded-lg hover:opacity-90 transition-all flex items-center gap-2 font-semibold"
                      >
                        View Course
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {courses.length > 9 && (
            <div className="text-center mt-12">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-dark rounded-xl font-bold text-lg hover:opacity-90 transition-all"
              >
                View All {courses.length} Courses
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent"></div>
        <div className="absolute inset-0 bg-dark/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-black text-white mb-8">
              Ready to Start Learning?
            </h2>
            <p className="text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
              Join thousands of students mastering mathematics
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/auth/register"
                className="px-12 py-6 bg-white text-dark rounded-2xl font-black text-xl hover:scale-105 transition-all duration-300 shadow-2xl"
              >
                Get Started Free
              </Link>
              <Link
                href="/tools"
                className="px-12 py-6 bg-white/10 backdrop-blur-xl border-2 border-white/30 rounded-2xl font-black text-xl text-white hover:bg-white/20 transition-all duration-300"
              >
                Explore Tools
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
