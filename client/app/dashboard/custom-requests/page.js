'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { BookOpen, Plus, CreditCard, CheckCircle, RefreshCw, PackageCheck } from 'lucide-react'
import Navbar from '@/components/Navbar'
import api from '@/utils/api'
import { motion, AnimatePresence } from 'framer-motion'

const STATUS_COLORS = {
  pending: 'bg-yellow-500/20 text-yellow-400',
  reviewing: 'bg-blue-500/20 text-blue-400',
  quoted: 'bg-purple-500/20 text-purple-400',
  accepted: 'bg-green-500/20 text-green-400',
  completed: 'bg-green-600/20 text-green-300',
  rejected: 'bg-red-500/20 text-red-400',
}

export default function CustomRequestsPage() {
  const router = useRouter()
  const { user } = useSelector(s => s.auth)
  const [requests, setRequests] = useState([])
  const [courses, setCourses] = useState([])
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedTopics, setSelectedTopics] = useState([])
  const [expandedCourse, setExpandedCourse] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', deliverable: 'question_paper', difficulty: 'medium', deadline: '', budget: '' })
  const [messageByRequest, setMessageByRequest] = useState({})

  useEffect(() => {
    if (!user) { router.push('/auth/login?redirect=/dashboard/custom-requests'); return }
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      const [reqRes, courseRes] = await Promise.all([
        api.get('/custom-requests/my'),
        api.get('/courses')
      ])
      setRequests(reqRes.data.requests || [])
      const allCourses = courseRes.data.courses || []
      setCourses(allCourses)
      // Fetch modules for all courses
      const modResults = await Promise.all(allCourses.map(c => api.get('/modules/course/' + c._id).catch(() => ({ data: { modules: [] } }))))
      const allMods = modResults.flatMap((r, i) => (r.data.modules || []).map(m => ({ ...m, courseTitle: allCourses[i].title })))
      setModules(allMods)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const toggleTopic = (mod, course) => {
    const key = mod._id
    const exists = selectedTopics.find(t => t.moduleId === key)
    if (exists) setSelectedTopics(prev => prev.filter(t => t.moduleId !== key))
    else setSelectedTopics(prev => [...prev, { courseId: course._id, courseTitle: course.title, moduleId: mod._id, moduleTitle: mod.title }])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (selectedTopics.length === 0) { alert('Please select at least one topic/module'); return }
    try {
      await api.post('/custom-requests', { ...form, selectedTopics })
      setShowForm(false)
      setSelectedTopics([])
      setForm({ title: '', description: '', deliverable: 'question_paper', difficulty: 'medium', deadline: '', budget: '' })
      fetchData()
    } catch (err) { alert(err.response?.data?.message || 'Failed to submit') }
  }

  const handleRequestAction = async (id, action) => {
    try {
      await api.put('/custom-requests/my/' + id, {
        action,
        message: messageByRequest[id] || ''
      })
      setMessageByRequest(prev => ({ ...prev, [id]: '' }))
      fetchData()
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed')
    }
  }

  if (loading) return <div className="min-h-screen bg-dark flex items-center justify-center"><Navbar/><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>

  return (
    <div className="min-h-screen bg-dark">
      <Navbar/>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">Custom Study Requests</h1>
            <p className="text-gray-400 mt-1">Select topics from any course and request a custom question paper or study notes</p>
          </div>
          <button onClick={() => setShowForm(true)} className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold hover:opacity-90 flex items-center gap-2">
            <Plus className="h-4 w-4"/> New Request
          </button>
        </div>

        {/* Existing requests */}
        {requests.length === 0 ? (
          <div className="text-center py-16 bg-dark-100/50 rounded-2xl border border-white/10">
            <BookOpen className="h-14 w-14 text-gray-600 mx-auto mb-4"/>
            <p className="text-gray-400 text-lg">No requests yet</p>
            <p className="text-gray-500 text-sm mt-1">Create a custom request to get a personalised question paper</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req, i) => (
              <motion.div key={req._id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
                className="bg-dark-100/80 rounded-2xl border border-white/10 p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-bold text-lg">{req.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{req.description}</p>
                  </div>
                  <span className={"px-3 py-1 rounded-full text-xs font-bold " + (STATUS_COLORS[req.status] || 'bg-gray-500/20 text-gray-400')}>
                    {req.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(req.selectedTopics || req.selectedModules || []).map(t => (
                    <span key={t.moduleId} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">{t.moduleTitle}</span>
                  ))}
                  {(req.selectedLessons || []).map(t => (
                    <span key={t.lessonId} className="px-2 py-1 bg-blue-500/10 text-blue-300 rounded text-xs">{t.lessonTitle}</span>
                  ))}
                  {(req.selectedSubtopics || []).map(t => (
                    <span key={t.subtopicId} className="px-2 py-1 bg-green-500/10 text-green-300 rounded text-xs">{t.subtopicTitle}</span>
                  ))}
                  {(req.selectedPdfs || []).map(t => (
                    <span key={`${t.subtopicId}-${t.name}`} className="px-2 py-1 bg-orange-500/10 text-orange-300 rounded text-xs">{t.name}</span>
                  ))}
                </div>
                <div className="flex gap-4 text-sm text-gray-400">
                  <span>Type: <span className="text-white">{req.deliverable.replace('_',' ')}</span></span>
                  <span>Difficulty: <span className="text-white">{req.difficulty}</span></span>
                  {req.budget && <span>Budget: <span className="text-white">Rs.{req.budget}</span></span>}
                  {req.quotedPrice && <span className="text-purple-400 font-bold">Quoted: Rs.{req.quotedPrice}</span>}
                  {req.finalPrice && <span className="text-purple-400 font-bold">Final: Rs.{req.finalPrice}</span>}
                  {req.estimatedDuration && <span>Duration: <span className="text-white">{req.estimatedDuration}</span></span>}
                  {req.paymentStatus && <span>Payment: <span className="text-white">{req.paymentStatus}</span></span>}
                </div>
                {(req.roadmap || []).length > 0 && (
                  <div className="mt-3 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-blue-300 text-sm font-semibold mb-2">Personalized Roadmap</p>
                    <ul className="space-y-1 text-sm text-gray-300">
                      {req.roadmap.map((item, idx) => <li key={`${item}-${idx}`}>- {item}</li>)}
                    </ul>
                  </div>
                )}
                {req.finalRoadmap && (
                  <div className="mt-3 bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-sm text-purple-100">
                    <p className="font-semibold mb-1">Admin Final Roadmap</p>
                    <p>{req.finalRoadmap}</p>
                  </div>
                )}
                {req.adminNote && <p className="mt-3 text-sm text-yellow-300 bg-yellow-500/10 rounded-lg px-3 py-2">{req.adminNote}</p>}
                {(req.deliveryItems || []).length > 0 && (
                  <div className="mt-3 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <p className="text-green-300 text-sm font-semibold mb-2">Delivered by Admin</p>
                    <div className="space-y-2">
                      {req.deliveryItems.map((d, idx) => (
                        <a key={`${d.url}-${idx}`} href={d.url} target="_blank" rel="noreferrer" className="block text-sm text-green-200 underline">
                          {d.title} ({d.type}) {d.note ? `- ${d.note}` : ''}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {['quoted', 'reviewing'].includes(req.status) && (
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <textarea
                      value={messageByRequest[req._id] || ''}
                      onChange={(e) => setMessageByRequest(prev => ({ ...prev, [req._id]: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 bg-dark-200 border border-white/10 rounded-lg text-white text-sm mb-3"
                      placeholder="Modification note for admin (optional)"
                    />
                    <div className="flex flex-wrap gap-2">
                      {req.status === 'quoted' && (
                        <>
                          <button onClick={() => handleRequestAction(req._id, 'accept')} className="px-3 py-2 bg-green-500/20 text-green-300 rounded-lg text-sm font-semibold inline-flex items-center gap-2"><CheckCircle className="h-4 w-4"/>Accept Package</button>
                          <button onClick={() => handleRequestAction(req._id, 'purchase')} className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-semibold inline-flex items-center gap-2"><CreditCard className="h-4 w-4"/>Purchase Package</button>
                        </>
                      )}
                      <button onClick={() => handleRequestAction(req._id, 'request_modification')} className="px-3 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg text-sm font-semibold inline-flex items-center gap-2"><RefreshCw className="h-4 w-4"/>Request Changes</button>
                    </div>
                  </div>
                )}
                {req.status === 'completed' && (
                  <div className="mt-4 px-3 py-2 rounded-lg bg-green-500/10 text-green-300 text-sm font-semibold inline-flex items-center gap-2">
                    <PackageCheck className="h-4 w-4"/> Personalized package unlocked
                  </div>
                )}
                <p className="text-gray-500 text-xs mt-3">{new Date(req.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* New Request Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
            onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale:0.95, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:0.95, opacity:0 }}
              onClick={e => e.stopPropagation()}
              className="bg-dark-100 rounded-2xl border border-white/10 p-6 w-full max-w-2xl my-8">
              <h2 className="text-2xl font-bold text-white mb-6">New Custom Request</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Request Title *</label>
                  <input className="w-full px-3 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary text-sm"
                    value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} placeholder="e.g. Mathematics + French Question Paper" required/>
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">Description</label>
                  <textarea className="w-full px-3 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary text-sm" rows={3}
                    value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Any specific requirements, number of questions, marks distribution..."/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Deliverable *</label>
                    <select className="w-full px-3 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary text-sm"
                      value={form.deliverable} onChange={e => setForm(f => ({...f, deliverable: e.target.value}))}>
                      <option value="question_paper">Question Paper</option>
                      <option value="study_notes">Study Notes</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Difficulty</label>
                    <select className="w-full px-3 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary text-sm"
                      value={form.difficulty} onChange={e => setForm(f => ({...f, difficulty: e.target.value}))}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Deadline (optional)</label>
                    <input type="date" className="w-full px-3 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary text-sm"
                      value={form.deadline} onChange={e => setForm(f => ({...f, deadline: e.target.value}))}/>
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Your Budget (Rs.)</label>
                    <input type="number" className="w-full px-3 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary text-sm"
                      value={form.budget} onChange={e => setForm(f => ({...f, budget: e.target.value}))} placeholder="e.g. 500"/>
                  </div>
                </div>

                {/* Topic selector */}
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Select Topics/Modules * <span className="text-gray-500">({selectedTopics.length} selected)</span></label>
                  <div className="max-h-64 overflow-y-auto space-y-2 border border-white/10 rounded-xl p-3 bg-dark-200/30">
                    {courses.map(course => {
                      const courseMods = modules.filter(m => m.courseId === course._id)
                      if (courseMods.length === 0) return null
                      return (
                        <div key={course._id}>
                          <button type="button" onClick={() => setExpandedCourse(expandedCourse === course._id ? null : course._id)}
                            className="w-full text-left px-3 py-2 bg-dark-200/60 rounded-lg text-white text-sm font-medium hover:bg-dark-200 transition-all flex items-center justify-between">
                            <span>{course.title}</span>
                            <span className="text-gray-400 text-xs">{courseMods.length} modules</span>
                          </button>
                          {expandedCourse === course._id && (
                            <div className="mt-1 ml-3 space-y-1">
                              {courseMods.map(mod => {
                                const selected = selectedTopics.find(t => t.moduleId === mod._id)
                                return (
                                  <label key={mod._id} className={"flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all " + (selected ? "bg-primary/20 border border-primary/30" : "hover:bg-dark-200/50")}>
                                    <input type="checkbox" checked={!!selected} onChange={() => toggleTopic(mod, course)} className="accent-primary"/>
                                    <span className="text-gray-300 text-sm">{mod.title}</span>
                                  </label>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  {selectedTopics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedTopics.map(t => (
                        <span key={t.moduleId} className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs">{t.moduleTitle}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-sm text-yellow-300">
                  After submission, our team will review your request and send you a price quote. You can then pay and receive your custom material.
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-dark-200 text-white rounded-xl hover:bg-gray-600 text-sm">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold hover:opacity-90 text-sm">Submit Request</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
