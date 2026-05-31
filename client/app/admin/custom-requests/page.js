'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { ArrowLeft, Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react'
import api from '@/utils/api'
import { motion } from 'framer-motion'

const STATUS_COLORS = {
  pending:'bg-yellow-500/20 text-yellow-400', reviewing:'bg-blue-500/20 text-blue-400',
  quoted:'bg-purple-500/20 text-purple-400', accepted:'bg-green-500/20 text-green-400',
  completed:'bg-green-600/20 text-green-300', rejected:'bg-red-500/20 text-red-400'
}

export default function AdminCustomRequests() {
  const router = useRouter()
  const { user } = useSelector(s => s.auth)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ status:'', adminNote:'', quotedPrice:'', assignedToUserId:'', deliveryTitle:'', deliveryType:'question_paper', deliveryUrl:'', deliveryNote:'' })

  useEffect(() => {
    api.get('/custom-requests/admin').then(r => setRequests(r.data.requests || [])).catch(console.error).finally(() => setLoading(false))
  }, [user])

  const openEdit = (req) => { setSelected(req); setForm({ status: req.status, adminNote: req.adminNote || '', quotedPrice: req.quotedPrice || '', assignedToUserId: req.assignedToUserId || req.userId || '', deliveryTitle:'', deliveryType:'question_paper', deliveryUrl:'', deliveryNote:'' }) }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const payload = { status: form.status, adminNote: form.adminNote, quotedPrice: form.quotedPrice, assignedToUserId: form.assignedToUserId }
      if (form.deliveryUrl && form.deliveryTitle) {
        payload.deliveryItems = [
          ...(selected.deliveryItems || []),
          { title: form.deliveryTitle, type: form.deliveryType, url: form.deliveryUrl, note: form.deliveryNote }
        ]
      }
      await api.put('/custom-requests/admin/' + selected._id, payload)
      setSelected(null)
      const r = await api.get('/custom-requests/admin')
      setRequests(r.data.requests || [])
    } catch (err) { alert('Update failed') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this request?')) return
    await api.delete('/custom-requests/admin/' + id)
    setRequests(prev => prev.filter(r => r._id !== id))
  }

  if (loading) return <div className="min-h-screen bg-dark flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>

  return (
    <div className="min-h-screen bg-dark">
      <div className="bg-dark-100 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-4">
          <button onClick={() => router.push('/admin')} className="p-2 hover:bg-dark-200 rounded-lg"><ArrowLeft className="h-5 w-5 text-gray-400"/></button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Custom Requests</h1>
            <p className="text-gray-400 mt-1">{requests.length} total requests</p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-20 bg-dark-100/50 rounded-2xl border border-white/10">
            <MessageSquare className="h-16 w-16 text-gray-600 mx-auto mb-4"/>
            <p className="text-gray-400 text-xl">No custom requests yet</p>
          </div>
        ) : requests.map((req, i) => (
          <motion.div key={req._id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.04 }}
            className="bg-dark-100/80 rounded-2xl border border-white/10 p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-white font-bold">{req.title}</h3>
                  <span className={"px-2 py-0.5 rounded-full text-xs font-bold " + (STATUS_COLORS[req.status] || '')}>{req.status.toUpperCase()}</span>
                </div>
                <p className="text-gray-400 text-sm">{req.userName} · {req.userEmail}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(req)} className="px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-sm hover:bg-primary/30">Manage</button>
                <button onClick={() => handleDelete(req._id)} className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30">Delete</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {req.selectedTopics.map(t => <span key={t.moduleId} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">{t.moduleTitle}</span>)}
            </div>
            <div className="flex gap-4 text-sm text-gray-400">
              <span>Type: <span className="text-white">{req.deliverable.replace('_',' ')}</span></span>
              <span>Difficulty: <span className="text-white">{req.difficulty}</span></span>
              {req.budget && <span>Budget: <span className="text-white">Rs.{req.budget}</span></span>}
              {req.quotedPrice && <span className="text-purple-400 font-bold">Quoted: Rs.{req.quotedPrice}</span>}
              {req.deadline && <span>Deadline: <span className="text-white">{req.deadline}</span></span>}
            </div>
            {req.description && <p className="text-gray-400 text-sm mt-2">{req.description}</p>}
            <p className="text-gray-500 text-xs mt-2">{new Date(req.createdAt).toLocaleString('en-IN')}</p>
          </motion.div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-dark-100 rounded-2xl border border-white/10 p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4">Manage: {selected.title}</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-1">Status</label>
                <select className="w-full px-3 py-2 bg-dark-200 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                  value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))}>
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="quoted">Quoted</option>
                  <option value="accepted">Accepted</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Quoted Price (Rs.)</label>
                <input type="number" className="w-full px-3 py-2 bg-dark-200 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                  value={form.quotedPrice} onChange={e => setForm(f => ({...f, quotedPrice: e.target.value}))} placeholder="e.g. 499"/>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Assign To Student ID</label>
                <input className="w-full px-3 py-2 bg-dark-200 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
                  value={form.assignedToUserId} onChange={e => setForm(f => ({...f, assignedToUserId: e.target.value}))} placeholder="Default requester userId"/>
              </div>
              <div className="border border-white/10 rounded-lg p-3">
                <p className="text-gray-300 text-sm font-semibold mb-2">Upload/Deliver Custom Material (Link)</p>
                <input className="w-full mb-2 px-3 py-2 bg-dark-200 border border-white/10 rounded-lg text-white text-sm" value={form.deliveryTitle} onChange={e => setForm(f => ({...f, deliveryTitle: e.target.value}))} placeholder="Title e.g. Merged Paper Set 1"/>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <select className="px-3 py-2 bg-dark-200 border border-white/10 rounded-lg text-white text-sm" value={form.deliveryType} onChange={e => setForm(f => ({...f, deliveryType: e.target.value}))}>
                    <option value="question_paper">Question Paper</option>
                    <option value="notes">Notes</option>
                    <option value="worksheet">Worksheet</option>
                    <option value="other">Other</option>
                  </select>
                  <input className="px-3 py-2 bg-dark-200 border border-white/10 rounded-lg text-white text-sm" value={form.deliveryUrl} onChange={e => setForm(f => ({...f, deliveryUrl: e.target.value}))} placeholder="https://drive.google.com/..."/>
                </div>
                <input className="w-full px-3 py-2 bg-dark-200 border border-white/10 rounded-lg text-white text-sm" value={form.deliveryNote} onChange={e => setForm(f => ({...f, deliveryNote: e.target.value}))} placeholder="Short note for student"/>
              </div>
              <div>
                <label className="block text-gray-300 text-sm mb-1">Note to Student</label>
                <textarea className="w-full px-3 py-2 bg-dark-200 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary" rows={3}
                  value={form.adminNote} onChange={e => setForm(f => ({...f, adminNote: e.target.value}))} placeholder="Any message for the student..."/>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setSelected(null)} className="flex-1 py-2 bg-dark-200 text-white rounded-xl text-sm hover:bg-gray-600">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold text-sm hover:opacity-90">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
