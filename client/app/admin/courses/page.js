'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { BookOpen, Plus, Edit, Trash2, Eye, EyeOff, ArrowLeft, Search, Layers } from 'lucide-react'
import api from '@/utils/api'
import { COURSE_CATEGORIES } from '@/lib/constants'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminCourses() {
  const router = useRouter()
  const { user } = useSelector(state => state.auth)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Mathematics',
    difficulty: 'Beginner',
    price: '',
    duration: '',
    status: 'draft'
  })

  useEffect(() => {
    fetchCourses()
  }, [user, search])

  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      
      const res = await api.get(`/admin/courses?${params}`)
      setCourses(res.data.courses)
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedCourse(null)
    setFormData({
      title: '',
      description: '',
      category: 'Mathematics',
      difficulty: 'Beginner',
      price: 0,
      duration: '',
      status: 'draft'
    })
    setShowModal(true)
  }

  const handleEdit = (course) => {
    setSelectedCourse(course)
    setFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      difficulty: course.difficulty,
      price: course.price,
      duration: course.duration,
      status: course.status || 'draft'
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (selectedCourse) {
        await api.put(`/admin/courses/${selectedCourse._id}`, formData)
      } else {
        await api.post('/admin/courses', formData)
      }
      setShowModal(false)
      fetchCourses()
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (courseId) => {
    if (!confirm('Are you sure? This will delete all related modules and lessons.')) return
    
    try {
      await api.delete(`/admin/courses/${courseId}`)
      fetchCourses()
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed')
    }
  }

  const handleToggleStatus = async (courseId) => {
    try {
      await api.post(`/admin/courses/${courseId}/toggle-status`)
      fetchCourses()
    } catch (error) {
      alert(error.response?.data?.message || 'Status toggle failed')
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
                  Course Management
                </h1>
                <p className="text-gray-400 mt-1">{courses.length} total courses</p>
              </div>
            </div>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Course
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-100 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">{course.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2">{course.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  course.status === 'published' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {course.status || 'draft'}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Category:</span>
                  <span className="text-white">{course.category}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Price:</span>
                  <span className="text-primary font-semibold">₹{course.price}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Enrolled:</span>
                  <span className="text-white">{course.enrolledCount || 0}</span>
                </div>
              </div>

              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => router.push(`/admin/modules?courseId=${course._id}`)}
                  className="flex-1 px-3 py-2 bg-secondary/20 text-secondary rounded-lg hover:bg-secondary/30 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Layers className="h-4 w-4" />
                  Modules
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(course)}
                  className="flex-1 px-3 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-all flex items-center justify-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleToggleStatus(course._id)}
                  className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all"
                  title={course.status === 'published' ? 'Unpublish' : 'Publish'}
                >
                  {course.status === 'published' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => handleDelete(course._id)}
                  className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-100 rounded-2xl border border-white/10 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                {selectedCourse ? 'Edit Course' : 'Create Course'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    rows="3"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    >
                      {COURSE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option>Statistics</option>
                      <option>Trigonometry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Price (₹)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                      placeholder="e.g. 999"
                      min="1"
                      required
                    />
                    <p className="text-gray-500 text-xs mt-1">Enter ₹1 or more. Use isFree flag for free courses.</p>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Duration</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g., 8 weeks"
                      className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                  <p className="text-gray-500 text-xs mt-1">Published courses are visible to students.</p>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-dark-200 text-white rounded-lg hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all"
                  >
                    {selectedCourse ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
