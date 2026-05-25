'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Users, Star, TrendingUp, BookOpen, Award, Filter, Search } from 'lucide-react'
import Navbar from '@/components/Navbar'
import api from '@/utils/api'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { COURSE_CATEGORIES } from '@/lib/constants'
import CourseCardSkeleton from '@/components/ui/CourseCardSkeleton'

export default function CoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await api.get('/courses')
      setCourses(response.data.courses || [])
    } catch (error) {
      console.error('Fetch courses failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter(course => {
    const matchesFilter = filter === 'all' || course.difficulty === filter
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-dark">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => <CourseCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-dark via-dark-100 to-dark-200 border-b border-white/10">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                Explore Our Courses
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Master Mathematics and French from Grade 5 to 12 with expert-led courses.
              Learn at your own pace with structured pathways.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-all"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <Filter className="h-5 w-5 text-primary" />
          <span className="text-white font-semibold">Subject:</span>
          <div className="flex gap-3 flex-wrap">
            {['all', ...COURSE_CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  categoryFilter === cat
                    ? 'bg-primary text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {cat === 'all' ? 'All Subjects' : cat}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 mb-8">
          <span className="text-white font-semibold">Level:</span>
          <div className="flex gap-3 flex-wrap">
            {['all', 'Beginner', 'Intermediate', 'Advanced'].map((level) => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === level
                    ? 'bg-gradient-to-r from-primary to-secondary text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {level === 'all' ? 'All Courses' : level}
              </button>
            ))}
          </div>
        </div>

        {/* Course Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing <span className="text-primary font-semibold">{filteredCourses.length}</span> courses
          </p>
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl">No courses found</p>
            <p className="text-gray-500 mt-2">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -10 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-dark-100 to-dark-200 rounded-2xl p-6 border border-primary/10 group-hover:border-primary/50 transition-all h-full flex flex-col">
                  {/* Course Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <span className="px-3 py-1 bg-primary/20 text-primary rounded-lg text-sm font-semibold">
                      {course.category}
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                      course.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                      course.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {course.difficulty}
                    </span>
                  </div>

                  {/* Course Title */}
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {course.title}
                  </h3>

                  {/* Course Description */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-grow">
                    {course.description}
                  </p>

                  {/* Course Stats */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Users className="h-4 w-4 text-primary" />
                      <span>{course.enrolledCount || 0} students enrolled</span>
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
                              i < Math.floor(course.rating || 4.8)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-400">({course.rating || 4.8})</span>
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                    <div>
                      <span className="text-3xl font-bold text-primary">₹{course.price || 1}</span>
                      {course.discountPrice && (
                        <span className="text-sm text-gray-500 line-through ml-2">₹{course.discountPrice}</span>
                      )}
                    </div>
                    <Link
                      href={`/courses/${course._id}`}
                      className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-dark rounded-lg hover:opacity-90 transition-all font-semibold"
                    >
                      View Course
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-primary via-secondary to-accent rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-dark/50"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-black text-white mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of students mastering mathematics with our expert-led courses
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/auth/register"
                className="px-8 py-4 bg-white text-dark rounded-xl font-bold hover:scale-105 transition-all"
              >
                Get Started Free
              </Link>
              <Link
                href="/tools"
                className="px-8 py-4 bg-white/10 backdrop-blur-xl border-2 border-white/30 rounded-xl font-bold text-white hover:bg-white/20 transition-all"
              >
                Explore Tools
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
