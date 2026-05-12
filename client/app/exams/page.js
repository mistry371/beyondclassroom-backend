'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { ClipboardList, Clock, Target, Award, ArrowRight, Lock } from 'lucide-react'
import Navbar from '@/components/Navbar'
import api from '@/utils/api'
import { motion } from 'framer-motion'

export default function ExamsPage() {
  const router = useRouter()
  const { user } = useSelector(s => s.auth)
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push('/auth/login?redirect=/exams'); return }
    api.get('/exams').then(r => setExams(r.data.exams || [])).catch(console.error).finally(() => setLoading(false))
  }, [user])

  if (loading) return <div className="min-h-screen bg-dark flex items-center justify-center"><Navbar/><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>

  return (
    <div className="min-h-screen bg-dark">
      <Navbar/>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="mb-10">
          <h1 className="text-4xl font-black text-white mb-2">Examinations</h1>
          <p className="text-gray-400">Test your knowledge with timed, scored examinations</p>
        </motion.div>
        {exams.length === 0 ? (
          <div className="text-center py-20 bg-dark-100/50 rounded-2xl border border-white/10">
            <ClipboardList className="h-16 w-16 text-gray-600 mx-auto mb-4"/>
            <p className="text-gray-400 text-xl">No exams available yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {exams.map((exam,i) => (
              <motion.div key={exam._id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05 }}
                className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{exam.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{exam.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4"/>{exam.duration} min</span>
                      <span className="flex items-center gap-1"><Target className="h-4 w-4"/>{exam.totalMarks} marks</span>
                      <span className="flex items-center gap-1"><Award className="h-4 w-4"/>Pass: {exam.passingMarks}</span>
                      <span className="flex items-center gap-1"><ClipboardList className="h-4 w-4"/>{exam.sections.length} sections</span>
                      {exam.negativeMarking && <span className="text-red-400 text-xs">Negative marking: -{exam.negativeMarkValue}/wrong</span>}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {exam.sections.map(s => (
                        <span key={s._id} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">{s.name} ({s.questionCount}Q)</span>
                      ))}
                    </div>
                    {exam.bestScore !== null && (
                      <p className="text-green-400 text-sm mt-3">Best score: {exam.bestScore}% · Attempts: {exam.attemptCount}/{exam.maxAttempts}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {!exam.canAttempt ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-500/20 text-gray-400 rounded-xl text-sm">
                        <Lock className="h-4 w-4"/> Max attempts reached
                      </div>
                    ) : exam.inProgressAttemptId ? (
                      <button onClick={() => router.push('/exams/'+exam._id+'/attempt')}
                        className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2">
                        Resume <ArrowRight className="h-4 w-4"/>
                      </button>
                    ) : (
                      <button onClick={() => router.push('/exams/'+exam._id)}
                        className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2">
                        Start Exam <ArrowRight className="h-4 w-4"/>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
