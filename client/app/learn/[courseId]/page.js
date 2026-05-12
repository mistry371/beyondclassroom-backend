'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BookOpen, CheckCircle, PlayCircle, Lock, Award, Clock, Target, TrendingUp, ChevronRight, ChevronDown } from 'lucide-react'
import Navbar from '@/components/Navbar'
import api from '@/utils/api'
import { motion, AnimatePresence } from 'framer-motion'

export default function LearnPage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState(null)
  const [modules, setModules] = useState([])
  const [progress, setProgress] = useState(null)
  const [expandedModules, setExpandedModules] = useState([0])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourseData()
  }, [params.courseId])

  const fetchCourseData = async () => {
    try {
      const courseRes = await api.get(`/courses/${params.courseId}`)
      setCourse(courseRes.data.course)

      const modulesRes = await api.get(`/modules/course/${params.courseId}`)
      setModules(modulesRes.data.modules || [])

      try {
        const progressRes = await api.get(`/progress/course/${params.courseId}`)
        setProgress(progressRes.data.progress)
      } catch (err) {
        console.log('No progress yet')
      }
    } catch (error) {
      console.error('Failed to fetch course data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleModule = (index) => {
    setExpandedModules(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const isLessonCompleted = (lessonId) => {
    return progress?.lessonsCompleted?.includes(lessonId) || false
  }

  const isModuleCompleted = (module) => {
    if (!module.lessons || module.lessons.length === 0) return false
    return module.lessons.every(lesson => isLessonCompleted(lesson._id))
  }

  const getModuleProgress = (module) => {
    if (!module.lessons || module.lessons.length === 0) return 0
    const completed = module.lessons.filter(lesson => isLessonCompleted(lesson._id)).length
    return Math.round((completed / module.lessons.length) * 100)
  }

  const isModuleUnlocked = (moduleIndex) => {
    if (moduleIndex === 0) return true // First module always unlocked
    // Previous module must be completed
    const prevModule = modules[moduleIndex - 1]
    return isModuleCompleted(prevModule)
  }

  const handleStartLesson = (lessonId, moduleIndex) => {
    if (!isModuleUnlocked(moduleIndex)) return
    router.push(`/learn/${params.courseId}/lesson/${lessonId}`)
  }

  const handleStartQuiz = (quizId, moduleIndex) => {
    if (!isModuleUnlocked(moduleIndex)) return
    router.push(`/learn/${params.courseId}/quiz/${quizId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-dark-100 to-dark flex items-center justify-center">
        <Navbar />
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
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

      {/* Course Header */}
      <div className="bg-gradient-to-r from-dark-100/90 to-dark-200/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
              <span className="hover:text-primary cursor-pointer" onClick={() => router.push('/dashboard')}>Dashboard</span>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white">{course.title}</span>
            </div>
            
            <div className="flex items-start justify-between flex-wrap gap-6">
              <div className="flex-1 min-w-[300px]">
                <h1 className="text-4xl font-bold text-white mb-3">{course.title}</h1>
                <p className="text-gray-300 text-lg mb-4">{course.description}</p>
                
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <BookOpen className="h-5 w-5 text-secondary" />
                    <span>{modules.length} Modules</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Target className="h-5 w-5 text-accent" />
                    <span>{course.difficulty}</span>
                  </div>
                </div>
              </div>

              {/* Progress Card */}
              <div className="bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-xl rounded-2xl border border-primary/30 p-6 min-w-[280px]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-300 font-medium">Course Progress</span>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="text-5xl font-bold text-white mb-3">
                  {progress?.completionPercentage || 0}%
                </div>
                <div className="w-full bg-dark-200 rounded-full h-3 overflow-hidden mb-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress?.completionPercentage || 0}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                  />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{progress?.lessonsCompleted?.length || 0} lessons</span>
                  {progress?.expiryDate && (
                    <span className="text-yellow-400">
                      {Math.ceil((new Date(progress.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {modules.length === 0 ? (
            <div className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Modules Available</h3>
              <p className="text-gray-400">Course content is being prepared</p>
            </div>
          ) : (
            modules.map((module, moduleIndex) => (
              <motion.div
                key={module._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: moduleIndex * 0.1 }}
                className="bg-gradient-to-br from-dark-100/90 to-dark/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
              >
                {/* Module Header */}
                <button
                  onClick={() => isModuleUnlocked(moduleIndex) && toggleModule(moduleIndex)}
                  className={`w-full p-6 flex items-center justify-between transition-all ${isModuleUnlocked(moduleIndex) ? 'hover:bg-white/5' : 'cursor-not-allowed opacity-70'}`}
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                      isModuleCompleted(module)
                        ? 'bg-green-500/20 text-green-400'
                        : !isModuleUnlocked(moduleIndex)
                        ? 'bg-gray-500/20 text-gray-500'
                        : 'bg-gradient-to-r from-primary to-secondary text-white'
                    }`}>
                      {isModuleCompleted(module) ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : !isModuleUnlocked(moduleIndex) ? (
                        <Lock className="h-6 w-6" />
                      ) : (
                        moduleIndex + 1
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-white mb-1">{module.title}</h3>
                      <p className="text-gray-400 text-sm line-clamp-2">{module.description}</p>
                      
                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <BookOpen className="h-4 w-4" />
                          <span>{module.lessons?.length || 0} Lessons</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock className="h-4 w-4" />
                          <span>{module.duration}</span>
                        </div>
                        {module.quiz && (
                          <div className="flex items-center gap-2 text-sm text-yellow-400">
                            <Award className="h-4 w-4" />
                            <span>Quiz</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-bold text-primary mb-1">
                        {getModuleProgress(module)}%
                      </div>
                      <div className="w-32 bg-dark-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                          style={{ width: `${getModuleProgress(module)}%` }}
                        />
                      </div>
                    </div>

                    <ChevronDown
                      className={`h-6 w-6 text-gray-400 transition-transform flex-shrink-0 ${
                        expandedModules.includes(moduleIndex) ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {!isModuleUnlocked(moduleIndex) && (
                  <div className="px-6 pb-4">
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
                      <Lock className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                      <p className="text-yellow-400 text-sm">Complete <strong>{modules[moduleIndex - 1]?.title}</strong> to unlock this module.</p>
                    </div>
                  </div>
                )}

                {/* Module Content */}
                <AnimatePresence>
                  {expandedModules.includes(moduleIndex) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-white/10"
                    >
                      <div className="p-6 space-y-3">
                        {/* Lessons */}
                        {module.lessons?.map((lesson, lessonIndex) => (
                          <motion.div
                            key={lesson._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: lessonIndex * 0.05 }}
                            className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                              isLessonCompleted(lesson._id)
                                ? 'bg-green-500/10 border border-green-500/30'
                                : 'bg-white/5 border border-white/10 hover:border-primary/30'
                            }`}
                          >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              {isLessonCompleted(lesson._id) ? (
                                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                              ) : (
                                <PlayCircle className="h-5 w-5 text-primary flex-shrink-0" />
                              )}
                              
                              <div className="min-w-0 flex-1">
                                <h4 className="text-white font-semibold truncate">{lesson.title}</h4>
                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                  <span className="text-sm text-gray-400">{lesson.duration}</span>
                                  <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
                                    {lesson.type || 'Lesson'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleStartLesson(lesson._id, moduleIndex)}
                              disabled={!isModuleUnlocked(moduleIndex)}
                              className={`px-6 py-2 rounded-lg font-medium transition-all flex-shrink-0 ml-4 ${
                                !isModuleUnlocked(moduleIndex)
                                  ? 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                                  : isLessonCompleted(lesson._id)
                                  ? 'bg-white/10 text-white hover:bg-white/20'
                                  : 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90'
                              }`}
                            >
                              {!isModuleUnlocked(moduleIndex) ? (
                                <span className="flex items-center gap-2"><Lock className="h-4 w-4" />Locked</span>
                              ) : isLessonCompleted(lesson._id) ? 'Review' : 'Start'}
                            </button>
                          </motion.div>
                        ))}

                        {/* Module Quiz */}
                        {module.quiz && (
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (module.lessons?.length || 0) * 0.05 }}
                            className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 mt-4"
                          >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <Award className="h-6 w-6 text-yellow-400 flex-shrink-0" />
                              
                              <div className="min-w-0 flex-1">
                                <h4 className="text-white font-semibold">Module Quiz</h4>
                                <p className="text-sm text-gray-400">
                                  Test your knowledge • {module.quiz.questions?.length || 0} questions
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => handleStartQuiz(module.quiz._id, moduleIndex)}
                              disabled={getModuleProgress(module) < 100 || !isModuleUnlocked(moduleIndex)}
                              className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ml-4"
                            >
                              {getModuleProgress(module) < 100 ? (
                                <span className="flex items-center gap-2">
                                  <Lock className="h-4 w-4" />
                                  Locked
                                </span>
                              ) : (
                                'Take Quiz'
                              )}
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
