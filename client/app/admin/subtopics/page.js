'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import { BookMarked, Plus, Edit, Trash2, ArrowLeft, Paperclip, X, FileText } from 'lucide-react'
import api from '@/utils/api'
import { motion, AnimatePresence } from 'framer-motion'

const MAX_DOC_BYTES = 5 * 1024 * 1024
const MAX_DOC_COUNT = 30

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
  const [formData, setFormData] = useState({ title: '', content: '', lessonId: '', moduleId: '', courseId: '', order: 1, isPublished: true, documents: [] })

  useEffect(() => { fetchModulesAndLessons() }, [user])
  useEffect(() => { if (selectedLesson) fetchSubtopics() }, [selectedLesson])

  const fetchModulesAndLessons = async () => {
    try {
      const modRes = await api.get('/modules')
      const allModules = modRes.data.modules || []
      setModules(allModules)
      const lessonPromises = allModules.map(m => api.get(`/lessons/module/${m._id}`))
      const lessonResults = await Promise.all(lessonPromises)
      const allLessons = lessonResults.flatMap(r => r.data.lessons || [])
      setLessons(allLessons)
      if (!selectedLesson && allLessons.length > 0) setSelectedLesson(allLessons[0]._id)
    } finally { setLoading(false) }
  }

  const fetchSubtopics = async () => {
    const res = await api.get(`/subtopics/lesson/${selectedLesson}`)
    setSubtopics(res.data.subtopics || [])
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
    setFormData({ title: '', content: '', lessonId: selectedLesson, moduleId: module?._id || '', courseId: module?.courseId || '', order: subtopics.length + 1, isPublished: true, documents: [] })
    setShowModal(true)
  }

  const handleEdit = (subtopic) => {
    setSelectedSubtopic(subtopic)
    setDocError('')
    const docs = Array.isArray(subtopic.documents) ? subtopic.documents : (subtopic.document ? [subtopic.document] : [])
    setFormData({ title: subtopic.title, content: subtopic.content || '', lessonId: subtopic.lessonId, moduleId: subtopic.moduleId || '', courseId: subtopic.courseId || '', order: subtopic.order, isPublished: subtopic.isPublished !== false, documents: docs })
    setShowModal(true)
  }

  const handleDocumentUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setDocError('')
    if ((formData.documents.length + files.length) > MAX_DOC_COUNT) { setDocError(`Maximum ${MAX_DOC_COUNT} files allowed`); return }
    const tooLarge = files.find(f => f.size > MAX_DOC_BYTES)
    if (tooLarge) { setDocError('Each file must be 5 MB or smaller'); return }

    const encoded = await Promise.all(files.map(file => new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (ev) => resolve({ name: file.name, size: file.size, type: file.type, data: ev.target.result.split(',')[1] })
      reader.readAsDataURL(file)
    })))
    setFormData(prev => ({ ...prev, documents: [...prev.documents, ...encoded] }))
  }

  const removeDocument = (idx) => setFormData(prev => ({ ...prev, documents: prev.documents.filter((_, i) => i !== idx) }))
  const formatFileSize = (bytes) => bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (docError) return
    if (selectedSubtopic) await api.put(`/subtopics/${selectedSubtopic._id}`, formData)
    else await api.post('/subtopics', formData)
    setShowModal(false)
    fetchSubtopics()
  }

  const handleDelete = async (subtopicId) => {
    if (!confirm('Delete this subtopic?')) return
    await api.delete(`/subtopics/${subtopicId}`)
    fetchSubtopics()
  }

  if (loading) return <div className="min-h-screen bg-dark flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" /></div>

  return <div className="min-h-screen bg-dark"><div className="bg-gradient-to-r from-dark-100 via-dark-100 to-dark-100 border-b border-white/10"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><button onClick={() => router.push('/admin/lessons')} className="p-2 hover:bg-dark-200 rounded-lg transition-all"><ArrowLeft className="h-5 w-5 text-gray-400" /></button><div><h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Subtopic Management</h1><p className="text-gray-400 mt-1">{subtopics.length} subtopics</p></div></div><button onClick={handleCreate} disabled={!selectedLesson} className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg">Add Subtopic</button></div></div></div><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><div className="mb-6"><select value={selectedLesson} onChange={(e) => setSelectedLesson(e.target.value)} className="w-full px-4 py-3 bg-dark-100 border border-white/10 rounded-lg text-white">{lessons.map(l => <option key={l._id} value={l._id}>{l.title}</option>)}</select></div><div className="space-y-4">{subtopics.map((s, i) => <motion.div key={s._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="bg-gradient-to-br from-dark-100/80 to-dark/80 rounded-2xl border border-white/10 p-6"><div className="flex items-center justify-between"><h3 className="text-xl font-bold text-white">{s.title}</h3><div className="flex gap-2"><button onClick={() => handleEdit(s)} className="px-3 py-2 bg-primary/20 text-primary rounded-lg">Edit</button><button onClick={() => handleDelete(s._id)} className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg">Delete</button></div></div></motion.div>)}</div></div><AnimatePresence>{showModal && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}><motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-dark-100 rounded-2xl border border-white/10 p-6 max-w-2xl w-full"><h2 className="text-2xl text-white font-bold mb-5">{selectedSubtopic ? 'Edit Subtopic' : 'Create Subtopic'}</h2><form onSubmit={handleSubmit} className="space-y-4"><input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white" placeholder="Title" required /><textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white" rows="5" placeholder="Content" /><label className="flex items-center gap-3 px-4 py-3 bg-dark-200 border border-dashed border-white/20 rounded-lg cursor-pointer"><Paperclip className="h-5 w-5 text-gray-400" /><span className="text-gray-300">Add files ({formData.documents.length}/{MAX_DOC_COUNT})</span><input type="file" multiple accept=".pdf,.doc,.docx,.txt" onChange={handleDocumentUpload} className="hidden" /></label>{docError && <p className="text-red-400 text-sm">{docError}</p>}<div className="space-y-2">{formData.documents.map((doc, idx) => <div key={`${doc.name}-${idx}`} className="flex items-center justify-between px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-blue-400" /><span className="text-blue-300 text-sm">{doc.name} ({formatFileSize(doc.size)})</span></div><button type="button" onClick={() => removeDocument(idx)} className="text-red-400"><X className="h-4 w-4" /></button></div>)}</div><div className="flex gap-3"><button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-dark-200 text-white rounded-lg">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg">{selectedSubtopic ? 'Update' : 'Create'}</button></div></form></motion.div></motion.div>}</AnimatePresence></div>
}

export default function AdminSubtopics() { return <Suspense fallback={<div className="min-h-screen bg-dark flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" /></div>}><AdminSubtopicsContent /></Suspense> }
