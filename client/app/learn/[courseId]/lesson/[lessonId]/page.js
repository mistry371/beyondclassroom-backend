'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { BookOpen, CheckCircle, ArrowLeft, ArrowRight, Target, Clock, Award, PlayCircle } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MathRenderer from '@/components/MathRenderer'
import TrialGuard from '@/components/TrialGuard'
import api from '@/utils/api'
import { motion } from 'framer-motion'

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const [lesson, setLesson] = useState(null)
  const [practices, setPractices] = useState([])
  const [currentPractice, setCurrentPractice] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [showSolution, setShowSolution] = useState(false)
  const [practiceResult, setPracticeResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    fetchLessonData()
  }, [params.lessonId])

  const fetchLessonData = async () => {
    try {
      const lessonRes = await api.get(`/lessons/${params.lessonId}`)
      setLesson(lessonRes.data.lesson)

      const practicesRes = await api.get(`/practices/lesson/${params.lessonId}`)
      setPractices(practicesRes.data.practices || [])
    } catch (error) {
      console.error('Failed to fetch lesson:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitPractice = async () => {
    if (!userAnswer.trim()) return

    try {
      const practice = practices[currentPractice]
      const res = await api.post(`/practices/${practice._id}/submit`, {
        answer: userAnswer
      })

      setPracticeResult(res.data)
      setShowSolution(true)
    } catch (error) {
      console.error('Failed to submit practice:', error)
    }
  }

  const handleNextPractice = () => {
    if (currentPractice < practices.length - 1) {
      setCurrentPractice(currentPractice + 1)
      setUserAnswer('')
      setShowSolution(false)
      setPracticeResult(null)
    }
  }

  const handlePreviousPractice = () => {
    if (currentPractice > 0) {
      setCurrentPractice(currentPractice - 1)
      setUserAnswer('')
      setShowSolution(false)
      setPracticeResult(null)
    }
  }

  const handleCompleteLesson = async () => {
    setCompleting(true)
    try {
      await api.put(`/progress/course/${params.courseId}/lesson/${params.lessonId}`)
      router.push(`/learn/${params.courseId}`)
    } catch (error) {
      console.error('Failed to complete lesson:', error)
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-dark-100 to-dark flex items-center justify-center">
        <Navbar />
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-dark-100 to-dark">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-white text-xl">Lesson not found</p>
        </div>
      </div>
    )
  }

  const practice = practices[currentPractice]

  return (
    <TrialGuard courseId={params.courseId}>
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-100 to-dark">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.push(`/learn/${params.courseId}`)}
          className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Course
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lesson Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-dark-100/90 to-dark/90 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-primary to-secondary rounded-xl">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{lesson.title}</h1>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-sm text-gray-400 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {lesson.duration}
                    </span>
                    <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
                      {lesson.type || 'Lesson'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Concept Explanation */}
              <div className="prose prose-invert max-w-none mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">📚 Concept Explanation</h2>
                <div className="text-gray-300 leading-relaxed">
                  <MathRenderer content={
                    typeof lesson.content === 'string' ? lesson.content :
                    typeof lesson.content?.concept === 'string' ? lesson.content.concept :
                    typeof lesson.description === 'string' ? lesson.description : ''
                  } />
                </div>
              </div>

              {/* Examples */}
              {lesson.content?.examples && lesson.content.examples.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-4">💡 Examples</h2>
                  <div className="space-y-4">
                    {lesson.content.examples.map((example, index) => (
                      <div
                        key={index}
                        className="bg-white/5 border border-white/10 rounded-xl p-6"
                      >
                        <h3 className="text-lg font-semibold text-primary mb-3">
                          Example {index + 1}
                        </h3>
                        <div className="text-gray-300">
                          <MathRenderer content={example} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video */}
              {lesson.videoUrl && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-4">🎥 Video Lesson</h2>
                  <div className="aspect-video bg-dark-200 rounded-xl flex items-center justify-center border border-white/10">
                    <PlayCircle className="h-16 w-16 text-primary" />
                    <p className="text-gray-400 ml-4">Video player coming soon</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Practice Problems */}
            {practices.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-dark-100/90 to-dark/90 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Target className="h-6 w-6 text-secondary" />
                    Practice Problems
                  </h2>
                  <span className="text-sm text-gray-400">
                    {currentPractice + 1} / {practices.length}
                  </span>
                </div>

                {practice && (
                  <div className="space-y-6">
                    {/* Question */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Question:</h3>
                      <div className="text-gray-300 text-lg">
                        <MathRenderer content={practice.question} />
                      </div>
                    </div>

                    {/* Answer Input */}
                    {!showSolution && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Your Answer:
                        </label>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmitPractice()}
                            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Enter your answer..."
                          />
                          <button
                            onClick={handleSubmitPractice}
                            disabled={!userAnswer.trim()}
                            className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50"
                          >
                            Submit
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Result */}
                    {showSolution && practiceResult && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`border rounded-xl p-6 ${
                          practiceResult.isCorrect
                            ? 'bg-green-500/10 border-green-500/30'
                            : 'bg-red-500/10 border-red-500/30'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          {practiceResult.isCorrect ? (
                            <>
                              <CheckCircle className="h-6 w-6 text-green-400" />
                              <span className="text-xl font-bold text-green-400">Correct!</span>
                            </>
                          ) : (
                            <>
                              <div className="h-6 w-6 rounded-full border-2 border-red-400 flex items-center justify-center">
                                <span className="text-red-400 text-sm">✕</span>
                              </div>
                              <span className="text-xl font-bold text-red-400">Incorrect</span>
                            </>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div>
                            <span className="text-gray-400">Your answer: </span>
                            <span className="text-white font-semibold">{userAnswer}</span>
                          </div>
                          {!practiceResult.isCorrect && (
                            <div>
                              <span className="text-gray-400">Correct answer: </span>
                              <span className="text-green-400 font-semibold">
                                {practiceResult.correctAnswer}
                              </span>
                            </div>
                          )}
                          {practiceResult.solution && (
                            <div className="mt-4 pt-4 border-t border-white/10">
                              <h4 className="text-white font-semibold mb-2">Solution:</h4>
                              <div className="text-gray-300">
                                <MathRenderer content={practiceResult.solution} />
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-4">
                      <button
                        onClick={handlePreviousPractice}
                        disabled={currentPractice === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Previous
                      </button>

                      {currentPractice < practices.length - 1 ? (
                        <button
                          onClick={handleNextPractice}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all"
                        >
                          Next
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={handleCompleteLesson}
                          disabled={completing}
                          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-50"
                        >
                          {completing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                              Completing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Complete Lesson
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Complete Lesson Button (if no practices) */}
            {practices.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <button
                  onClick={handleCompleteLesson}
                  disabled={completing}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {completing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      Complete Lesson
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-dark-100/90 to-dark/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sticky top-24">
              <h3 className="text-lg font-bold text-white mb-4">Lesson Progress</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Duration</span>
                  <span className="text-white font-semibold">{lesson.duration}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Practice Problems</span>
                  <span className="text-white font-semibold">{practices.length}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border border-primary/30">
                  <span className="text-gray-300">Points</span>
                  <span className="text-primary font-bold text-xl">
                    {practiceResult?.points || 0}
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                  <span className="text-white font-semibold">Pro Tip</span>
                </div>
                <p className="text-sm text-gray-300">
                  Complete all practice problems to master this concept and unlock the module quiz!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </TrialGuard>
  )
}
