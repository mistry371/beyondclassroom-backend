'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import { Clock, Target, Award, ClipboardList, AlertTriangle, ArrowRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import api from '@/utils/api'
import { motion } from 'framer-motion'

export default function ExamInfoPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useSelector(s => s.auth)
  const [exam, setExam] = useState(null)
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push('/auth/login?redirect=/exams/'+params.examId); return }
    Promise.all([
      api.get('/exams').then(r => r.data.exams.find(e => e._id === params.examId)),
      api.get('/exams/'+params.examId+'/my-attempts').then(r => r.data.attempts).catch(() => [])
    ]).then(([e, a]) => { setExam(e); setAttempts(a || []) }).catch(console.error).finally(() => setLoading(false))
  }, [user])

  if (loading) return <div className="min-h-screen bg-dark flex items-center justify-center"><Navbar/><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>
  if (!exam) return <div className="min-h-screen bg-dark"><Navbar/><div className="flex items-center justify-center h-screen"><p className="text-white">Exam not found</p></div></div>

  const canAttempt = attempts.length < exam.maxAttempts

  return (
    <div className="min-h-screen bg-dark">
      <Navbar/>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          className="bg-gradient-to-br from-dark-100/90 to-dark/90 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="h-10 w-10 text-white"/>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">{exam.title}</h1>
            <p className="text-gray-300">{exam.description}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 rounded-xl p-4 text-center"><Clock className="h-6 w-6 text-primary mx-auto mb-2"/><p className="text-2xl font-bold text-white">{exam.duration}</p><p className="text-gray-400 text-xs">Minutes</p></div>
            <div className="bg-white/5 rounded-xl p-4 text-center"><Target className="h-6 w-6 text-secondary mx-auto mb-2"/><p className="text-2xl font-bold text-white">{exam.totalMarks}</p><p className="text-gray-400 text-xs">Total Marks</p></div>
            <div className="bg-white/5 rounded-xl p-4 text-center"><Award className="h-6 w-6 text-green-400 mx-auto mb-2"/><p className="text-2xl font-bold text-white">{exam.passingMarks}</p><p className="text-gray-400 text-xs">Passing Marks</p></div>
            <div className="bg-white/5 rounded-xl p-4 text-center"><ClipboardList className="h-6 w-6 text-yellow-400 mx-auto mb-2"/><p className="text-2xl font-bold text-white">{exam.sections.reduce((s,sec)=>s+sec.questionCount,0)}</p><p className="text-gray-400 text-xs">Questions</p></div>
          </div>

          <div className="mb-6">
            <h3 className="text-white font-bold mb-3">Sections</h3>
            <div className="space-y-2">
              {exam.sections.map(s => (
                <div key={s._id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <span className="text-white font-medium">{s.name}</span>
                  <div className="flex gap-4 text-sm text-gray-400">
                    <span>{s.questionCount} questions</span>
                    <span>{s.marksPerQuestion} marks each</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {exam.instructions && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-5 mb-6">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-400"/>Instructions</h3>
              <div className="text-gray-300 text-sm whitespace-pre-line">{exam.instructions}</div>
            </div>
          )}

          {exam.negativeMarking && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
              <p className="text-red-400 text-sm font-medium">Negative Marking: -{exam.negativeMarkValue} marks for each wrong answer</p>
            </div>
          )}

          {attempts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white font-bold mb-3">Previous Attempts</h3>
              <div className="space-y-2">
                {attempts.map((a,i) => (
                  <div key={a._id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <span className="text-gray-300 text-sm">Attempt {i+1} · {new Date(a.submittedAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-3">
                      <span className={"font-bold " + (a.passed ? "text-green-400" : "text-red-400")}>{a.percentage}%</span>
                      <button onClick={() => router.push('/exams/'+params.examId+'/result/'+a._id)} className="text-xs text-primary hover:underline">View Result</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center">
            {canAttempt ? (
              <button onClick={() => router.push('/exams/'+params.examId+'/attempt')}
                className="px-12 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold text-lg hover:opacity-90 transition-all flex items-center gap-2 mx-auto">
                Start Exam <ArrowRight className="h-5 w-5"/>
              </button>
            ) : (
              <p className="text-gray-400">You have used all {exam.maxAttempts} attempt(s) for this exam.</p>
            )}
            <p className="text-gray-500 text-sm mt-3">Attempt {attempts.length + (canAttempt?1:0)} of {exam.maxAttempts}</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
