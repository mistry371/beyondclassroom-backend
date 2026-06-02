'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { ArrowRight, Award, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Clock, FileText, Lock, PlayCircle, ShieldCheck, ShoppingCart, Sparkles, Star, Target, X } from 'lucide-react'
import Navbar from '@/components/Navbar'
import PaymentModal from '@/components/PaymentModal'
import api from '@/utils/api'
import { motion } from 'framer-motion'
import { showSuccess, showError } from '@/components/ui/Toast'

const steps = ['Modules', 'Lessons', 'Topics', 'PDFs', 'Preferences', 'Summary']

const defaultPreferences = {
  level: 'Standard',
  learningSpeed: 'Balanced',
  worksheetFrequency: 'Weekly',
  testFrequency: 'Bi-weekly',
  languagePreference: 'English',
  revisionMode: 'Smart revision',
}

function getDocs(subtopic) {
  return subtopic?.documents || (subtopic?.document ? [subtopic.document] : [])
}

export default function CourseDetails() {
  const params = useParams()
  const router = useRouter()
  const { user } = useSelector((state) => state.auth)
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [modules, setModules] = useState([])
  const [selected, setSelected] = useState({})
  const [preferences, setPreferences] = useState(defaultPreferences)
  const [notes, setNotes] = useState('')
  const [step, setStep] = useState(0)
  const [requestLoading, setRequestLoading] = useState(false)
  const [previewDoc, setPreviewDoc] = useState(null)

  useEffect(() => {
    fetchCourse()
  }, [params.id, user?._id])

  useEffect(() => {
    if (!previewDoc) return
    const block = (e) => {
      if (e.type === 'contextmenu') e.preventDefault()
      const key = e.key?.toLowerCase()
      const ctrl = e.ctrlKey || e.metaKey
      if (ctrl && ['s', 'p', 'u', 'c', 'v', 'a'].includes(key)) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    document.addEventListener('contextmenu', block, true)
    document.addEventListener('keydown', block, true)
    return () => {
      document.removeEventListener('contextmenu', block, true)
      document.removeEventListener('keydown', block, true)
    }
  }, [previewDoc])

  const fetchCourse = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/courses/${params.id}`)
      const loadedCourse = response.data.course
      setCourse(loadedCourse)

      // Load modules for ALL users (logged in or not) — view is public, purchase requires login
      const moduleRes = await api.get(`/modules/course/${params.id}`).catch(() => ({ data: { modules: [] } }))
      const moduleList = moduleRes.data.modules || []
      const populated = await Promise.all(moduleList.map(async (moduleItem) => {
        const lessonRes = await api.get(`/lessons/module/${moduleItem._id}`).catch(() => ({ data: { lessons: [] } }))
        const lessonList = lessonRes.data.lessons || []
        const lessons = await Promise.all(lessonList.map(async (lesson) => {
          const subtopicRes = await api.get(`/subtopics/lesson/${lesson._id}`).catch(() => ({ data: { subtopics: [] } }))
          return { ...lesson, subtopics: subtopicRes.data.subtopics || [] }
        }))
        return { ...moduleItem, lessons }
      }))
      setModules(populated)
    } catch (error) {
      console.error('Fetch course failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const selection = useMemo(() => {
    const selectedModules = []
    const selectedLessons = []
    const selectedSubtopics = []
    const selectedPdfs = []

    modules.forEach((moduleItem) => {
      if (selected[moduleItem._id]) selectedModules.push({ moduleId: moduleItem._id, moduleTitle: moduleItem.title })
      ;(moduleItem.lessons || []).forEach((lesson) => {
        if (selected[lesson._id]) selectedLessons.push({ moduleId: moduleItem._id, moduleTitle: moduleItem.title, lessonId: lesson._id, lessonTitle: lesson.title })
        ;(lesson.subtopics || []).forEach((subtopic) => {
          if (selected[subtopic._id]) selectedSubtopics.push({ moduleId: moduleItem._id, lessonId: lesson._id, subtopicId: subtopic._id, subtopicTitle: subtopic.title })
          getDocs(subtopic).forEach((doc, index) => {
            const id = `${subtopic._id}:pdf:${index}`
            if (selected[id]) selectedPdfs.push({ subtopicId: subtopic._id, subtopicTitle: subtopic.title, name: doc?.name || `PDF ${index + 1}`, type: doc?.type || 'application/pdf' })
          })
        })
      })
    })

    return { selectedModules, selectedLessons, selectedSubtopics, selectedPdfs }
  }, [modules, selected])

  const roadmap = useMemo(() => {
    const itemCount = selection.selectedModules.length + selection.selectedLessons.length + selection.selectedSubtopics.length
    const weeks = Math.max(2, Math.ceil(itemCount / 3))
    return {
      duration: `${weeks} weeks`,
      price: Math.max(299, Math.round((Number(course?.price || 599) * Math.max(1, itemCount)) / 6)),
      lines: [
        `Start with ${selection.selectedModules.length || 'selected'} module foundation review`,
        `${preferences.worksheetFrequency} worksheets with ${preferences.level.toLowerCase()} difficulty`,
        `${preferences.testFrequency} tests and ${preferences.revisionMode.toLowerCase()}`,
        `${preferences.learningSpeed} learning speed in ${preferences.languagePreference}`,
      ],
    }
  }, [course?.price, preferences, selection])

  const toggle = (id) => setSelected((prev) => ({ ...prev, [id]: !prev[id] }))

  const requireLogin = () => {
    router.push(`/auth/login?redirect=${encodeURIComponent('/courses/' + params.id)}`)
  }

  const submitCustomization = async () => {
    if (!user) return requireLogin()
    if (!selection.selectedModules.length && !selection.selectedLessons.length && !selection.selectedSubtopics.length && !selection.selectedPdfs.length) {
      showError('Please select at least one module, lesson, topic, subtopic, or PDF.')
      return
    }

    try {
      setRequestLoading(true)
      await api.post('/custom-requests', {
        title: `Custom Package - ${course.title}`,
        description: notes || `Personalized package request for ${course.title}`,
        deliverable: 'custom_course_package',
        difficulty: preferences.level.toLowerCase(),
        budget: roadmap.price,
        selectedTopics: selection.selectedModules,
        selectedModules: selection.selectedModules,
        selectedLessons: selection.selectedLessons,
        selectedSubtopics: selection.selectedSubtopics,
        selectedPdfs: selection.selectedPdfs,
        preferences,
        roadmap: roadmap.lines,
        estimatedDuration: roadmap.duration,
        packageSummary: `${selection.selectedModules.length} modules, ${selection.selectedLessons.length} lessons, ${selection.selectedSubtopics.length} subtopics, ${selection.selectedPdfs.length} PDFs`,
        status: 'pending',
      })
      showSuccess('Customization request sent to admin. You can track it from your dashboard.')
      router.push('/dashboard/custom-requests')
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to submit customization request')
    } finally {
      setRequestLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!user) return requireLogin()
    try {
      await api.post('/cart', { courseId: course._id })
      router.push('/cart')
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to add to cart. Please try again.')
    }
  }

  const handleEnroll = async () => {
    if (!user) return requireLogin()
    if (course.isFree || course.isDemo) {
      try {
        await api.post('/cart', { courseId: course._id }).catch(() => {})
        await api.post('/orders')
        router.push(`/learn/${course._id}`)
      } catch (error) {
        showError(error.response?.data?.message || 'Failed to enroll. Please try again.')
      }
      return
    }
    setShowPaymentModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-academic">
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="h-14 w-14 animate-spin rounded-full border-b-2 border-t-2 border-primary" />
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-academic">
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center text-xl font-bold text-navy">Course not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-academic pb-16">
      <Navbar />

      <section className="relative overflow-hidden premium-section">
        <div className="absolute inset-0 hero-grid opacity-70" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8 lg:py-20">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-5 flex flex-wrap gap-3">
              <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary">{course.category}</span>
              <span className="rounded-full bg-secondary/10 px-4 py-2 text-sm font-bold text-secondary">{course.difficulty}</span>
            </div>
            <h1 className="text-4xl font-black leading-tight text-navy sm:text-6xl">{course.title}</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">{course.description}</p>
            <div className="mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: Star, label: `${course.rating || 4.8} rating` },
                { icon: Clock, label: course.duration || 'Self-paced' },
                { icon: BookOpen, label: `${course.topics?.length || modules.length || 0} topics` },
                { icon: Award, label: 'Certificate' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-primary/10 bg-white p-4 text-sm font-semibold text-ink shadow-sm">
                  <item.icon className="mb-2 h-5 w-5 text-primary" />
                  {item.label}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.aside initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-3xl border border-primary/10 bg-white p-6 shadow-premium">
            <div className="mb-6 flex aspect-video items-center justify-center rounded-2xl bg-brand-gradient text-white">
              <PlayCircle className="h-16 w-16" />
            </div>
            <p className="text-sm font-bold uppercase tracking-wide text-muted">Course package</p>
            <div className="mt-2 text-4xl font-black text-primary">{course.isFree || course.isDemo ? 'FREE' : `Rs.${course.price}`}</div>
            <div className="mt-5 space-y-3 text-sm font-semibold text-ink">
              {['Lifetime access', 'Protected PDF previews', 'Custom course request option', 'Progress-ready structure'].map((item) => (
                <p key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-secondary" />{item}</p>
              ))}
            </div>
            <div className="mt-6 space-y-3">
              <button onClick={handleEnroll} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-gradient px-5 py-4 font-bold text-white">
                {user ? (course.isFree || course.isDemo ? 'Start Free Course' : 'Enroll Now') : <><Lock className="h-5 w-5" /> Login to Enroll</>}
              </button>
              {user && course.price > 0 && !course.isFree && !course.isDemo && (
                <button onClick={handleAddToCart} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/10 bg-academic px-5 py-4 font-bold text-primary">
                  <ShoppingCart className="h-5 w-5" /> Add to Cart
                </button>
              )}
            </div>
          </motion.aside>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-primary/10 bg-white p-7 shadow-premium">
            <div className="mb-5 flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-2xl font-black text-navy">Course Structure</h2>
                <p className="text-sm text-muted">{user ? 'Logged-in students can view structure and preview documents.' : 'Browse the full course structure. Login to purchase and study.'}</p>
              </div>
            </div>
            {!user ? (
              <div className="space-y-4">
                <div className="rounded-2xl bg-academic p-4 text-sm text-muted text-center border border-primary/10">
                  <p className="font-semibold text-ink mb-1">Preview Mode</p>
                  <p>You are viewing the course structure. <button onClick={requireLogin} className="text-primary font-bold hover:underline">Sign in</button> to purchase and start learning.</p>
                </div>
                {modules.length === 0 ? (
                  <p className="rounded-2xl bg-academic p-5 text-muted text-sm">No modules published yet.</p>
                ) : (
                  <div className="max-h-[640px] space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                    {modules.map((moduleItem) => (
                      <div key={moduleItem._id} className="rounded-2xl border border-primary/10 bg-academic p-4">
                        <p className="font-black text-navy">{moduleItem.title}</p>
                        <p className="mt-1 text-sm text-muted">{moduleItem.description}</p>
                        {(moduleItem.lessons || []).map((lesson) => (
                          <div key={lesson._id} className="mt-3 rounded-xl bg-white p-3">
                            <p className="font-bold text-ink">{lesson.title}</p>
                            {(lesson.subtopics || []).map((subtopic) => (
                              <div key={subtopic._id} className="mt-2 rounded-lg border border-primary/10 p-3 text-sm text-muted">
                                <p className="font-semibold text-ink">{subtopic.title}</p>
                                {getDocs(subtopic).length > 0 && (
                                  <p className="mt-1 text-xs text-primary font-semibold">{getDocs(subtopic).length} document{getDocs(subtopic).length > 1 ? 's' : ''} — <button onClick={requireLogin} className="underline">login to view</button></p>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : modules.length === 0 ? (
              <p className="rounded-2xl bg-academic p-5 text-muted">No modules are published for this course yet.</p>
            ) : (
              <div className="max-h-[640px] space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {modules.map((moduleItem) => (
                  <div key={moduleItem._id} className="rounded-2xl border border-primary/10 bg-academic p-4">
                    <p className="font-black text-navy">{moduleItem.title}</p>
                    <p className="mt-1 text-sm text-muted">{moduleItem.description}</p>
                    {(moduleItem.lessons || []).map((lesson) => (
                      <div key={lesson._id} className="mt-3 rounded-xl bg-white p-3">
                        <p className="font-bold text-ink">{lesson.title}</p>
                        {(lesson.subtopics || []).map((subtopic) => (
                          <div key={subtopic._id} className="mt-2 rounded-lg border border-primary/10 p-3 text-sm text-muted">
                            <p className="font-semibold text-ink">{subtopic.title}</p>
                            {getDocs(subtopic).length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {getDocs(subtopic).map((doc, index) => (
                                  <button key={`${subtopic._id}-${index}`} onClick={() => setPreviewDoc(doc)} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                                    <FileText className="h-3.5 w-3.5" /> Secure View
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-primary/10 bg-white p-7 shadow-premium">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-navy">Customize My Course</h2>
                <p className="text-sm text-muted">Select only what you want. Admin will review, finalize, and assign your package.</p>
              </div>
              <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-secondary">{steps[step]}</span>
            </div>

            <div className="mb-6 grid grid-cols-6 gap-2">
              {steps.map((label, index) => (
                <button key={label} onClick={() => setStep(index)} className={`h-2 rounded-full transition ${index <= step ? 'bg-brand-gradient' : 'bg-slate-200'}`} aria-label={label} />
              ))}
            </div>

            {step === 0 && <SelectList title="Select modules" items={modules} selected={selected} onToggle={toggle} idKey="_id" titleKey="title" />}
            {step === 1 && <SelectList title="Select lessons" items={modules.flatMap((m) => (m.lessons || []).map((l) => ({ ...l, helper: m.title })))} selected={selected} onToggle={toggle} idKey="_id" titleKey="title" />}
            {step === 2 && <SelectList title="Select topics and subtopics" items={modules.flatMap((m) => (m.lessons || []).flatMap((l) => (l.subtopics || []).map((s) => ({ ...s, helper: `${m.title} / ${l.title}` }))))} selected={selected} onToggle={toggle} idKey="_id" titleKey="title" />}
            {step === 3 && (
              <SelectList
                title="Select PDFs"
                items={modules.flatMap((m) => (m.lessons || []).flatMap((l) => (l.subtopics || []).flatMap((s) => getDocs(s).map((doc, index) => ({ _id: `${s._id}:pdf:${index}`, title: doc?.name || `PDF ${index + 1}`, helper: s.title })))))}
                selected={selected}
                onToggle={toggle}
                idKey="_id"
                titleKey="title"
              />
            )}
            {step === 4 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ['level', ['Basic', 'Standard', 'Advanced']],
                  ['learningSpeed', ['Relaxed', 'Balanced', 'Fast track']],
                  ['worksheetFrequency', ['Daily', 'Weekly', 'Topic-wise']],
                  ['testFrequency', ['Weekly', 'Bi-weekly', 'Monthly']],
                  ['languagePreference', ['English', 'Hindi', 'English + Hindi']],
                  ['revisionMode', ['Smart revision', 'Exam revision', 'Formula revision']],
                ].map(([key, options]) => (
                  <label key={key} className="block">
                    <span className="mb-2 block text-sm font-bold capitalize text-ink">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <select value={preferences[key]} onChange={(e) => setPreferences((prev) => ({ ...prev, [key]: e.target.value }))} className="w-full rounded-2xl border border-primary/10 bg-academic px-4 py-3 text-ink outline-none">
                      {options.map((option) => <option key={option}>{option}</option>)}
                    </select>
                  </label>
                ))}
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="sm:col-span-2 rounded-2xl border border-primary/10 bg-academic px-4 py-3 text-ink outline-none" rows={4} placeholder="Tell admin what you want merged, customized, or prepared..." />
              </div>
            )}
            {step === 5 && (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-4">
                  <SummaryCard label="Modules" value={selection.selectedModules.length} />
                  <SummaryCard label="Lessons" value={selection.selectedLessons.length} />
                  <SummaryCard label="Subtopics" value={selection.selectedSubtopics.length} />
                  <SummaryCard label="PDFs" value={selection.selectedPdfs.length} />
                </div>
                <div className="rounded-2xl bg-academic p-5">
                  <p className="font-black text-navy">Personalized roadmap</p>
                  <ul className="mt-3 space-y-2 text-sm text-muted">
                    {roadmap.lines.map((line) => <li key={line} className="flex gap-2"><Sparkles className="h-4 w-4 flex-shrink-0 text-accent" />{line}</li>)}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Estimated: {roadmap.duration}</span>
                    <span className="rounded-full bg-secondary/10 px-3 py-1 text-secondary">Estimated price: Rs.{roadmap.price}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/10 px-5 py-3 font-bold text-primary disabled:opacity-40">
                <ChevronLeft className="h-5 w-5" /> Back
              </button>
              {step < steps.length - 1 ? (
                <button onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-gradient px-5 py-3 font-bold text-white">
                  Next <ChevronRight className="h-5 w-5" />
                </button>
              ) : (
                <button onClick={submitCustomization} disabled={requestLoading} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-gradient px-5 py-3 font-bold text-white disabled:opacity-60">
                  {requestLoading ? 'Submitting...' : 'Send Request to Admin'} <ArrowRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </section>
      </main>

      <PaymentModal isOpen={showPaymentModal} onClose={() => setShowPaymentModal(false)} course={course} onSuccess={() => router.push('/dashboard')} />

      {previewDoc && (
        <PdfPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}
    </div>
  )
}

function SelectList({ title, items, selected, onToggle, idKey, titleKey }) {
  return (
    <div>
      <p className="mb-4 font-black text-navy">{title}</p>
      {items.length === 0 ? (
        <p className="rounded-2xl bg-academic p-5 text-sm text-muted">Nothing available for this step yet.</p>
      ) : (
        <div className="max-h-[380px] space-y-3 overflow-y-auto pr-2 custom-scrollbar">
          {items.map((item) => (
            <label key={item[idKey]} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${selected[item[idKey]] ? 'border-primary bg-primary/5' : 'border-primary/10 bg-academic hover:border-primary/30'}`}>
              <input type="checkbox" checked={!!selected[item[idKey]]} onChange={() => onToggle(item[idKey])} className="mt-1 accent-primary" />
              <span>
                <span className="block font-bold text-ink">{item[titleKey]}</span>
                {item.helper && <span className="mt-1 block text-xs text-muted">{item.helper}</span>}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-white p-4 text-center shadow-sm">
      <p className="text-3xl font-black text-primary">{value}</p>
      <p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p>
    </div>
  )
}

// PDF Preview Modal — converts base64 to Blob URL so the PDF actually renders
function PdfPreviewModal({ doc, onClose }) {
  const [blobUrl, setBlobUrl] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!doc) return
    try {
      // If doc has base64 data, convert to blob URL
      if (doc.data) {
        const byteChars = atob(doc.data)
        const byteNums = new Array(byteChars.length)
        for (let i = 0; i < byteChars.length; i++) {
          byteNums[i] = byteChars.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNums)
        const blob = new Blob([byteArray], { type: doc.type || 'application/pdf' })
        const url = URL.createObjectURL(blob)
        setBlobUrl(url)
        return () => URL.revokeObjectURL(url)
      }
      // If doc has a direct URL
      if (doc.url) {
        setBlobUrl(doc.url)
      }
    } catch (e) {
      console.error('PDF preview error:', e)
      setError(true)
    }
  }, [doc])

  // Block right-click and copy shortcuts inside modal
  useEffect(() => {
    const block = (e) => {
      if (e.type === 'contextmenu') { e.preventDefault(); return }
      const ctrl = e.ctrlKey || e.metaKey
      if (ctrl && ['s', 'p', 'u', 'c', 'a'].includes(e.key?.toLowerCase())) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    document.addEventListener('contextmenu', block, true)
    document.addEventListener('keydown', block, true)
    return () => {
      document.removeEventListener('contextmenu', block, true)
      document.removeEventListener('keydown', block, true)
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      onClick={onClose}
    >
      <div
        className="relative h-[88vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary/10 px-5 py-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <p className="font-bold text-navy truncate max-w-xs">{doc?.name || 'PDF Preview'}</p>
            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-semibold">View Only</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted hover:bg-academic hover:text-ink transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Watermark */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
          <p className="rotate-[-30deg] text-4xl font-black text-primary/8 whitespace-nowrap select-none">
            Beyond Classroom — View Only — Beyond Classroom — View Only
          </p>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-hidden relative">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted">
              <FileText className="h-16 w-16 text-primary/30" />
              <p className="font-semibold text-lg">Unable to preview this PDF</p>
              <p className="text-sm">The file may not be available for preview.</p>
            </div>
          ) : !blobUrl ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
            </div>
          ) : (
            <object
              data={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
              type="application/pdf"
              className="w-full h-full select-none"
              aria-label="PDF Preview"
            >
              {/* Fallback for browsers that don't support object tag for PDFs */}
              <embed
                src={`${blobUrl}#toolbar=0&navpanes=0`}
                type="application/pdf"
                className="w-full h-full"
              />
            </object>
          )}
        </div>
      </div>
    </div>
  )
}
