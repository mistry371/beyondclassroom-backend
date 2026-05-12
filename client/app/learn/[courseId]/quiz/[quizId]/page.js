'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Award, Clock, CheckCircle, XCircle, ArrowLeft, Trophy, Target } from 'lucide-react'
import Navbar from '@/components/Navbar'
import MathRenderer from '@/components/MathRenderer'
import TrialGuard from '@/components/TrialGuard'
import api from '@/utils/api'
import { motion, AnimatePresence } from 'framer-motion'

export default function QuizPage() {
  const params = useParams()
  const router = useRouter()
  const [quiz, setQuiz] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(null)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchQuiz()
  }, [params.quizId])

  useEffect(() => {
    if (quizStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [quizStarted, timeLeft, handleSubmitQuiz])

  const fetchQuiz = async () => {
    try {
      const res = await api.get(`/quizzes/${params.quizId}`)
      setQuiz(res.data.quiz)
      setTimeLeft(res.data.quiz.timeLimit * 60) // Convert minutes to seconds
    } catch (error) {
      console.error('Failed to fetch quiz:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartQuiz = () => {
    setQuizStarted(true)
  }

  const handleAnswerSelect = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }))
  }

  const handleSubmitQuiz = useCallback(async () => {
    setSubmitting(true)
    try {
      const answerArray = quiz.questions.map((_, index) => answers[index] || '')
      const res = await api.post(`/quizzes/${params.quizId}/submit`, {
        answers: answerArray
      })

      setResult(res.data)
      setQuizCompleted(true)

      // Update progress
      await api.put(`/progress/course/${params.courseId}/quiz/${params.quizId}`, {
        score: res.data.percentage
      })
    } catch (error) {
      console.error('Failed to submit quiz:', error)
    } finally {
      setSubmitting(false)
    }
  }, [quiz, answers, params.quizId, params.courseId])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-dark-100 to-dark flex items-center justify-center">
        <Navbar />
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-dark-100 to-dark">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-white text-xl">Quiz not found</p>
        </div>
      </div>
    )
  }

  // Quiz Start Screen
  if (!quizStarted) {
    return (
      <TrialGuard courseId={params.courseId}>
      <div className="min-h-screen bg-gradient-to-br from-dark via-dark-100 to-dark">
        <Navbar />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <button
            onClick={() => router.push(`/learn/${params.courseId}`)}
            className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Course
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-dark-100/90 to-dark/90 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="h-10 w-10 text-white" />
            </div>

            <h1 className="text-4xl font-bold text-white mb-4">{quiz.title}</h1>
            <p className="text-gray-300 text-lg mb-8">{quiz.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/5 rounded-xl p-6">
                <Target className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-2">{quiz.questions?.length}</div>
                <div className="text-gray-400">Questions</div>
              </div>

              <div className="bg-white/5 rounded-xl p-6">
                <Clock className="h-8 w-8 text-secondary mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-2">{quiz.timeLimit}</div>
                <div className="text-gray-400">Minutes</div>
              </div>

              <div className="bg-white/5 rounded-xl p-6">
                <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-2">{quiz.passingScore}%</div>
                <div className="text-gray-400">To Pass</div>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8 text-left">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <span>📋</span> Instructions:
              </h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Answer all questions to the best of your ability</li>
                <li>• You have {quiz.timeLimit} minutes to complete the quiz</li>
                <li>• You need {quiz.passingScore}% to pass</li>
                <li>• Once submitted, you cannot change your answers</li>
                <li>• Make sure you have a stable internet connection</li>
              </ul>
            </div>

            <button
              onClick={handleStartQuiz}
              className="px-12 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-all"
            >
              Start Quiz
            </button>
          </motion.div>
        </div>
      </div>
      </TrialGuard>
    )
  }

  // Quiz Result Screen
  if (quizCompleted && result) {
    const passed = result.passed
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-dark-100 to-dark">
        <Navbar />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-dark-100/90 to-dark/90 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center mb-8"
          >
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
              passed 
                ? 'bg-green-500/20 border-4 border-green-500'
                : 'bg-red-500/20 border-4 border-red-500'
            }`}>
              {passed ? (
                <Trophy className="h-12 w-12 text-green-400" />
              ) : (
                <XCircle className="h-12 w-12 text-red-400" />
              )}
            </div>

            <h1 className={`text-5xl font-bold mb-4 ${
              passed ? 'text-green-400' : 'text-red-400'
            }`}>
              {passed ? 'Congratulations!' : 'Keep Trying!'}
            </h1>
            
            <p className="text-gray-300 text-xl mb-8">
              {passed 
                ? 'You have successfully passed the quiz!'
                : 'You need more practice. Review the lessons and try again.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/5 rounded-xl p-6">
                <div className="text-5xl font-bold text-primary mb-2">{result.percentage}%</div>
                <div className="text-gray-400">Your Score</div>
              </div>

              <div className="bg-white/5 rounded-xl p-6">
                <div className="text-5xl font-bold text-white mb-2">
                  {result.score}/{result.totalPoints}
                </div>
                <div className="text-gray-400">Points</div>
              </div>

              <div className="bg-white/5 rounded-xl p-6">
                <div className="text-5xl font-bold text-secondary mb-2">
                  {result.results.filter(r => r.isCorrect).length}/{result.results.length}
                </div>
                <div className="text-gray-400">Correct</div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push(`/learn/${params.courseId}`)}
                className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:opacity-90 transition-all"
              >
                Back to Course
              </button>
              {!passed && (
                <button
                  onClick={() => window.location.reload()}
                  className="px-8 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  Retry Quiz
                </button>
              )}
            </div>
          </motion.div>

          {/* Detailed Results */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-dark-100/90 to-dark/90 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Detailed Results</h2>
            
            <div className="space-y-6">
              {result.results.map((item, index) => (
                <div
                  key={index}
                  className={`border rounded-xl p-6 ${
                    item.isCorrect
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {item.isCorrect ? (
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-400" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-3">Question {index + 1}</h3>
                      <div className="text-gray-300 mb-4">
                        <MathRenderer content={item.question} />
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <span className="text-gray-400">Your answer: </span>
                          <span className={item.isCorrect ? 'text-green-400' : 'text-red-400'}>
                            {item.userAnswer || 'Not answered'}
                          </span>
                        </div>
                        
                        {!item.isCorrect && (
                          <div>
                            <span className="text-gray-400">Correct answer: </span>
                            <span className="text-green-400">{item.correctAnswer}</span>
                          </div>
                        )}
                        
                        {item.explanation && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <span className="text-gray-400 block mb-2">Explanation:</span>
                            <div className="text-gray-300">
                              <MathRenderer content={item.explanation} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  // Quiz Taking Screen
  const question = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-100 to-dark">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quiz Header */}
        <div className="bg-gradient-to-br from-dark-100/90 to-dark/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{quiz.title}</h2>
              <p className="text-gray-400">Question {currentQuestion + 1} of {quiz.questions.length}</p>
            </div>
            
            <div className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xl ${
              timeLeft < 60 ? 'bg-red-500/20 text-red-400' : 'bg-primary/20 text-primary'
            }`}>
              <Clock className="h-6 w-6" />
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-dark-200 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-primary to-secondary"
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-gradient-to-br from-dark-100/90 to-dark/90 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
          >
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4">Question:</h3>
              <div className="text-gray-300 text-lg">
                <MathRenderer content={question.question} />
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuestion, option)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    answers[currentQuestion] === option
                      ? 'bg-primary/20 border-primary text-white'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestion] === option
                        ? 'border-primary bg-primary'
                        : 'border-gray-500'
                    }`}>
                      {answers[currentQuestion] === option && (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="flex-1">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
              <button
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                className="px-6 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentQuestion < quiz.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:opacity-90 transition-all"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={submitting}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white inline-block mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Quiz'
                  )}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Answer Summary */}
        <div className="mt-6 bg-gradient-to-br from-dark-100/90 to-dark/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h3 className="text-white font-semibold mb-4">Answer Summary</h3>
          <div className="flex flex-wrap gap-2">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                  currentQuestion === index
                    ? 'bg-primary text-white'
                    : answers[index]
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/5 text-gray-400 border border-white/10'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-400 mt-4">
            {Object.keys(answers).length} of {quiz.questions.length} questions answered
          </p>
        </div>
      </div>
    </div>
  )
}
