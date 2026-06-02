'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { BookOpen, Plus, Edit, Trash2, ArrowLeft, Search, GripVertical } from 'lucide-react'
import api from '@/utils/api'
import { motion, AnimatePresence } from 'framer-motion'
import { showSuccess, showError } from '@/components/ui/Toast'

export default function AdminModules() {
  const router = useRouter()
  const { user } = useSelector(state => state.auth)
  const [modules, setModules] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedModule, setSelectedModule] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    order: 1,
    duration: '',
    isPublished: true
  })

  useEffect(() => {
  }, [user])

  useEffect(() => {
    fetchCourses()
    fetchModules()
  }, [])

  useEffect(() => {
    fetchModules()
  }, [selectedCourse])

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses')
      setCourses(res.data.courses || [])
      // Don't auto-select — allow "No Course" option
      if (res.data.courses?.length > 0 && !selectedCourse) {
        setSelectedCourse('all')
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchModules = async () => {
    try {
      let res
      if (selectedCourse === 'all' || !selectedCourse) {
        res = await api.get('/modules')
        setModules(res.data.modules || [])
      } else {
        res = await api.get(`/modules/course/${selectedCourse}`)
        setModules(res.data.modules || [])
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error)
    }
  }

  const handleCreate = () => {
    setSelectedModule(null)
    setFormData({
      title: '',
      description: '',
      courseId: selectedCourse,
      order: modules.length + 1,
      duration: '',
      isPublished: true
    })
    setShowModal(true)
  }

  const handleEdit = (module) => {
    setSelectedModule(module)
    setFormData({
      title: module.title,
      description: module.description,
      courseId: module.courseId,
      order: module.order,
      duration: module.duration,
      isPublished: module.isPublished !== false
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (selectedModule) {
        await api.put(`/modules/${selectedModule._id}`, formData)
        showSuccess('Module updated')
      } else {
        await api.post('/modules', formData)
        showSuccess('Module created')
      }
      setShowModal(false)
      fetchModules()
    } catch (error) {
      showError(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (moduleId) => {
    if (!confirm('Are you sure? This will delete all lessons in this module.')) return
    try {
      await api.delete(`/modules/${moduleId}`)
      showSuccess('Module deleted')
      fetchModules()
    } catch (error) {
      showError(error.response?.data?.message || 'Delete failed')
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
                  Module Management
                </h1>
                <p className="text-gray-400 mt-1">{modules.length} modules in selected course</p>
              </div>
            </div>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Module
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Selector */}
        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-medium mb-2">Filter by Course</label>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full px-4 py-3 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
          >
            <option value="all">All Modules</option>
            <option value="">— No Course (Standalone) —</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>{course.title}</option>
            ))}
          </select>
        </div>

        {/* Modules List */}
        <div className="space-y-4">
          {modules.length === 0 ? (
            <div className="text-center py-20 bg-dark-100/50 rounded-2xl border border-white/10">
              <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-xl">No modules found</p>
              <p className="text-gray-500 mt-2">Create your first module to get started</p>
            </div>
          ) : (
            modules.map((module, index) => (
              <motion.div
                key={module._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <GripVertical className="h-6 w-6 text-gray-500 cursor-move" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          Module {module.order}: {module.title}
                        </h3>
                        <p className="text-gray-400 text-sm">{module.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        module.isPublished !== false
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {module.isPublished !== false ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                      <span>Duration: {module.duration || 'Not set'}</span>
                      <span>•</span>
                      <span>Lessons: {module.lessonCount || 0}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/admin/lessons?moduleId=${module._id}`)}
                        className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all text-sm"
                      >
                        Manage Lessons
                      </button>
                      <button
                        onClick={() => handleEdit(module)}
                        className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-all text-sm flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(module._id)}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
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
              className="bg-dark-100 rounded-2xl border border-white/10 p-6 max-w-2xl w-full"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                {selectedModule ? 'Edit Module' : 'Create Module'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Module Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Assign to Course <span className="text-gray-500">(optional)</span></label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                  >
                    <option value="">— Standalone (no course) —</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>{course.title}</option>
                    ))}
                  </select>
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
                    <label className="block text-gray-300 text-sm font-medium mb-2">Order</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Duration</label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g., 2 weeks"
                      className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <label className="text-gray-300">Publish module</label>
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
                    {selectedModule ? 'Update' : 'Create'}
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
