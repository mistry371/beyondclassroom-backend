'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { Clock, Star, ShoppingCart, BookOpen, Award, CheckCircle, PlayCircle, Lock } from 'lucide-react'
import Navbar from '@/components/Navbar'
import PaymentModal from '@/components/PaymentModal'
import api from '@/utils/api'
import { motion } from 'framer-motion'

export default function CourseDetails() {
  const params = useParams()
  const router = useRouter()
  const { user } = useSelector((state) => state.auth)
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [modules, setModules] = useState([])
  const [customization, setCustomization] = useState({
    difficultyLevel: 'Beginner',
    worksheetType: 'Standard',
    practiceType: 'Mixed',
    languagePreference: 'English',
    learningStyle: 'Visual',
    gradeLevel: '',
    notes: '',
  })
  const [requestLoading, setRequestLoading] = useState(false)
  const [previewDoc, setPreviewDoc] = useState(null)

  useEffect(() => {
    fetchCourse()
  }, [params.id])

  const fetchCourse = async () => {
    try {
      const response = await api.get(`/courses/${params.id}`)
      setCourse(response.data.course)
      if (user) {
        const mRes = await api.get(`/modules/course/${params.id}`).catch(() => ({ data: { modules: [] } }))
        const mods = mRes.data.modules || []
        const withChildren = await Promise.all(mods.map(async (m) => {
          const lRes = await api.get(`/lessons/module/${m._id}`).catch(() => ({ data: { lessons: [] } }))
          const lessons = lRes.data.lessons || []
          const lessonsWithSubtopics = await Promise.all(lessons.map(async (l) => {
            const sRes = await api.get(`/subtopics/lesson/${l._id}`).catch(() => ({ data: { subtopics: [] } }))
            return { ...l, subtopics: sRes.data.subtopics || [] }
          }))
          return { ...m, lessons: lessonsWithSubtopics }
        }))
        setModules(withChildren)
      }
    } catch (error) {
      console.error('Fetch course failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCustomizationRequest = async (e) => {
    e.preventDefault()
    if (!user) return router.push(`/auth/login?redirect=${encodeURIComponent('/courses/' + params.id)}`)
    try {
      setRequestLoading(true)
      await api.post('/custom-course-requests', {
        title: `Customization Request - ${course.title}`,
        deliverable: customization.practiceType,
        selectedTopics: modules.map((m) => ({
          moduleId: m._id,
          moduleTitle: m.title,
          lessons: (m.lessons || []).map((l) => ({
            lessonId: l._id,
            lessonTitle: l.title,
            subtopics: (l.subtopics || []).map((s) => ({ subtopicId: s._id, subtopicTitle: s.title })),
          })),
        })),
        budget: Number(course.price || 0),
        ...customization,
      })
      alert('Customization request sent to admin successfully.')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send request')
    } finally {
      setRequestLoading(false)
    }
  }

  const handleAddToCart = async () => {
    // Check if user is logged in
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent('/courses/' + params.id)}`)
      return
    }
    
    try {
      await api.post('/cart', { courseId: course._id })
      router.push('/cart')
    } catch (error) {
      console.error('Add to cart failed:', error)
      alert('Failed to add to cart. Please try again.')
    }
  }

  const handleEnroll = async () => {
    // Check if user is logged in
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent('/courses/' + params.id)}`)
      return
    }
    
    // If course is free/demo, enroll directly via orders API
    if (course.isFree || course.isDemo) {
      try {
        // Add to cart first, then place order to get it into purchasedCourses
        await api.post('/cart', { courseId: course._id }).catch(() => {}) // ignore if already in cart
        await api.post('/orders')
        router.push(`/learn/${course._id}`)
      } catch (error) {
        console.error('Failed to enroll:', error)
        alert('Failed to enroll. Please try again.')
      }
      return
    }
    
    // Open payment modal for paid courses
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = () => {
    alert('Payment successful! You are now enrolled in the course.')
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-dark-100 to-dark">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-dark-100 to-dark">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-white text-xl">Course not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-100 to-dark">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Course Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-1 rounded-full text-sm font-semibold">
                  {course.category}
                </span>
                <span className="bg-white/10 backdrop-blur-sm text-white px-4 py-1 rounded-full text-sm">
                  {course.difficulty}
                </span>
              </div>

              <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                {course.title}
              </h1>

              <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                {course.description}
              </p>

              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center text-yellow-400">
                  <Star className="h-6 w-6 fill-current" />
                  <span className="ml-2 text-xl font-bold">{course.rating || 4.8}</span>
                  <span className="ml-2 text-gray-400">({course.enrolledCount || 0} students)</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-gray-300 mb-8">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-secondary" />
                  <span>{course.topics?.length || 0} Topics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                  <span>Certificate</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-white">
                  {course.isFree || course.isDemo ? (
                    <span className="text-5xl font-bold text-green-400">FREE</span>
                  ) : (
                    <>
                      <span className="text-5xl font-bold">₹{course.price}</span>
                      {course.discountPrice && (
                        <span className="text-2xl text-gray-400 line-through ml-3">₹{course.discountPrice}</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right: Course Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-dark-100/90 to-dark/90 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl"
            >
              <div className="aspect-video bg-gradient-to-br from-primary to-secondary rounded-xl mb-6 flex items-center justify-center">
                <PlayCircle className="h-20 w-20 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-white mb-4">Enroll in this course</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  <span>Lifetime access</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  <span>Certificate of completion</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  <span>24/7 support</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                  <span>Practice exercises</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleEnroll}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white py-4 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  {user ? (
                    course.isFree || course.isDemo ? (
                      <>
                        <PlayCircle className="h-5 w-5" />
                        Start Free Course
                      </>
                    ) : (
                      'Enroll Now'
                    )
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      Login to Enroll
                    </>
                  )}
                </button>
                {user && course.price > 0 && !course.isFree && !course.isDemo && (
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-white/10 backdrop-blur-sm border border-white/20 text-white py-4 rounded-xl font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </button>
                )}
              </div>

              {!user && (
                <p className="text-center text-gray-400 text-sm mt-4">
                  Please login to purchase this course
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-br from-dark-100/90 to-dark/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">What you'll learn</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {course.topics?.map((topic, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-6 w-6 text-green-400 flex-shrink-0 mt-1" />
                        <span className="text-gray-300">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">Course Description</h2>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {course.description}
                  </p>
                </div>

                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">Requirements</h2>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-primary rounded-full"></div>
                      Basic understanding of mathematics
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-primary rounded-full"></div>
                      Willingness to learn and practice
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-primary rounded-full"></div>
                      Computer or mobile device with internet
                    </li>
                  </ul>
                </div>
              </motion.div>
          </div>
        </div>
      </div>

      {user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="bg-gradient-to-br from-dark-100/90 to-dark/90 backdrop-blur-xl rounded-2xl border border-white/10 p-8 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-10 text-white text-2xl font-bold flex items-center justify-center rotate-[-20deg]">
              BeyondClassroom Copyright - View Only
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Course Structure Preview (View Only)</h2>
            <p className="text-gray-400 mb-6">Modules, topics, subtopics and files are visible with protected preview.</p>
            <div className="space-y-4 mb-8">
              {modules.map((m) => (
                <div key={m._id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h3 className="text-white font-semibold">{m.title}</h3>
                  {(m.lessons || []).map((l) => (
                    <div key={l._id} className="ml-4 mt-3 border-l border-white/10 pl-3">
                      <p className="text-gray-200">{l.title}</p>
                      {(l.subtopics || []).map((s) => (
                        <div key={s._id} className="ml-3 mt-2 text-sm text-gray-400">
                          <p>{s.title}</p>
                          <p>Files: {(s.documents || (s.document ? [s.document] : [])).length} (view only)</p>
                          <div className="mt-2 space-y-2">
                            {(s.documents || (s.document ? [s.document] : [])).map((doc, idx) => (
                              <button
                                key={`${doc?.name || 'file'}-${idx}`}
                                type="button"
                                onClick={() => setPreviewDoc(doc)}
                                className="px-3 py-1 bg-primary/20 text-primary rounded hover:bg-primary/30 transition-all text-xs"
                              >
                                View {doc?.name || `File ${idx + 1}`}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">Customize This Course</h2>
            <form onSubmit={handleCustomizationRequest} className="grid md:grid-cols-2 gap-4">
              <input value={customization.difficultyLevel} onChange={(e) => setCustomization({ ...customization, difficultyLevel: e.target.value })} className="px-4 py-3 bg-dark border border-white/10 rounded-lg text-white" placeholder="Difficulty Level" />
              <input value={customization.worksheetType} onChange={(e) => setCustomization({ ...customization, worksheetType: e.target.value })} className="px-4 py-3 bg-dark border border-white/10 rounded-lg text-white" placeholder="Worksheet Type" />
              <input value={customization.practiceType} onChange={(e) => setCustomization({ ...customization, practiceType: e.target.value })} className="px-4 py-3 bg-dark border border-white/10 rounded-lg text-white" placeholder="Practice Type" />
              <input value={customization.languagePreference} onChange={(e) => setCustomization({ ...customization, languagePreference: e.target.value })} className="px-4 py-3 bg-dark border border-white/10 rounded-lg text-white" placeholder="Language Preference" />
              <input value={customization.learningStyle} onChange={(e) => setCustomization({ ...customization, learningStyle: e.target.value })} className="px-4 py-3 bg-dark border border-white/10 rounded-lg text-white" placeholder="Learning Style" />
              <input value={customization.gradeLevel} onChange={(e) => setCustomization({ ...customization, gradeLevel: e.target.value })} className="px-4 py-3 bg-dark border border-white/10 rounded-lg text-white" placeholder="Grade Level" />
              <textarea value={customization.notes} onChange={(e) => setCustomization({ ...customization, notes: e.target.value })} className="md:col-span-2 px-4 py-3 bg-dark border border-white/10 rounded-lg text-white" rows={4} placeholder="Add selected module/topic/subtopic preferences" />
              <button disabled={requestLoading} className="md:col-span-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold">{requestLoading ? 'Sending...' : 'Send Customization Request to Admin'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        course={course}
        onSuccess={handlePaymentSuccess}
      />

      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 p-4 flex items-center justify-center" onClick={() => setPreviewDoc(null)}>
          <div className="bg-dark-100 border border-white/10 rounded-2xl w-full max-w-4xl h-[80vh] relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10 text-3xl font-bold text-white rotate-[-20deg]">
              BeyondClassroom Copyright - View Only
            </div>
            <div className="flex items-center justify-between p-3 border-b border-white/10">
              <p className="text-white text-sm truncate">{previewDoc?.name || 'File Preview'}</p>
              <button onClick={() => setPreviewDoc(null)} className="text-gray-300 hover:text-white">Close</button>
            </div>
            <iframe
              title="Document Preview"
              className="w-full h-[calc(80vh-56px)]"
              src={`data:${previewDoc?.type || 'application/pdf'};base64,${previewDoc?.data || ''}`}
            />
          </div>
        </div>
      )}
    </div>
  )
}
