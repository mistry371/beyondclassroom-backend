'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import { Clock, ChevronLeft, ChevronRight, Flag, Send, AlertTriangle, CheckCircle, Circle, Bookmark } from 'lucide-react'
import api from '@/utils/api'
import { motion, AnimatePresence } from 'framer-motion'
import MathRenderer from '@/components/MathRenderer'

const STATUS = { NOT_VISITED: 'not_visited', VISITED: 'visited', ANSWERED: 'answered', MARKED: 'marked', ANSWERED_MARKED: 'answered_marked' }

export default function ExamAttemptPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useSelector(s => s.auth)

  const [exam, setExam] = useState(null)
  const [attemptId, setAttemptId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)

  const [currentSection, setCurrentSection] = useState(0)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState({})
  const [qStatus, setQStatus] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [startTime] = useState(Date.now())
  const timerRef = useRef(null)
  const saveRef = useRef(null)

  useEffect(() => {
    if (!user) { router.push('/auth/login?redirect=/exams/'+params.examId+'/attempt'); return }
    startExam()
  }, [user])

  const startExam = async () => {
    try {
      const res = await api.post('/exams/'+params.examId+'/start')
      setExam(res.data.exam)
      setAttemptId(res.data.attemptId)
      const secs = res.data.exam.duration * 60
      const elapsed = Math.floor((Date.now() - new Date(res.data.startedAt).getTime()) / 1000)
      setTimeLeft(Math.max(0, secs - elapsed))
      // Init status
      const st = {}
      res.data.exam.sections.forEach(sec => {
        sec.questions.forEach(q => { st[sec._id+'_'+q._id] = STATUS.NOT_VISITED })
      })
      setQStatus(st)
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to start exam')
      router.push('/exams/'+params.examId)
    } finally { setLoading(false) }
  }

  // Timer
  useEffect(() => {
    if (!exam || timeLeft <= 0) return
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleSubmit('auto'); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [exam])

  // Auto-save every 10s
  useEffect(() => {
    if (!attemptId) return
    saveRef.current = setInterval(() => { /* answers saved on each selection */ }, 10000)
    return () => clearInterval(saveRef.current)
  }, [attemptId])

  const saveAnswer = async (key, answer) => {
    if (!attemptId) return
    try { await api.put('/exams/attempt/'+attemptId+'/answer', { questionKey: key, answer }) } catch {}
  }

  const handleAnswer = (answer) => {
    if (!exam) return
    const sec = exam.sections[currentSection]
    const q = sec.questions[currentQ]
    const key = sec._id+'_'+q._id
    const newAnswers = { ...answers, [key]: answer }
    setAnswers(newAnswers)
    const marked = qStatus[key] === STATUS.MARKED || qStatus[key] === STATUS.ANSWERED_MARKED
    setQStatus(prev => ({ ...prev, [key]: marked ? STATUS.ANSWERED_MARKED : STATUS.ANSWERED }))
    saveAnswer(key, answer)
  }

  const handleMarkForReview = () => {
    if (!exam) return
    const sec = exam.sections[currentSection]
    const q = sec.questions[currentQ]
    const key = sec._id+'_'+q._id
    const answered = answers[key] !== undefined && answers[key] !== ''
    setQStatus(prev => {
      const cur = prev[key]
      let next
      if (cur === STATUS.MARKED || cur === STATUS.ANSWERED_MARKED) next = answered ? STATUS.ANSWERED : STATUS.VISITED
      else next = answered ? STATUS.ANSWERED_MARKED : STATUS.MARKED
      return { ...prev, [key]: next }
    })
  }

  const handleClearAnswer = () => {
    if (!exam) return
    const sec = exam.sections[currentSection]
    const q = sec.questions[currentQ]
    const key = sec._id+'_'+q._id
    const newAnswers = { ...answers }
    delete newAnswers[key]
    setAnswers(newAnswers)
    setQStatus(prev => ({ ...prev, [key]: STATUS.VISITED }))
    saveAnswer(key, '')
  }

  const navigateTo = (si, qi) => {
    const sec = exam.sections[si]
    const q = sec.questions[qi]
    const key = sec._id+'_'+q._id
    setCurrentSection(si)
    setCurrentQ(qi)
    setQStatus(prev => {
      if (prev[key] === STATUS.NOT_VISITED) return { ...prev, [key]: STATUS.VISITED }
      return prev
    })
  }

  const handleSubmit = useCallback(async (by = 'user') => {
    if (!attemptId) return
    setSubmitting(true)
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000)
      const res = await api.post('/exams/attempt/'+attemptId+'/submit', { timeSpent, submittedBy: by })
      router.push('/exams/'+params.examId+'/result/'+attemptId)
    } catch (e) { alert('Submit failed: ' + (e.response?.data?.message || e.message)) }
    finally { setSubmitting(false) }
  }, [attemptId, startTime, params.examId, router])

  const formatTime = (s) => {
    const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60
    if (h > 0) return h+'h '+m+'m '+sec+'s'
    return m+':'+(sec<10?'0':'')+sec
  }

  const getStatusColor = (key) => {
    switch(qStatus[key]) {
      case STATUS.ANSWERED: return 'bg-green-500 text-white'
      case STATUS.MARKED: return 'bg-purple-500 text-white'
      case STATUS.ANSWERED_MARKED: return 'bg-purple-500 text-white border-2 border-green-400'
      case STATUS.VISITED: return 'bg-red-500/80 text-white'
      default: return 'bg-dark-200 text-gray-400'
    }
  }

  if (loading) return <div className="min-h-screen bg-dark flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>
  if (!exam) return null

  const sec = exam.sections[currentSection]
  const q = sec.questions[currentQ]
  const key = sec._id+'_'+q._id
  const totalQ = exam.sections.reduce((s,sec)=>s+sec.questions.length,0)
  const answeredCount = Object.values(answers).filter(v=>v!==undefined&&v!=='').length
  const markedCount = Object.values(qStatus).filter(v=>v===STATUS.MARKED||v===STATUS.ANSWERED_MARKED).length

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      {/* Top Bar */}
      <div className="bg-dark-100 border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <h2 className="text-white font-bold text-sm md:text-base truncate max-w-xs">{exam.title}</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className={"flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg " + (timeLeft < 300 ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-primary/20 text-primary")}>
            <Clock className="h-5 w-5"/>
            {formatTime(timeLeft)}
          </div>
          <button onClick={() => setShowSubmitConfirm(true)} className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90">
            <Send className="h-4 w-4"/> Submit
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Question Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Section Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {exam.sections.map((s,si) => (
              <button key={s._id} onClick={() => navigateTo(si,0)}
                className={"px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all " + (si===currentSection ? "bg-primary text-white" : "bg-dark-200 text-gray-400 hover:bg-dark-100")}>
                {s.name}
              </button>
            ))}
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div key={key} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}
              className="bg-dark-100/80 rounded-2xl border border-white/10 p-6 mb-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-primary text-sm font-bold">Q{currentQ+1} of {sec.questions.length}</span>
                  <span className="ml-3 text-gray-400 text-xs">{q.marks} marks {exam.negativeMarking ? '| -'+q.negativeMarks+' wrong' : ''}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleMarkForReview} className={"px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 " + (qStatus[key]===STATUS.MARKED||qStatus[key]===STATUS.ANSWERED_MARKED ? "bg-purple-500/20 text-purple-400" : "bg-dark-200 text-gray-400 hover:bg-dark-100")}>
                    <Bookmark className="h-3 w-3"/> {qStatus[key]===STATUS.MARKED||qStatus[key]===STATUS.ANSWERED_MARKED ? 'Marked' : 'Mark for Review'}
                  </button>
                  {answers[key] !== undefined && answers[key] !== '' && (
                    <button onClick={handleClearAnswer} className="px-3 py-1 rounded-lg text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30">Clear</button>
                  )}
                </div>
              </div>

              <div className="text-white text-base mb-6 leading-relaxed">
                <MathRenderer content={q.question}/>
              </div>

              {/* Options */}
              {q.type === 'mcq' && (
                <div className="space-y-3">
                  {q.options.map((opt,oi) => (
                    <button key={oi} onClick={() => handleAnswer(oi)}
                      className={"w-full text-left p-4 rounded-xl border-2 transition-all " + (answers[key]===oi ? "bg-primary/20 border-primary text-white" : "bg-white/5 border-white/10 text-gray-300 hover:border-primary/50")}>
                      <div className="flex items-center gap-3">
                        <div className={"w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 " + (answers[key]===oi ? "border-primary bg-primary" : "border-gray-500")}>
                          {answers[key]===oi && <div className="w-3 h-3 bg-white rounded-full"/>}
                        </div>
                        <span className="font-medium mr-2 text-gray-400">{String.fromCharCode(65+oi)}.</span>
                        <MathRenderer content={opt}/>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {q.type === 'true_false' && (
                <div className="flex gap-4">
                  {['True','False'].map(v => (
                    <button key={v} onClick={() => handleAnswer(v)}
                      className={"flex-1 py-4 rounded-xl border-2 font-bold transition-all " + (answers[key]===v ? "bg-primary/20 border-primary text-white" : "bg-white/5 border-white/10 text-gray-300 hover:border-primary/50")}>
                      {v}
                    </button>
                  ))}
                </div>
              )}

              {q.type === 'numeric' && (
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Enter your answer:</label>
                  <input type="number" step="any" value={answers[key]||''} onChange={e=>handleAnswer(e.target.value)}
                    className="w-full md:w-64 px-4 py-3 bg-dark-200 border border-white/10 rounded-xl text-white text-lg font-bold focus:outline-none focus:border-primary"
                    placeholder="Type numeric answer"/>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button onClick={() => {
              if (currentQ > 0) navigateTo(currentSection, currentQ-1)
              else if (currentSection > 0) navigateTo(currentSection-1, exam.sections[currentSection-1].questions.length-1)
            }} disabled={currentSection===0&&currentQ===0}
              className="px-5 py-2 bg-dark-200 text-white rounded-xl hover:bg-dark-100 disabled:opacity-40 flex items-center gap-2">
              <ChevronLeft className="h-4 w-4"/> Previous
            </button>
            <span className="text-gray-400 text-sm">{answeredCount}/{totalQ} answered</span>
            <button onClick={() => {
              if (currentQ < sec.questions.length-1) navigateTo(currentSection, currentQ+1)
              else if (currentSection < exam.sections.length-1) navigateTo(currentSection+1, 0)
            }} disabled={currentSection===exam.sections.length-1&&currentQ===sec.questions.length-1}
              className="px-5 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:opacity-90 disabled:opacity-40 flex items-center gap-2">
              Next <ChevronRight className="h-4 w-4"/>
            </button>
          </div>
        </div>

        {/* Question Palette Sidebar */}
        <div className="w-64 bg-dark-100 border-l border-white/10 overflow-y-auto p-4 hidden md:block">
          <h3 className="text-white font-bold mb-3 text-sm">Question Palette</h3>
          <div className="flex flex-wrap gap-1 mb-4 text-xs">
            {[['bg-green-500','Answered'],['bg-red-500/80','Visited'],['bg-purple-500','Marked'],['bg-dark-200','Not Visited']].map(([c,l])=>(
              <div key={l} className="flex items-center gap-1"><div className={"w-3 h-3 rounded "+c}></div><span className="text-gray-400">{l}</span></div>
            ))}
          </div>
          {exam.sections.map((s,si) => (
            <div key={s._id} className="mb-4">
              <p className="text-gray-400 text-xs font-medium mb-2">{s.name}</p>
              <div className="flex flex-wrap gap-1">
                {s.questions.map((q,qi) => {
                  const k = s._id+'_'+q._id
                  return (
                    <button key={k} onClick={() => navigateTo(si,qi)}
                      className={"w-8 h-8 rounded text-xs font-bold transition-all " + getStatusColor(k) + (si===currentSection&&qi===currentQ?" ring-2 ring-white":"")}>
                      {qi+1}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          <div className="mt-4 p-3 bg-dark-200/50 rounded-xl text-xs text-gray-400 space-y-1">
            <p>Answered: <span className="text-green-400 font-bold">{answeredCount}</span></p>
            <p>Marked: <span className="text-purple-400 font-bold">{markedCount}</span></p>
            <p>Unanswered: <span className="text-red-400 font-bold">{totalQ-answeredCount}</span></p>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <AnimatePresence>
        {showSubmitConfirm && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale:0.9 }} animate={{ scale:1 }} exit={{ scale:0.9 }}
              className="bg-dark-100 rounded-2xl border border-white/10 p-8 max-w-md w-full text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4"/>
              <h3 className="text-2xl font-bold text-white mb-2">Submit Exam?</h3>
              <p className="text-gray-400 mb-6">You have answered {answeredCount} of {totalQ} questions. This action cannot be undone.</p>
              <div className="grid grid-cols-3 gap-3 text-sm mb-6">
                <div className="bg-green-500/10 rounded-xl p-3"><p className="text-green-400 font-bold text-xl">{answeredCount}</p><p className="text-gray-400">Answered</p></div>
                <div className="bg-purple-500/10 rounded-xl p-3"><p className="text-purple-400 font-bold text-xl">{markedCount}</p><p className="text-gray-400">Marked</p></div>
                <div className="bg-red-500/10 rounded-xl p-3"><p className="text-red-400 font-bold text-xl">{totalQ-answeredCount}</p><p className="text-gray-400">Skipped</p></div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowSubmitConfirm(false)} className="flex-1 py-3 bg-dark-200 text-white rounded-xl hover:bg-gray-600">Cancel</button>
                <button onClick={() => { setShowSubmitConfirm(false); handleSubmit('user') }} disabled={submitting}
                  className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Confirm Submit'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
