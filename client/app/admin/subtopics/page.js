'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import { BookMarked, Plus, Edit, Trash2, ArrowLeft, Paperclip, X, FileText, Eye, EyeOff } from 'lucide-react'
import api from '@/utils/api'
import { motion, AnimatePresence } from 'framer-motion'

const MAX_DOC_BYTES = 2 * 1024 * 1024 // 2 MB

function AdminSubtopicsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useSelector(state => state.auth)

  const [subtopics, setSubtopics] = useState([])
  const [lessons, setLessons] = useState([])
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLesson, setSelectedLesson] = useState(searchParams.get('lessonId') || '')
  const [showModal, setShowModal] = useState(false)
  const [selectedSubtopic, setSelectedSubtopic] = useState(null)
  const [docError, setDocError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    lessonId: '',
    moduleId: '',
    courseId: '',
    order: 1,
    isPublished: true,
    document: null
  })

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      router.push('/')
      return
    }
    fetchModulesAndLessons()
  }, [user])

  useEffect(() => {
    if (selectedLesson) fetchSubtopics()
  }, [selectedLesson])

  const fetchModulesAndLessons = async () => {
    try {
      const modRes = await api.get('/modules')
      const allModules = modRes.data.modules || []
      setModules(allModules)

      // Fetch all lessons across all modules
      const lessonPromises = allModules.map(m => api.get(`/lessons/module/${m._id}`))
      const lessonResults = await Promise.all(lessonPromises)
      const allLessons = lessonResults.flatMap(r => r.data.lessons || [])
      setLessons(allLessons)

      if (!selectedLesson && allLessons.length > 0) {
        setSelectedLesson(allLessons[0]._id)
      }
    } catch (error) {
      console.error('Failed to fetch modules/lessons:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubtopics = async () => {
    try {
      const res = await api.get(`/subtopics/lesson/${selectedLesson}`)
      setSubtopics(res.data.subtopics || [])
    } catch (error) {
      console.error('Failed to fetch subtopics:', error)
    }
  }

  const getModuleForLesson = (lessonId) => {
    const lesson = lessons.find(l => l._id === lessonId)
    return modules.find(m => m._id === lesson?.moduleId)
  }

  const handleCreate = () => {
    setSelectedSubtopic(null)
    setDocError('')
    const lesson = lessons.find(l => l._id === selectedLesson)
    const module = modules.find(m => m._id === lesson?.moduleId)
    setFormData({
      title: '',
      content: '',
      lessonId: selectedLesson,
      moduleId: module?._id || '',
      courseId: module?.courseId || '',
      order: subtopics.length + 1,
      isPublished: true,
      document: null
    })
    setShowModal(true)
  }

  const handleEdit = (subtopic) => {
    setSelectedSubtopic(subtopic)
    setDocError('')
    setFormData({
      title: subtopic.title,
      content: subtopic.content || '',
      lessonId: subtopic.lessonId,
      moduleId: subtopic.moduleId || '',
      courseId: subtopic.courseId || '',
      order: subtopic.order,
      isPublished: subtopic.isPublished !== false,
      document: subtopic.document || null
    })
    setShowModal(true)
  }

  const handleDocumentUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setDocError('')

    if (file.size > MAX_DOC_BYTES) {
      setDocError('File exceeds 2 MB limit. Please choose a smaller file.')
      e.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = ev.target.result.split(',')[1]
      setFormData(prev => ({
        ...prev,
        document: {
          name: file.name,
          size: file.size,
          type: file.type,
          data: base64
        }
      }))
    }
    reader.readAsDataURL(file)
  }

  const removeDocument = () => {
    setFormData(prev => ({ ...prev, document: null }))
    setDocError('')
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (docError) return
    try {
      if (selectedSubtopic) {
        await api.put(`/subtopics/${selectedSubtopic._id}`, formData)
      } else {
        await api.post('/subtopics', formData)
      }
      setShowModal(false)
      fetchSubtopics()
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (subtopicId) => {
    if (!confirm('Delete this subtopic?')) return
    try {
      await api.delete(`/subtopics/${subtopicId}`)
      fetchSubtopics()
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed')
    }
  }

  const currentLesson = lessons.find(l => l._id === selectedLesson)
  const currentModule = getModuleForLesson(selectedLesson)

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <div className="bg-gradient-to-r from-dark-100 via-dark-100 to-dark-100 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/admin/lessons')} className="p-2 hover:bg-dark-200 rounded-lg transition-all">
                <ArrowLeft className="h-5 w-5 text-gray-400" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Subtopic Management
                </h1>
                <p className="text-gray-400 mt-1">
                  {currentLesson ? `${currentLesson.title}` : 'Select a lesson'} — {subtopics.length} subtopics
                </p>
              </div>
            </div>
            <button
              onClick={handleCreate}
              disabled={!selectedLesson}
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add Subtopic
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Lesson selector */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Select Lesson</label>
            <select
              value={selectedLesson}
              onChange={(e) => setSelectedLesson(e.target.value)}
              className="w-full px-4 py-3 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
            >
              {lessons.length === 0 && <option value="">No lessons found</option>}
              {modules.map(mod => {
                const modLessons = lessons.filter(l => l.moduleId === mod._id)
                if (modLessons.length === 0) return null
                return (
                  <optgroup key={mod._id} label={mod.title}>
                    {modLessons.map(lesson => (
                      <option key={lesson._id} value={lesson._id}>{lesson.title}</option>
                    ))}
                  </optgroup>
                )
              })}
            </select>
          </div>
          {currentModule && (
            <div className="flex items-end">
              <div className="px-4 py-3 bg-dark-100 border border-white/10 rounded-lg text-gray-400 text-sm w-full">
                <span className="text-gray-500">Module: </span>
                <span className="text-white">{currentModule.title}</span>
              </div>
            </div>
          )}
        </div>

        {/* Subtopics list */}
        <div className="space-y-4">
          {subtopics.length === 0 ? (
            <div className="text-center py-20 bg-dark-100/50 rounded-2xl border border-white/10">
              <BookMarked className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-xl">No subtopics yet</p>
              <p className="text-gray-500 mt-2">Add subtopics to break down this lesson into smaller sections</p>
            </div>
          ) : (
            subtopics.map((subtopic, index) => (
              <motion.div
                key={subtopic._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                        #{subtopic.order}
                      </span>
                      <h3 className="text-xl font-bold text-white">{subtopic.title}</h3>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2">{subtopic.content}</p>
                  </div>
                  <span className={`ml-4 px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                    subtopic.isPublished !== false
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {subtopic.isPublished !== false ? 'Published' : 'Draft'}
                  </span>
                </div>

                {subtopic.document && (
                  <div className="flex items-center gap-2 mt-3 mb-3 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg w-fit">
                    <FileText className="h-4 w-4 text-blue-400" />
                    <span className="text-blue-300 text-sm">{subtopic.document.name}</span>
                    <span className="text-blue-400/60 text-xs">({formatFileSize(subtopic.document.size)})</span>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(subtopic)}
                    className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-all text-sm flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(subtopic._id)}
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

      {/* Modal */}
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
              className="bg-dark-100 rounded-2xl border border-white/10 p-6 max-w-2xl w-full my-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                {selectedSubtopic ? 'Edit Subtopic' : 'Create Subtopic'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Subtopic Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    placeholder="e.g., Types of Fractions"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    rows="6"
                    placeholder="Write the subtopic content here. Markdown is supported."
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    min="1"
                    required
                  />
                </div>

                {/* Document attachment */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Attach Document <span className="text-gray-500 font-normal">(PDF, DOC, DOCX — max 2 MB)</span>
                  </label>

                  {formData.document ? (
                    <div className="flex items-center gap-3 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-blue-300 text-sm font-medium truncate">{formData.document.name}</p>
                        <p className="text-blue-400/60 text-xs">{formatFileSize(formData.document.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={removeDocument}
                        className="p-1 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400 transition-all"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-3 px-4 py-3 bg-dark-200 border border-dashed border-white/20 rounded-lg cursor-pointer hover:border-primary/50 transition-all">
                      <Paperclip className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-400 text-sm">Click to attach a document</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleDocumentUpload}
                        className="hidden"
                      />
                    </label>
                  )}

                  {docError && (
                    <p className="mt-2 text-red-400 text-sm">{docError}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <label htmlFor="isPublished" className="text-gray-300">Publish subtopic</label>
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
                    disabled={!!docError}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {selectedSubtopic ? 'Update' : 'Create'}
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

export default function AdminSubtopics() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <AdminSubtopicsContent />
    </Suspense>
  )
}
