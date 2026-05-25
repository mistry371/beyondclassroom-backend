'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { ArrowLeft, Video, Plus, Trash2, Edit2, X, Calendar, Clock, Users, ExternalLink, Circle, CheckCircle, AlertCircle, Copy } from 'lucide-react'
import api from '@/utils/api'
import { motion, AnimatePresence } from 'framer-motion'

const EMPTY_FORM = {
  title: '', instructor: '', date: '', time: '',
  duration: '60', topic: '', zoomLink: '', maxStudents: 30, status: 'upcoming', recordingUrl: ''
}

export default function AdminLiveClasses() {
  const router = useRouter()
  const { user } = useSelector(state => state.auth)
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editClass, setEditClass] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState(null)
  const [copied, setCopied] = useState(null)

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) { router.push('/'); return }
    fetchClasses()
  }, [user])

  const fetchClasses = async () => {
    try {
      const res = await api.get('/admin/live-classes')
      setClasses(res.data.liveClasses || [])
    } catch (error) {
      console.error('Failed to fetch live classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => { setEditClass(null); setForm(EMPTY_FORM); setSaveMsg(null); setShowModal(true) }
  const openEdit = (cls) => {
    setEditClass(cls)
    setForm({
      title: cls.title || '',
      instructor: cls.instructor || '',
      date: cls.date || '',
      time: cls.time || '',
      duration: cls.duration?.replace(/\D/g, '') || '60',
      topic: cls.topic || '',
      zoomLink: cls.zoomLink || '',
      maxStudents: cls.maxStudents || 30,
      status: cls.status || 'upcoming',
      recordingUrl: cls.recordingUrl || ''
    })
    setSaveMsg(null)
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveMsg(null)
    try {
      const payload = { ...form, duration: `${form.duration} min` }
      let res
      if (editClass) {
        res = await api.put(`/admin/live-classes/${editClass._id}`, payload)
        setSaveMsg({ type: 'success', text: 'Class updated successfully!' })
      } else {
        res = await api.post('/admin/live-classes', payload)
        const zs = res.data.zoomStatus
        if (zs === 'auto') {
          setSaveMsg({ type: 'success', text: '✅ Class scheduled & Zoom meeting created automatically!' })
        } else if (zs === 'manual') {
          setSaveMsg({ type: 'info', text: '✅ Class scheduled with manual Zoom link.' })
        } else {
          setSaveMsg({ type: 'warn', text: '⚠️ Class saved but Zoom meeting could not be created. Please add a Zoom link manually.' })
        }
      }
      fetchClasses()
      if (editClass) setTimeout(() => setShowModal(false), 1200)
    } catch (error) {
      setSaveMsg({ type: 'error', text: error.response?.data?.message || 'Save failed' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this live class? The Zoom meeting will also be cancelled.')) return
    try {
      await api.delete(`/admin/live-classes/${id}`)
      fetchClasses()
    } catch (error) {
      alert('Delete failed')
    }
  }

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const statusColor = (s) =>
    s === 'live' ? 'bg-red-500/20 text-red-400' :
    s === 'recorded' ? 'bg-gray-500/20 text-gray-400' :
    'bg-blue-500/20 text-blue-400'

  const zoomBadge = (cls) => {
    if (cls.zoomStatus === 'auto') return <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle className="h-3 w-3" />Auto-created</span>
    if (cls.zoomLink) return <span className="text-xs text-blue-400 flex items-center gap-1"><CheckCircle className="h-3 w-3" />Manual link</span>
    return <span className="text-xs text-yellow-400 flex items-center gap-1"><AlertCircle className="h-3 w-3" />No Zoom link</span>
  }

  if (loading) return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  )

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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Live Classes</h1>
                <p className="text-gray-400 mt-1">{classes.length} classes • Zoom auto-integration enabled</p>
              </div>
            </div>
            <button onClick={openCreate}
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Schedule Class
            </button>
          </div>
        </div>
      </div>

      {/* Zoom Setup Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-green-300 font-semibold mb-1">Zoom Integration Active</p>
            <p className="text-gray-400">
              Each scheduled class automatically gets a unique Zoom meeting with its own join link, host start URL, and password.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {classes.length === 0 ? (
          <div className="text-center py-20">
            <Video className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl mb-4">No live classes scheduled</p>
            <button onClick={openCreate} className="px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all">
              Schedule First Class
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls, index) => (
              <motion.div key={cls._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-primary/20 rounded-lg"><Video className="h-5 w-5 text-primary" /></div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusColor(cls.status)}`}>
                    {cls.status === 'live' && <Circle className="h-2 w-2 fill-red-400 animate-pulse" />}
                    {cls.status}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{cls.title}</h3>
                <p className="text-primary text-sm mb-1">{cls.topic}</p>
                <div className="mb-3">{zoomBadge(cls)}</div>

                <div className="space-y-1 mb-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2"><Users className="h-4 w-4" />{cls.instructor}</div>
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />{cls.date} at {cls.time}</div>
                  <div className="flex items-center gap-2"><Clock className="h-4 w-4" />{cls.duration} • Max {cls.maxStudents}</div>
                </div>

                {/* Zoom Links */}
                {cls.zoomLink && (
                  <div className="mb-3 space-y-2">
                    <div className="flex items-center gap-2 bg-dark-200/50 rounded-lg p-2">
                      <ExternalLink className="h-3 w-3 text-blue-400 flex-shrink-0" />
                      <span className="text-blue-400 text-xs truncate flex-1">Join: {cls.zoomLink}</span>
                      <button onClick={() => copyToClipboard(cls.zoomLink, cls._id + '_join')}
                        className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                      >
                        {copied === cls._id + '_join' ? <CheckCircle className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                    {cls.zoomStartUrl && (
                      <div className="flex items-center gap-2 bg-dark-200/50 rounded-lg p-2">
                        <Video className="h-3 w-3 text-green-400 flex-shrink-0" />
                        <span className="text-green-400 text-xs flex-1">Host Start URL</span>
                        <button onClick={() => copyToClipboard(cls.zoomStartUrl, cls._id + '_start')}
                          className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
                        >
                          {copied === cls._id + '_start' ? <CheckCircle className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                        </button>
                        <a href={cls.zoomStartUrl} target="_blank" rel="noreferrer"
                          className="text-green-400 hover:text-green-300 transition-colors flex-shrink-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                    {cls.zoomPassword && (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>Password:</span>
                        <code className="bg-dark-200 px-2 py-0.5 rounded text-yellow-400">{cls.zoomPassword}</code>
                        <button onClick={() => copyToClipboard(cls.zoomPassword, cls._id + '_pass')}
                          className="text-gray-400 hover:text-white"
                        >
                          {copied === cls._id + '_pass' ? <CheckCircle className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={() => openEdit(cls)}
                    className="flex-1 px-3 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-all text-sm flex items-center justify-center gap-1"
                  >
                    <Edit2 className="h-4 w-4" /> Edit
                  </button>
                  <button onClick={() => handleDelete(cls._id)}
                    className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="bg-dark-100 rounded-2xl border border-white/10 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">{editClass ? 'Edit Class' : 'Schedule Live Class'}</h2>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-dark-200 rounded-lg"><X className="h-5 w-5 text-gray-400" /></button>
              </div>

              {!editClass && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-4 flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-green-300 text-xs">
                    A unique Zoom meeting will be created automatically when you schedule this class. You can also enter a manual link below.
                  </p>
                </div>
              )}

              {saveMsg && (
                <div className={`rounded-xl p-3 mb-4 text-sm flex items-start gap-2 ${
                  saveMsg.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-300' :
                  saveMsg.type === 'warn' ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-300' :
                  saveMsg.type === 'info' ? 'bg-blue-500/10 border border-blue-500/30 text-blue-300' :
                  'bg-red-500/10 border border-red-500/30 text-red-300'
                }`}>
                  {saveMsg.text}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-gray-300 text-sm font-medium mb-1">Class Title *</label>
                    <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                      placeholder="Mathematics Fundamentals - Live Session" required
                      className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Instructor *</label>
                    <input type="text" value={form.instructor} onChange={e => setForm({ ...form, instructor: e.target.value })}
                      placeholder="Dr. Sharma" required
                      className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Topic</label>
                    <input type="text" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}
                      placeholder="Quadratic Equations"
                      className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Date *</label>
                    <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required
                      className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Time *</label>
                    <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} required
                      className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Duration (minutes)</label>
                    <input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}
                      placeholder="60" min="15" max="480"
                      className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Max Students</label>
                    <input type="number" value={form.maxStudents} onChange={e => setForm({ ...form, maxStudents: e.target.value })}
                      placeholder="30"
                      className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">
                    Manual Zoom Link <span className="text-gray-500 font-normal">(optional — auto-created if blank)</span>
                  </label>
                  <input type="url" value={form.zoomLink} onChange={e => setForm({ ...form, zoomLink: e.target.value })}
                    placeholder="https://zoom.us/j/... (leave blank for auto)"
                    className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="live">Live Now</option>
                    <option value="recorded">Recorded</option>
                  </select>
                </div>

                {form.status === 'recorded' && (
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">
                      Recording URL <span className="text-gray-500 font-normal">(Zoom cloud recording link)</span>
                    </label>
                    <input type="url" value={form.recordingUrl} onChange={e => setForm({ ...form, recordingUrl: e.target.value })}
                      placeholder="https://zoom.us/rec/share/..."
                      className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                )}

                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-dark-200 text-white rounded-lg hover:bg-gray-600 transition-all"
                  >Cancel</button>
                  <button type="submit" disabled={saving}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      {editClass ? 'Updating...' : 'Creating Zoom...'}</>
                    ) : editClass ? 'Update' : 'Schedule & Create Zoom'}
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
