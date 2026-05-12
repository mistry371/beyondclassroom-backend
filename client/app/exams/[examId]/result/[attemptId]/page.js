'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import { Trophy, XCircle, CheckCircle, Clock, Target, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'
import Navbar from '@/components/Navbar'
import api from '@/utils/api'
import { motion } from 'framer-motion'
import MathRenderer from '@/components/MathRenderer'

export default function ExamResultPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useSelector(s => s.auth)
  const [result, setResult] = useState(null)
  const [exam, setExam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [expandedSection, setExpandedSection] = useState(0)
  const [showSolutions, setShowSolutions] = useState(false)

  useEffect(() => {
    if (!user) { router.push('/auth/login'); return }
    api.get('/exams/attempt/'+params.attemptId+'/result')
      .then(r => { setResult(r.data.attempt); setExam(r.data.exam) })
      .catch(e => { alert('Failed to load result'); router.push('/exams') })
      .finally(() => setLoading(false))
  }, [user])

  const formatTime = (s) => {
    const m = Math.floor(s/60), sec = s%60
    return m+'m '+sec+'s'
  }

  if (loading) return <div className="min-h-screen bg-dark flex items-center justify-center"><Navbar/><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>
  if (!result) return null

  return (
    <div className="min-h-screen bg-dark">
      <Navbar/>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => router.push('/exams/'+params.examId)} className="flex items-center gap-2 text-gray-400 hover:text-primary mb-6">
          <ArrowLeft className="h-5 w-5"/> Back to Exam
        </button>

        {/* Score Card */}
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          className={"bg-gradient-to-br from-dark-100/90 to-dark/90 backdrop-blur-xl rounded-2xl border p-8 text-center mb-6 " + (result.passed ? "border-green-500/30" : "border-red-500/30")}>
          <div className={"w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 " + (result.passed ? "bg-green-500/20 border-4 border-green-500" : "bg-red-500/20 border-4 border-red-500")}>
            {result.passed ? <Trophy className="h-12 w-12 text-green-400"/> : <XCircle className="h-12 w-12 text-red-400"/>}
          </div>
          <h1 className={"text-4xl font-black mb-2 " + (result.passed ? "text-green-400" : "text-red-400")}>
            {result.passed ? 'Congratulations!' : 'Better Luck Next Time'}
          </h1>
          <p className="text-gray-300 mb-6">{exam?.title}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/5 rounded-xl p-4"><p className="text-4xl font-black text-primary">{result.percentage}%</p><p className="text-gray-400 text-sm">Score</p></div>
            <div className="bg-white/5 rounded-xl p-4"><p className="text-4xl font-black text-white">{result.totalScore}/{result.totalMarks}</p><p className="text-gray-400 text-sm">Marks</p></div>
            <div className="bg-white/5 rounded-xl p-4"><p className="text-4xl font-black text-secondary">{result.rank || '-'}</p><p className="text-gray-400 text-sm">Rank</p></div>
            <div className="bg-white/5 rounded-xl p-4"><p className="text-4xl font-black text-yellow-400">{formatTime(result.timeSpent)}</p><p className="text-gray-400 text-sm">Time Taken</p></div>
          </div>

          <div className={"inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold " + (result.passed ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
            {result.passed ? <CheckCircle className="h-5 w-5"/> : <XCircle className="h-5 w-5"/>}
            {result.passed ? 'PASSED' : 'FAILED'} (Passing: {exam?.passingMarks} marks)
          </div>
        </motion.div>

        {/* Section-wise Results */}
        <div className="space-y-4 mb-6">
          {result.sectionResults.map((sec,si) => (
            <motion.div key={sec.sectionId} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:si*0.1 }}
              className="bg-dark-100/80 rounded-2xl border border-white/10 overflow-hidden">
              <div className="flex items-center justify-between p-5 cursor-pointer" onClick={() => setExpandedSection(expandedSection===si?-1:si)}>
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <h3 className="text-white font-bold">{sec.name}</h3>
                    <div className="flex gap-4 text-sm text-gray-400 mt-1">
                      <span className="text-green-400">{sec.correct} correct</span>
                      <span className="text-red-400">{sec.wrong} wrong</span>
                      <span className="text-gray-500">{sec.unattempted} skipped</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-black text-primary">{sec.percentage}%</p>
                    <p className="text-gray-400 text-xs">{sec.score}/{sec.totalMarks} marks</p>
                  </div>
                  {expandedSection===si ? <ChevronUp className="h-5 w-5 text-gray-400"/> : <ChevronDown className="h-5 w-5 text-gray-400"/>}
                </div>
              </div>

              {expandedSection===si && (
                <div className="border-t border-white/10 p-5 space-y-4">
                  {sec.questionResults.map((qr,qi) => (
                    <div key={qi} className={"rounded-xl p-4 border " + (qr.isCorrect ? "bg-green-500/10 border-green-500/30" : qr.userAnswer===undefined||qr.userAnswer===''||qr.userAnswer===null ? "bg-gray-500/10 border-gray-500/30" : "bg-red-500/10 border-red-500/30")}>
                      <div className="flex items-start gap-3 mb-3">
                        {qr.isCorrect ? <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5"/> : qr.userAnswer===undefined||qr.userAnswer===''||qr.userAnswer===null ? <Circle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5"/> : <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5"/>}
                        <div className="flex-1">
                          <p className="text-gray-400 text-xs mb-1">Q{qi+1} · {qr.awarded > 0 ? '+'+qr.awarded : qr.awarded} marks</p>
                          <div className="text-white text-sm"><MathRenderer content={qr.question}/></div>
                        </div>
                      </div>
                      {qr.type === 'mcq' && qr.options && (
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          {qr.options.map((opt,oi) => (
                            <div key={oi} className={"px-3 py-2 rounded-lg text-sm " + (oi===qr.correctAnswer ? "bg-green-500/20 text-green-400 font-medium" : oi===qr.userAnswer&&oi!==qr.correctAnswer ? "bg-red-500/20 text-red-400" : "bg-white/5 text-gray-400")}>
                              {String.fromCharCode(65+oi)}. <MathRenderer content={opt}/>
                            </div>
                          ))}
                        </div>
                      )}
                      {qr.type !== 'mcq' && (
                        <div className="flex gap-4 text-sm mb-3">
                          <span className="text-gray-400">Your answer: <span className={qr.isCorrect?"text-green-400":"text-red-400"}>{qr.userAnswer===undefined||qr.userAnswer===''||qr.userAnswer===null?'Not answered':String(qr.userAnswer)}</span></span>
                          {!qr.isCorrect && <span className="text-gray-400">Correct: <span className="text-green-400">{String(qr.correctAnswer)}</span></span>}
                        </div>
                      )}
                      {qr.explanation && (
                        <div className="mt-2 pt-2 border-t border-white/10">
                          <p className="text-gray-400 text-xs mb-1">Explanation:</p>
                          <div className="text-gray-300 text-sm"><MathRenderer content={qr.explanation}/></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="flex gap-4 justify-center">
          <button onClick={() => router.push('/exams')} className="px-8 py-3 bg-dark-200 text-white rounded-xl hover:bg-gray-600">All Exams</button>
          <button onClick={() => router.push('/exams/'+params.examId)} className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold hover:opacity-90">Try Again</button>
        </div>
      </div>
    </div>
  )
}
