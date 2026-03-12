'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { BookOpen, CheckCircle, PlayCircle, FileText, Lock, Clock, Award, TrendingUp, AlertCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import api from '@/utils/api'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdvancedLearnPage() {
  const params = useParams()
  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [activeModule, setActiveModule] = useState(null)
  const [lessons, setLessons] = useState([])
  const [activeLesson, setActiveLesson] = useState(null)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('lesson') // lesson, practice, quiz

  useEffect(() => {
    fetchCourseData()
  }, [params.courseId])

  const fetchCourseData = async () => {
    try {
      // Fetch course
      const courseRes = await api.get(`/courses/${params.courseId}`)
      setCourse(courseRes.data.course)
      
      // Fetch modules
      const modulesRes = await api.get(`/modules/course/${params.courseId}`)
      setModules(modulesRes.data.modules || [])
      
      // Fetch progress (optional - may fail if not logged in)
      try {
        const progressRes = await api.get(`/progress/course/${params.courseId}`)
        setProgress(progressRes.data.progress)
      } catch (err) {
        console.log('Progress not available (not logged in)')
        setProgress({ completionPercentage: 0, lessonsCompleted: [], daysRemaining: null })
      }
      
      // Select first module if available
      if (modulesRes.data.modules && modulesRes.data.modules.length > 0) {
        selectModule(modulesRes.data.modules[0])
      }
    } catch (error) {
      console.error('Fetch failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectModule = async (module) => {
    setActiveModule(module)
    try {
      const lessonsRes = await api.get(`/lessons/module/${module._id}`)
      setLessons(lessonsRes.data.lessons)
      if (lessonsRes.data.lessons.length > 0) {
        setActiveLesson(lessonsRes.data.lessons[0])
      }
    } catch (error) {
      console.error('Fetch lessons failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      {/* Course Header */}
      <div className="bg-gradient-to-r from-dark-100 via-dark-100 to-dark-100 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{course?.title}</h1>
              <p className="text-gray-300">{course?.instructor}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-primary mb-2">
                <TrendingUp className="h-5 w-5" />
                <span className="text-2xl font-bold">{progress?.completionPercentage || 0}%</span>
              </div>
              <p className="text-gray-400 text-sm">Course Progress</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4 bg-dark-200 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress?.completionPercentage || 0}%` }}
              className="h-full bg-gradient-to-r from-primary to-secondary"
            />
          </div>

          {/* Expiry Warning */}
          {progress?.daysRemaining && progress.daysRemaining < 30 && (
            <div className="mt-4 bg-orange-500/20 border border-orange-500/50 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-400" />
              <span className="text-orange-300">
                Course expires in {progress.daysRemaining} days
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Modules */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-primary/20 p-5 sticky top-24 shadow-xl shadow-primary/5">
              <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Course Modules
              </h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {modules.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-2">No modules available yet</p>
                    <p className="text-gray-500 text-sm">This course is being prepared</p>
                  </div>
                ) : (
                  modules.map((module, index) => (
                    <motion.button
                      key={module._id}
                      onClick={() => selectModule(module)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full text-left px-4 py-4 rounded-xl transition-all duration-300 ${
                        activeModule?._id === module._id
                          ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30'
                          : 'bg-dark-200/30 text-gray-300 hover:bg-dark-200/50 border border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        {progress?.lessonsCompleted?.some(l => lessons.find(lesson => lesson._id === l && lesson.moduleId === module._id)) ? (
                          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                        ) : (
                          <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            activeModule?._id === module._id 
                              ? 'bg-white/20' 
                              : 'bg-primary/20 text-primary'
                          }`}>
                            {index + 1}
                          </div>
                        )}
                        <span className="text-sm font-semibold leading-tight">{module.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs opacity-80 ml-10">
                        <Clock className="h-3 w-3" />
                        {module.duration}
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Lessons Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-secondary/20 p-4 shadow-xl shadow-secondary/5">
                  <h3 className="text-md font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent mb-4">Lessons</h3>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                    {lessons.length === 0 ? (
                      <div className="text-center py-6">
                        <FileText className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">No lessons yet</p>
                      </div>
                    ) : (
                      lessons.map((lesson) => (
                        <motion.button
                          key={lesson._id}
                          onClick={() => { setActiveLesson(lesson); setView('lesson') }}
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-all duration-200 ${
                            activeLesson?._id === lesson._id
                              ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20'
                              : 'bg-dark-200/20 text-gray-300 hover:bg-dark-200/40 border border-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {progress?.lessonsCompleted?.includes(lesson._id) ? (
                              <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                            ) : lesson.isLocked ? (
                              <Lock className="h-4 w-4 flex-shrink-0" />
                            ) : (
                              <PlayCircle className="h-4 w-4 flex-shrink-0" />
                            )}
                            <span className="text-xs leading-tight">{lesson.title}</span>
                          </div>
                        </motion.button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Lesson Content */}
              <div className="lg:col-span-3">
                <AnimatePresence mode="wait">
                  {activeLesson && (
                    <motion.div
                      key={activeLesson._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl"
                    >
                      {/* View Tabs */}
                      <div className="flex gap-3 mb-8">
                        <motion.button
                          onClick={() => setView('lesson')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                            view === 'lesson'
                              ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30'
                              : 'bg-dark-200/50 text-gray-300 hover:bg-dark-200 border border-white/10'
                          }`}
                        >
                          <FileText className="h-4 w-4" />
                          Lesson
                        </motion.button>
                        <motion.button
                          onClick={() => setView('practice')}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                            view === 'practice'
                              ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30'
                              : 'bg-dark-200/50 text-gray-300 hover:bg-dark-200 border border-white/10'
                          }`}
                        >
                          <Award className="h-4 w-4" />
                          Practice
                        </motion.button>
                      </div>

                      {view === 'lesson' && (
                        <>
                          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
                            {activeLesson.title}
                          </h1>
                          <p className="text-gray-300 mb-6 text-lg">{activeLesson.description}</p>

                          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
                            <div className="flex items-center gap-2 text-gray-400">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm">{activeLesson.duration}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                              <BookOpen className="h-4 w-4" />
                              <span className="text-sm capitalize">{activeLesson.type}</span>
                            </div>
                          </div>

                          {activeLesson.videoUrl && (
                            <div className="mb-8 bg-black rounded-xl aspect-video flex items-center justify-center border border-white/10 overflow-hidden">
                              <PlayCircle className="h-16 w-16 text-primary" />
                            </div>
                          )}

                          {/* Lesson Content with Custom Styling */}
                          <div className="lesson-content space-y-6">
                            <style jsx global>{`
                              .lesson-content h2 {
                                font-size: 1.75rem;
                                font-weight: 700;
                                color: #22d3ee;
                                margin-top: 2rem;
                                margin-bottom: 1rem;
                                padding-bottom: 0.5rem;
                                border-bottom: 2px solid rgba(34, 211, 238, 0.2);
                              }
                              .lesson-content h3 {
                                font-size: 1.35rem;
                                font-weight: 600;
                                color: #a78bfa;
                                margin-top: 1.5rem;
                                margin-bottom: 0.75rem;
                              }
                              .lesson-content p {
                                color: #d1d5db;
                                line-height: 1.8;
                                margin-bottom: 1rem;
                                font-size: 1.05rem;
                              }
                              .lesson-content ul, .lesson-content ol {
                                color: #d1d5db;
                                margin-left: 1.5rem;
                                margin-bottom: 1rem;
                                line-height: 1.8;
                              }
                              .lesson-content li {
                                margin-bottom: 0.5rem;
                                padding-left: 0.5rem;
                              }
                              .lesson-content ul li {
                                list-style-type: none;
                                position: relative;
                              }
                              .lesson-content ul li:before {
                                content: "▹";
                                color: #22d3ee;
                                font-weight: bold;
                                position: absolute;
                                left: -1.25rem;
                              }
                              .lesson-content ol li {
                                list-style-type: decimal;
                                color: #d1d5db;
                              }
                              .lesson-content strong {
                                color: #22d3ee;
                                font-weight: 600;
                              }
                              .lesson-content code {
                                background: rgba(34, 211, 238, 0.1);
                                color: #22d3ee;
                                padding: 0.2rem 0.5rem;
                                border-radius: 0.25rem;
                                font-family: 'Courier New', monospace;
                                font-size: 0.95rem;
                              }
                            `}</style>
                            <div 
                              className="bg-dark/50 rounded-xl p-6 border border-white/5"
                              dangerouslySetInnerHTML={{ __html: activeLesson.content?.concept || '<p class="text-gray-400">No content available</p>' }} 
                            />
                          </div>

                          {/* Summary Section */}
                          {activeLesson.content?.summary && (
                            <div className="mt-8 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-xl p-6">
                              <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                                <Award className="h-5 w-5" />
                                Key Takeaways
                              </h3>
                              <p className="text-gray-300 leading-relaxed">{activeLesson.content.summary}</p>
                            </div>
                          )}

                          {/* Navigation Buttons */}
                          <div className="flex justify-between mt-10 pt-6 border-t border-white/10">
                            <button
                              onClick={() => {
                                const currentIndex = lessons.findIndex(l => l._id === activeLesson._id)
                                if (currentIndex > 0) setActiveLesson(lessons[currentIndex - 1])
                              }}
                              disabled={lessons.findIndex(l => l._id === activeLesson._id) === 0}
                              className="px-6 py-3 bg-dark-200 text-white rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                              Previous
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await api.put(`/progress/course/${params.courseId}/lesson/${activeLesson._id}`)
                                  const currentIndex = lessons.findIndex(l => l._id === activeLesson._id)
                                  if (currentIndex < lessons.length - 1) {
                                    setActiveLesson(lessons[currentIndex + 1])
                                  }
                                  fetchCourseData()
                                } catch (err) {
                                  console.log('Progress update failed:', err)
                                }
                              }}
                              className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all font-medium shadow-lg shadow-primary/20"
                            >
                              Complete & Next
                            </button>
                          </div>
                        </>
                      )}

                      {view === 'practice' && (
                        <div>
                          <h2 className="text-2xl font-bold text-white mb-4">Practice Problems</h2>
                          <p className="text-gray-400 mb-6">Test your understanding with these practice problems</p>
                          <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 text-center">
                            <Award className="h-12 w-12 text-primary mx-auto mb-3" />
                            <p className="text-gray-300">Practice problems coming soon!</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
