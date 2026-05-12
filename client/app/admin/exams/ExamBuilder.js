'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSelector } from 'react-redux'
import { ArrowLeft, Plus, Trash2, Save, ChevronDown, ChevronUp } from 'lucide-react'
import api from '@/utils/api'
import { motion } from 'framer-motion'

const INP = "w-full px-3 py-2 bg-dark-200 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
const LBL = "block text-gray-300 text-xs font-medium mb-1"
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7)

function ExamBuilder({ isEdit }) {
  const router = useRouter()
  const params = useParams()
  const { user } = useSelector(s => s.auth)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [expandedSection, setExpandedSection] = useState(0)
  const [form, setForm] = useState({
    title: '', description: '', instructions: '', duration: 180,
    passingMarks: 35, negativeMarking: true, negativeMarkValue: 0.25,
    shuffleQuestions: false, shuffleOptions: false,
    showResultImmediately: true, allowReview: true, maxAttempts: 1,
    isPublished: false, sections: []
  })

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) { router.push('/'); return }
    if (isEdit && params?.examId) loadExam()
  }, [user])

  const loadExam = async () => {
    try {
      const res = await api.get('/exams/admin/all')
      const exam = res.data.exams.find(e => e._id === params.examId)
      if (exam) setForm(exam)
      else alert('Exam not found')
    } catch (e) { alert('Failed to load exam') } finally { setLoading(false) }
  }

  const addSection = () => {
    const s = { _id: genId(), name: '', description: '', marksPerQuestion: 4, negativeMarks: 1, questions: [] }
    setForm(f => ({ ...f, sections: [...f.sections, s] }))
    setExpandedSection(form.sections.length)
  }
  const removeSection = si => setForm(f => ({ ...f, sections: f.sections.filter((_,i) => i !== si) }))
  const updateSection = (si,k,v) => setForm(f => { const s=[...f.sections]; s[si]={...s[si],[k]:v}; return {...f,sections:s} })
  const addQuestion = si => {
    const q = { _id: genId(), question: '', type: 'mcq', options: ['','','',''], correctAnswer: '', marks: form.sections[si].marksPerQuestion, negativeMarks: form.sections[si].negativeMarks, explanation: '' }
    setForm(f => { const s=[...f.sections]; s[si]={...s[si],questions:[...s[si].questions,q]}; return {...f,sections:s} })
  }
  const removeQuestion = (si,qi) => setForm(f => { const s=[...f.sections]; s[si]={...s[si],questions:s[si].questions.filter((_,i)=>i!==qi)}; return {...f,sections:s} })
  const updateQuestion = (si,qi,k,v) => setForm(f => { const s=[...f.sections]; const q=[...s[si].questions]; q[qi]={...q[qi],[k]:v}; s[si]={...s[si],questions:q}; return {...f,sections:s} })
  const updateOption = (si,qi,oi,v) => setForm(f => { const s=[...f.sections]; const q=[...s[si].questions]; const o=[...(q[qi].options||['','','',''])]; o[oi]=v; q[qi]={...q[qi],options:o}; s[si]={...s[si],questions:q}; return {...f,sections:s} })

  const totalQ = form.sections.reduce((s,sec)=>s+sec.questions.length,0)
  const totalMarks = form.sections.reduce((s,sec)=>s+sec.questions.reduce((ss,q)=>ss+(q.marks||sec.marksPerQuestion||4),0),0)

  const handleSave = async (publish) => {
    if (!form.title) { alert('Enter exam title'); return }
    if (form.sections.length === 0) { alert('Add at least one section'); return }
    setSaving(true)
    try {
      const payload = { ...form, isPublished: publish }
      if (isEdit) await api.put('/exams/admin/' + params.examId, payload)
      else await api.post('/exams/admin', payload)
      router.push('/admin/exams')
    } catch (e) { alert(e.response?.data?.message || 'Save failed') } finally { setSaving(false) }
  }

  if (loading) return <div className="min-h-screen bg-dark flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>

  return (
    <div className="min-h-screen bg-dark">
      <div className="bg-dark-100 border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin/exams')} className="p-2 hover:bg-dark-200 rounded-lg"><ArrowLeft className="h-5 w-5 text-gray-400" /></button>
            <div>
              <h1 className="text-xl font-bold text-white">{isEdit ? 'Edit Exam' : 'Create Exam'}</h1>
              <p className="text-gray-400 text-xs">{totalQ} questions · {totalMarks} marks</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleSave(false)} className="px-4 py-2 bg-dark-200 text-white rounded-lg hover:bg-gray-600 text-sm">Save Draft</button>
            <button onClick={() => handleSave(true)} disabled={saving} className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 text-sm flex items-center gap-2 disabled:opacity-50">
              <Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save & Publish'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-dark-100/80 rounded-2xl border border-white/10 p-6">
          <h2 className="text-lg font-bold text-white mb-4">Exam Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className={LBL}>Exam Title *</label><input className={INP} value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="e.g. JEE Mains Mock Test 1" /></div>
            <div className="md:col-span-2"><label className={LBL}>Description</label><textarea className={INP} rows={2} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Brief description" /></div>
            <div className="md:col-span-2"><label className={LBL}>Instructions (shown before exam starts)</label><textarea className={INP} rows={4} value={form.instructions} onChange={e=>setForm(f=>({...f,instructions:e.target.value}))} placeholder="1. Read all questions carefully&#10;2. Each correct answer carries marks as specified&#10;3. Wrong answers carry negative marks&#10;4. Submit before time runs out" /></div>
            <div><label className={LBL}>Duration (minutes) *</label><input type="number" className={INP} value={form.duration} onChange={e=>setForm(f=>({...f,duration:+e.target.value}))} /></div>
            <div><label className={LBL}>Passing Marks *</label><input type="number" className={INP} value={form.passingMarks} onChange={e=>setForm(f=>({...f,passingMarks:+e.target.value}))} /></div>
            <div><label className={LBL}>Max Attempts</label><input type="number" className={INP} value={form.maxAttempts} min={1} onChange={e=>setForm(f=>({...f,maxAttempts:+e.target.value}))} /></div>
            <div><label className={LBL}>Negative Mark Value (per wrong answer)</label><input type="number" step="0.25" className={INP} value={form.negativeMarkValue} onChange={e=>setForm(f=>({...f,negativeMarkValue:+e.target.value}))} /></div>
          </div>
          <div className="flex flex-wrap gap-6 mt-4">
            {[['negativeMarking','Negative Marking'],['shuffleQuestions','Shuffle Questions'],['shuffleOptions','Shuffle Options'],['showResultImmediately','Show Result Immediately'],['allowReview','Allow Review']].map(([k,l])=>(
              <label key={k} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.checked}))} className="w-4 h-4 accent-primary" />
                <span className="text-gray-300 text-sm">{l}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {form.sections.map((section,si)=>(
            <div key={section._id||si} className="bg-dark-100/80 rounded-2xl border border-white/10 overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-dark-200/40 cursor-pointer" onClick={()=>setExpandedSection(expandedSection===si?-1:si)}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">{si+1}</div>
                  <div>
                    <p className="text-white font-semibold">{section.name||'Section '+(si+1)}</p>
                    <p className="text-gray-400 text-xs">{section.questions.length} questions · {section.questions.reduce((s,q)=>s+(q.marks||section.marksPerQuestion||4),0)} marks</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={e=>{e.stopPropagation();removeSection(si)}} className="p-1.5 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400"><Trash2 className="h-4 w-4"/></button>
                  {expandedSection===si?<ChevronUp className="h-5 w-5 text-gray-400"/>:<ChevronDown className="h-5 w-5 text-gray-400"/>}
                </div>
              </div>
              {expandedSection===si&&(
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="col-span-2"><label className={LBL}>Section Name *</label><input className={INP} value={section.name} onChange={e=>updateSection(si,'name',e.target.value)} placeholder="e.g. Mathematics" /></div>
                    <div><label className={LBL}>Marks/Question</label><input type="number" className={INP} value={section.marksPerQuestion} onChange={e=>updateSection(si,'marksPerQuestion',+e.target.value)} /></div>
                    <div><label className={LBL}>Negative Marks</label><input type="number" step="0.25" className={INP} value={section.negativeMarks} onChange={e=>updateSection(si,'negativeMarks',+e.target.value)} /></div>
                    <div className="col-span-2 md:col-span-4"><label className={LBL}>Section Description</label><input className={INP} value={section.description||''} onChange={e=>updateSection(si,'description',e.target.value)} placeholder="Optional" /></div>
                  </div>
                  <div className="space-y-3">
                    {section.questions.map((q,qi)=>(
                      <div key={q._id||qi} className="bg-dark-200/50 rounded-xl p-4 border border-white/5">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-primary text-sm font-bold">Q{qi+1}</span>
                          <button onClick={()=>removeQuestion(si,qi)} className="text-gray-500 hover:text-red-400"><Trash2 className="h-4 w-4"/></button>
                        </div>
                        <div className="space-y-2">
                          <textarea className={INP} rows={2} value={q.question} onChange={e=>updateQuestion(si,qi,'question',e.target.value)} placeholder="Question text (supports LaTeX: $x^2 + y^2 = r^2$)" />
                          <div className="grid grid-cols-2 gap-2">
                            <div><label className={LBL}>Type</label>
                              <select className={INP} value={q.type} onChange={e=>updateQuestion(si,qi,'type',e.target.value)}>
                                <option value="mcq">MCQ (Single Correct)</option>
                                <option value="numeric">Numeric Answer</option>
                                <option value="true_false">True / False</option>
                              </select>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              <div><label className={LBL}>Marks</label><input type="number" className={INP} value={q.marks} onChange={e=>updateQuestion(si,qi,'marks',+e.target.value)} /></div>
                              <div><label className={LBL}>-ve Marks</label><input type="number" step="0.25" className={INP} value={q.negativeMarks} onChange={e=>updateQuestion(si,qi,'negativeMarks',+e.target.value)} /></div>
                            </div>
                          </div>
                          {q.type==='mcq'&&(
                            <div>
                              <label className={LBL}>Options (select radio = correct answer)</label>
                              <div className="grid grid-cols-2 gap-2">
                                {(q.options||['','','','']).map((opt,oi)=>(
                                  <div key={oi} className="flex items-center gap-2">
                                    <input type="radio" name={'correct_'+si+'_'+qi} checked={q.correctAnswer===oi} onChange={()=>updateQuestion(si,qi,'correctAnswer',oi)} className="accent-green-400 flex-shrink-0" />
                                    <input className={INP} value={opt} onChange={e=>updateOption(si,qi,oi,e.target.value)} placeholder={'Option '+(oi+1)} />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {q.type==='true_false'&&(
                            <div className="flex gap-4">
                              {['True','False'].map(v=>(
                                <label key={v} className="flex items-center gap-2 cursor-pointer">
                                  <input type="radio" checked={q.correctAnswer===v} onChange={()=>updateQuestion(si,qi,'correctAnswer',v)} className="accent-green-400" />
                                  <span className="text-gray-300 text-sm">{v}</span>
                                </label>
                              ))}
                            </div>
                          )}
                          {q.type==='numeric'&&<div><label className={LBL}>Correct Answer</label><input className={INP} value={q.correctAnswer} onChange={e=>updateQuestion(si,qi,'correctAnswer',e.target.value)} placeholder="e.g. 42 or 3.14" /></div>}
                          <div><label className={LBL}>Explanation (shown after submission)</label><textarea className={INP} rows={2} value={q.explanation||''} onChange={e=>updateQuestion(si,qi,'explanation',e.target.value)} placeholder="Step-by-step solution..." /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>addQuestion(si)} className="w-full py-2 border border-dashed border-primary/40 text-primary rounded-xl hover:bg-primary/10 text-sm flex items-center justify-center gap-2">
                    <Plus className="h-4 w-4" /> Add Question to {section.name||'Section '+(si+1)}
                  </button>
                </div>
              )}
            </div>
          ))}
          <button onClick={addSection} className="w-full py-3 border border-dashed border-white/20 text-gray-400 rounded-2xl hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-2">
            <Plus className="h-5 w-5" /> Add Section
          </button>
        </div>

        {form.sections.length>0&&(
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-5">
            <h3 className="text-white font-bold mb-3">Exam Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div><p className="text-3xl font-black text-primary">{totalQ}</p><p className="text-gray-400 text-xs">Questions</p></div>
              <div><p className="text-3xl font-black text-secondary">{totalMarks}</p><p className="text-gray-400 text-xs">Total Marks</p></div>
              <div><p className="text-3xl font-black text-white">{form.duration}</p><p className="text-gray-400 text-xs">Minutes</p></div>
              <div><p className="text-3xl font-black text-green-400">{form.passingMarks}</p><p className="text-gray-400 text-xs">Passing Marks</p></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExamBuilder
