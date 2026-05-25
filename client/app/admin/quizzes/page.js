'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { ClipboardList, Plus, Edit, Trash2, ArrowLeft, Clock, Target } from 'lucide-react'
import api from '@/utils/api'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminQuizzes() {
  const router = useRouter()
  const { user } = useSelector(state => state.auth)
  const [quizzes, setQuizzes] = useState([])
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedModule, setSelectedModule] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    moduleId: '',
    timeLimit: 30,
    passingScore: 70,
    questions: [],
    isPublished: true
  })
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    type: 'mcq',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1
  })

  useEffect(() => {
    fetchModules()
  }, [user])

  useEffect(() => {
    if (selectedModule) {
      fetchQuizzes()
    }
  }, [selectedModule])

  const fetchModules = async () => {
    try {
      const res = await api.get('/modules')
      setModules(res.data.modules || [])
      if (res.data.modules?.length > 0) {
        setSelectedModule(res.data.modules[0]._id)
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuizzes = async () => {
    try {
      const res = await api.get(`/quizzes/module/${selectedModule}`)
      setQuizzes(res.data.quizzes || [])
    } catch (error) {
      console.error('Failed to fetch quizzes:', error)
    }
  }

  const handleCreate = () => {
    setSelectedQuiz(null)
    setFormData({
      title: '',
      description: '',
      moduleId: selectedModule,
      timeLimit: 30,
      passingScore: 70,
      questions: [],
      isPublished: true
    })
    setShowModal(true)
  }

  const handleEdit = (quiz) => {
    setSelectedQuiz(quiz)
    setFormData({
      title: quiz.title,
      description: quiz.description,
      moduleId: quiz.moduleId,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      questions: quiz.questions || [],
      isPublished: quiz.isPublished !== false
    })
    setShowModal(true)
  }

  const addQuestion = () => {
    if (!currentQuestion.question || !currentQuestion.correctAnswer) {
      alert('Please fill question and correct answer')
      return
    }
    setFormData({
      ...formData,
      questions: [...formData.questions, { ...currentQuestion }]
    })
    setCurrentQuestion({
      question: '',
      type: 'mcq',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 1
    })
  }

  const removeQuestion = (index) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.questions.length === 0) {
      alert('Please add at least one question')
      return
    }
    try {
      if (selectedQuiz) {
        await api.put(`/quizzes/${selectedQuiz._id}`, formData)
      } else {
        await api.post('/quizzes', formData)
      }
      setShowModal(false)
      fetchQuizzes()
    } catch (error) {
      alert(error.response?.data?.message || 'Operation failed')
    }
  }

  const handleDelete = async (quizId) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return
    
    try {
      await api.delete(`/quizzes/${quizId}`)
      fetchQuizzes()
    } catch (error) {
      alert(error.response?.data?.message || 'Delete failed')
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
      <div className="bg-gradient-to-r from-dark-100 via-dark-100 to-dark-100 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/admin')} className="p-2 hover:bg-dark-200 rounded-lg transition-all">
                <ArrowLeft className="h-5 w-5 text-gray-400" />
              </button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Quiz Management
                </h1>
                <p className="text-gray-400 mt-1">{quizzes.length} quizzes in selected module</p>
              </div>
            </div>
            <button
              onClick={handleCreate}
              disabled={!selectedModule}
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Create Quiz
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <label className="block text-gray-300 text-sm font-medium mb-2">Select Module</label>
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="w-full px-4 py-3 bg-dark-100 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
          >
            {modules.map(module => (
              <option key={module._id} value={module._id}>{module.title}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          {quizzes.length === 0 ? (
            <div className="text-center py-20 bg-dark-100/50 rounded-2xl border border-white/10">
              <ClipboardList className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-xl">No quizzes found</p>
              <p className="text-gray-500 mt-2">Create your first quiz to get started</p>
            </div>
          ) : (
            quizzes.map((quiz, index) => (
              <motion.div
                key={quiz._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-dark-100/80 to-dark/80 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{quiz.title}</h3>
                    <p className="text-gray-400 text-sm">{quiz.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    quiz.isPublished !== false
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {quiz.isPublished !== false ? 'Published' : 'Draft'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {quiz.timeLimit} min
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    {quiz.passingScore}% to pass
                  </span>
                  <span>•</span>
                  <span>{quiz.questions?.length || 0} questions</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(quiz)}
                    className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-all text-sm flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(quiz._id)}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-dark-100 rounded-2xl border border-white/10 p-6 max-w-4xl w-full my-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                {selectedQuiz ? 'Edit Quiz' : 'Create Quiz'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Quiz Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    rows="3"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Time Limit (minutes)</label>
                    <input
                      type="number"
                      value={formData.timeLimit}
                      onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Passing Score (%)</label>
                    <input
                      type="number"
                      value={formData.passingScore}
                      onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-lg font-bold text-white mb-4">Questions ({formData.questions.length})</h3>
                  
                  <div className="space-y-4 mb-4">
                    {formData.questions.map((q, index) => (
                      <div key={index} className="bg-dark-200/50 p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-white font-medium">{index + 1}. {q.question}</p>
                          <button
                            type="button"
                            onClick={() => removeQuestion(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <p className="text-sm text-gray-400">
                          Correct: {typeof q.correctAnswer === 'number' && q.options?.[q.correctAnswer]
                            ? `Option ${q.correctAnswer + 1}: ${q.options[q.correctAnswer]}`
                            : q.correctAnswer}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-dark-200/30 p-4 rounded-lg space-y-3">
                    <input
                      type="text"
                      value={currentQuestion.question}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                      placeholder="Question text"
                      className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    />
                    <select
                      value={currentQuestion.type}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value })}
                      className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                    >
                      <option value="mcq">Multiple Choice</option>
                      <option value="numeric">Numeric Answer</option>
                      <option value="true_false">True/False</option>
                    </select>
                    {currentQuestion.type === 'mcq' && (
                      <div className="grid grid-cols-2 gap-2">
                        {currentQuestion.options.map((opt, i) => (
                          <input
                            key={i}
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...currentQuestion.options]
                              newOpts[i] = e.target.value
                              setCurrentQuestion({ ...currentQuestion, options: newOpts })
                            }}
                            placeholder={`Option ${i + 1}`}
                            className="px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                          />
                        ))}
                      </div>
                    )}
                    {currentQuestion.type === 'mcq' ? (
                      <select
                        value={currentQuestion.correctAnswer}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                      >
                        <option value="">Select correct answer</option>
                        {currentQuestion.options.map((opt, i) => opt && (
                          <option key={i} value={i}>Option {i + 1}: {opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={currentQuestion.correctAnswer}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })}
                        placeholder="Correct answer"
                        className="w-full px-4 py-2 bg-dark-200 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary"
                      />
                    )}
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="w-full px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-all"
                    >
                      Add Question
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <label className="text-gray-300">Publish quiz</label>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-dark-200 text-white rounded-lg hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:opacity-90 transition-all"
                  >
                    {selectedQuiz ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
