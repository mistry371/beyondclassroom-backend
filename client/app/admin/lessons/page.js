'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import { FileText, Plus, Edit, Trash2, ArrowLeft, Video, BookMarked } from 'lucide-react'
import api from '@/utils/api'
import { motion, AnimatePresence } from 'framer-motion'

function AdminLessonsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useSelector(state => state.auth)
  const [lessons, setLessons] = useState([])
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedModule, setSelectedModule] = useState(searchParams.get('moduleId') || '')
  const [showModal, setShowModal] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    moduleId: '',
    order: 1,
    duration: '',
    videoUrl: '',
    isPublished: true
  })

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      router.push('/')
      return
    }
    fetchModules()
  }, [user])

  useEffect(() => {
    if (selectedModule) {
      fetchLessons()
    }
  }, [selectedModule])

  const fetchModules = async () => {
    try {
      const res = await api.get('/modules')
      setModules(res.data.modules || [])
      if (!selectedModule && res.data.modules?.length > 0) {
        setSelectedModule(res.data.modules[0]._id)
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLessons = async () => {
    try {
      const res = await api.get(`/lessons/module/${selectedModule}`)
      setLessons(res.data.lessons || [])
    } catch (error) {
      console.error('Failed to fetch lessons:', error)
    }
  }

  const handleCreate = () => {
    setSelectedLesson(null)
    setFormData({
      title: '',
      content: '',
      moduleId: selectedModule,
      order: lessons.length + 1,
      duration: '',
      videoUrl: '',
      isPublished: true
    })
    setShowModal(true)
  }

  const handleEdit = (lesson) => {
    setSelectedLesson(lesson)
    const contentStr = typeof lesson.content === 'object'
      ? lesson.content?.concept || lesson.description || ''
      : lesson.content || lesson.description || ''
    setFormData({
      title: lesson.title,
      content: contentStr,
      moduleId: lesson.moduleId,
      order: lesson.order,
      duration: lesson.duration,
      videoUrl: lesson.videoUrl || '',
      isPublished: lesson.isPublished !== false
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (selectedLesson) {
        await api.put(`/lessons/${selectedLesson._id}`, formData)
      } else {
        await api.post('/lessons', formData)
      }
      setShowModal(false)
      fetchLessons()
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (lessonId) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return
    
    try {
      await api.delete(`/lessons/${lessonId}`)
      fetchLessons()
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed')
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
              <button onClick={() => router.push('/admin/modules')} className="p-2 hover:bg-dark-200 rounded-lg transition-all">
                <ArrowLeft className="h-5 w-5 text-gray-400" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Lesson Management
                </h1>
                <p className="text-gray-400 mt-1">{lessons.length} lessons in selected module</p>
              </div>
            </div>
            <button
              onClick={handleCreate}
              disabled={!selectedModule}
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add Lesson
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-medium mb-2">Select Module</label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="w-full px-4 py-3 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
          >
            {modules.map(module => (
              <option key={module._id} value={module._id}>{module.title}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {lessons.length === 0 ? (
            <div className="text-center py-20 bg-dark-100/50 rounded-2xl border border-white/10">
              <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-xl">No lessons found</p>
              <p className="text-gray-500 mt-2">Create your first lesson to get started</p>
            </div>
          ) : (
            lessons.map((lesson, index) => (
              <motion.div
                key={lesson._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">
                      Lesson {lesson.order}: {lesson.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {typeof lesson.content === 'object'
                        ? lesson.content?.concept || lesson.description || ''
                        : lesson.content || lesson.description || ''}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    lesson.isPublished !== false
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {lesson.isPublished !== false ? 'Published' : 'Draft'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <span>Duration: {lesson.duration || 'Not set'}</span>
                  {lesson.videoUrl && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Video className="h-4 w-4" />
                        Video included
                      </span>
                    </>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(lesson)}
                    className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-all text-sm flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => router.push(`/admin/subtopics?lessonId=${lesson._id}`)}
                    className="px-4 py-2 bg-teal-500/20 text-teal-400 rounded-lg hover:bg-teal-500/30 transition-all text-sm flex items-center gap-2"
                  >
                    <BookMarked className="h-4 w-4" />
                    Subtopics
                  </button>
                  <button
                    onClick={() => handleDelete(lesson._id)}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-100 rounded-2xl border border-white/10 p-6 max-w-4xl w-full my-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                {selectedLesson ? 'Edit Lesson' : 'Create Lesson'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Lesson Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    rows="8"
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
                      placeholder="e.g., 30 minutes"
                      className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Video URL (Optional)</label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <label className="text-gray-300">Publish lesson</label>
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
                    {selectedLesson ? 'Update' : 'Create'}
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

export default function AdminLessons() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>}>
      <AdminLessonsContent />
    </Suspense>
  )
}
