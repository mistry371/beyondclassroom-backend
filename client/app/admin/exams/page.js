'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { ClipboardList, Plus, Edit, Trash2, ArrowLeft, Clock, Target, BarChart3, Eye, EyeOff, Users } from 'lucide-react'
import api from '@/utils/api'
import { motion } from 'framer-motion'
import { showSuccess, showError } from '@/components/ui/Toast'

export default function AdminExams() {
  const router = useRouter()
  const { user } = useSelector(state => state.auth)
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExams()
  }, [user])

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams/admin/all')
      setExams(res.data.exams || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this exam?')) return
    try { await api.delete('/exams/admin/' + id); fetchExams() } catch (e) { showError('Delete failed') }
  }

  const handleToggle = async (exam) => {
    try { await api.put('/exams/admin/' + exam._id, { ...exam, isPublished: !exam.isPublished }); fetchExams() }
    catch (e) { showError('Update failed') }
  }

  if (loading) return <div className="min-h-screen bg-dark flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>

  return (
    <div className="min-h-screen bg-dark">
      <div className="bg-dark-100 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/admin')} className="p-2 hover:bg-dark-200 rounded-lg"><ArrowLeft className="h-5 w-5 text-gray-400" /></button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Examination Management</h1>
              <p className="text-gray-400 mt-1">{exams.length} exams total</p>
            </div>
          </div>
          <button onClick={() => router.push('/admin/exams/create')} className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create Exam
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        {exams.length === 0 ? (
          <div className="text-center py-20 bg-dark-100/50 rounded-2xl border border-white/10">
            <ClipboardList className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl">No exams yet</p>
            <p className="text-gray-500 mt-2">Create your first examination to get started</p>
          </div>
        ) : exams.map((exam, i) => (
          <motion.div key={exam._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-bold text-white">{exam.title}</h3>
                  <span className={"px-2 py-0.5 rounded-full text-xs font-medium " + (exam.isPublished ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400")}>
                    {exam.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{exam.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{exam.duration} min</span>
              <span className="flex items-center gap-1"><Target className="h-4 w-4" />{exam.totalMarks} marks</span>
              <span className="flex items-center gap-1"><ClipboardList className="h-4 w-4" />{(exam.sections||[]).length} sections</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" />{exam.attemptCount||0} attempts</span>
              {exam.negativeMarking && <span className="text-red-400">-ve: {exam.negativeMarkValue}/wrong</span>}
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => router.push('/admin/exams/'+exam._id+'/edit')} className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 text-sm flex items-center gap-2"><Edit className="h-4 w-4" /> Edit</button>
              <button onClick={() => router.push('/admin/exams/'+exam._id+'/analytics')} className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Analytics</button>
              <button onClick={() => handleToggle(exam)} className="px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 text-sm flex items-center gap-2">
                {exam.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{exam.isPublished ? 'Unpublish' : 'Publish'}
              </button>
              <button onClick={() => handleDelete(exam._id)} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 text-sm flex items-center gap-2"><Trash2 className="h-4 w-4" /> Delete</button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
