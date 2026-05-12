const { db } = require('../database/db')
const Exam = require('../models/Exam')
const ExamAttempt = require('../models/ExamAttempt')

const generateId = () => Date.now().toString() + Math.random().toString(36).slice(2, 11)

// ─── Admin: CRUD ────────────────────────────────────────────────────────────

exports.getAllExams = async (req, res) => {
  try {
    await db.read()
    const exams = (db.data.exams || []).map(e => ({
      ...e,
      attemptCount: (db.data.examAttempts || []).filter(a => a.examId === e._id && a.status === 'submitted').length
    }))
    res.json({ success: true, exams })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getExam = async (req, res) => {
  try {
    await db.read()
    const exam = (db.data.exams || []).find(e => e._id === req.params.examId)
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' })
    res.json({ success: true, exam })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.createExam = async (req, res) => {
  try {
    await db.read()
    // Auto-calculate totalMarks from sections
    const sections = req.body.sections || []
    const totalMarks = sections.reduce((sum, s) => {
      return sum + (s.questions || []).length * (s.marksPerQuestion || 4)
    }, 0) || req.body.totalMarks || 100

    const exam = new Exam({ ...req.body, totalMarks })
    db.data.exams = db.data.exams || []
    db.data.exams.push(exam)
    await db.write()
    res.status(201).json({ success: true, exam })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.updateExam = async (req, res) => {
  try {
    await db.read()
    const idx = (db.data.exams || []).findIndex(e => e._id === req.params.examId)
    if (idx === -1) return res.status(404).json({ success: false, message: 'Exam not found' })

    const sections = req.body.sections || db.data.exams[idx].sections || []
    const totalMarks = sections.reduce((sum, s) => {
      return sum + (s.questions || []).length * (s.marksPerQuestion || 4)
    }, 0) || req.body.totalMarks || db.data.exams[idx].totalMarks

    db.data.exams[idx] = { ...db.data.exams[idx], ...req.body, totalMarks, updatedAt: new Date() }
    await db.write()
    res.json({ success: true, exam: db.data.exams[idx] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.deleteExam = async (req, res) => {
  try {
    await db.read()
    db.data.exams = (db.data.exams || []).filter(e => e._id !== req.params.examId)
    db.data.examAttempts = (db.data.examAttempts || []).filter(a => a.examId !== req.params.examId)
    await db.write()
    res.json({ success: true, message: 'Exam deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── Admin: Analytics ───────────────────────────────────────────────────────

exports.getExamAnalytics = async (req, res) => {
  try {
    await db.read()
    const { examId } = req.params
    const exam = (db.data.exams || []).find(e => e._id === examId)
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' })

    const attempts = (db.data.examAttempts || []).filter(a => a.examId === examId && a.status === 'submitted')
    const users = db.data.users || []

    if (attempts.length === 0) {
      return res.json({ success: true, analytics: { totalAttempts: 0, avgScore: 0, passRate: 0, toppers: [], scoreDistribution: [] } })
    }

    const scores = attempts.map(a => a.percentage)
    const avgScore = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
    const passCount = attempts.filter(a => a.passed).length
    const passRate = Math.round((passCount / attempts.length) * 100)

    // Score distribution buckets: 0-20, 21-40, 41-60, 61-80, 81-100
    const buckets = [0, 0, 0, 0, 0]
    scores.forEach(s => {
      if (s <= 20) buckets[0]++
      else if (s <= 40) buckets[1]++
      else if (s <= 60) buckets[2]++
      else if (s <= 80) buckets[3]++
      else buckets[4]++
    })

    const scoreDistribution = [
      { range: '0-20%', count: buckets[0] },
      { range: '21-40%', count: buckets[1] },
      { range: '41-60%', count: buckets[2] },
      { range: '61-80%', count: buckets[3] },
      { range: '81-100%', count: buckets[4] },
    ]

    // Top 5 scorers
    const toppers = attempts
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 5)
      .map(a => {
        const user = users.find(u => u._id === a.userId)
        return { name: user?.name || 'Unknown', score: a.totalScore, percentage: a.percentage, time: a.timeSpent }
      })

    // Section-wise analysis
    const sectionAnalysis = exam.sections.map(section => {
      const sectionScores = attempts.map(a => {
        const sr = a.sectionResults?.find(s => s.sectionId === section._id)
        return sr ? sr.percentage : 0
      })
      return {
        name: section.name,
        avgScore: sectionScores.length ? Math.round(sectionScores.reduce((s, v) => s + v, 0) / sectionScores.length) : 0
      }
    })

    res.json({
      success: true,
      analytics: {
        totalAttempts: attempts.length,
        avgScore,
        passRate,
        highestScore: Math.max(...scores),
        lowestScore: Math.min(...scores),
        toppers,
        scoreDistribution,
        sectionAnalysis
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── Student: Exam flow ──────────────────────────────────────────────────────

// Get published exams (student view — no answers)
exports.getPublishedExams = async (req, res) => {
  try {
    await db.read()
    const userId = req.user._id
    const now = new Date()

    const exams = (db.data.exams || [])
      .filter(e => {
        if (!e.isPublished) return false
        if (e.startDate && new Date(e.startDate) > now) return false
        if (e.endDate && new Date(e.endDate) < now) return false
        return true
      })
      .map(e => {
        const myAttempts = (db.data.examAttempts || []).filter(a => a.examId === e._id && a.userId === userId && a.status === 'submitted')
        const inProgress = (db.data.examAttempts || []).find(a => a.examId === e._id && a.userId === userId && a.status === 'in_progress')
        return {
          _id: e._id,
          title: e.title,
          description: e.description,
          duration: e.duration,
          totalMarks: e.totalMarks,
          passingMarks: e.passingMarks,
          negativeMarking: e.negativeMarking,
          negativeMarkValue: e.negativeMarkValue,
          sections: e.sections.map(s => ({ _id: s._id, name: s.name, questionCount: s.questions.length, marksPerQuestion: s.marksPerQuestion })),
          instructions: e.instructions,
          maxAttempts: e.maxAttempts,
          attemptCount: myAttempts.length,
          canAttempt: myAttempts.length < e.maxAttempts,
          inProgressAttemptId: inProgress?._id || null,
          bestScore: myAttempts.length ? Math.max(...myAttempts.map(a => a.percentage)) : null,
        }
      })

    res.json({ success: true, exams })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Start exam — creates attempt, returns exam with questions (no correct answers)
exports.startExam = async (req, res) => {
  try {
    await db.read()
    const { examId } = req.params
    const userId = req.user._id

    const exam = (db.data.exams || []).find(e => e._id === examId)
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' })
    if (!exam.isPublished) return res.status(403).json({ success: false, message: 'Exam not available' })

    // Check attempt limit
    const prevAttempts = (db.data.examAttempts || []).filter(a => a.examId === examId && a.userId === userId && a.status === 'submitted')
    if (prevAttempts.length >= exam.maxAttempts) {
      return res.status(403).json({ success: false, message: `Maximum ${exam.maxAttempts} attempt(s) allowed` })
    }

    // Check for existing in-progress attempt
    let attempt = (db.data.examAttempts || []).find(a => a.examId === examId && a.userId === userId && a.status === 'in_progress')
    if (!attempt) {
      attempt = new ExamAttempt({ examId, userId, courseId: exam.courseId })
      db.data.examAttempts = db.data.examAttempts || []
      db.data.examAttempts.push(attempt)
      await db.write()
    }

    // Return exam without correct answers
    const safeExam = {
      _id: exam._id,
      title: exam.title,
      description: exam.description,
      instructions: exam.instructions,
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      negativeMarking: exam.negativeMarking,
      negativeMarkValue: exam.negativeMarkValue,
      shuffleQuestions: exam.shuffleQuestions,
      shuffleOptions: exam.shuffleOptions,
      allowReview: exam.allowReview,
      sections: exam.sections.map(section => {
        let questions = section.questions.map(q => ({
          _id: q._id,
          question: q.question,
          type: q.type,
          options: q.options || [],
          marks: q.marks || section.marksPerQuestion || 4,
          negativeMarks: q.negativeMarks !== undefined ? q.negativeMarks : (exam.negativeMarkValue || 0),
          image: q.image || null,
          explanation: null  // hidden until after submission
        }))
        if (exam.shuffleQuestions) questions = shuffle(questions)
        return {
          _id: section._id,
          name: section.name,
          description: section.description || '',
          marksPerQuestion: section.marksPerQuestion || 4,
          questions
        }
      })
    }

    res.json({ success: true, exam: safeExam, attemptId: attempt._id, startedAt: attempt.startedAt })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Save answer (auto-save)
exports.saveAnswer = async (req, res) => {
  try {
    await db.read()
    const { attemptId } = req.params
    const { questionKey, answer, markedForReview } = req.body

    const idx = (db.data.examAttempts || []).findIndex(a => a._id === attemptId && a.userId === req.user._id)
    if (idx === -1) return res.status(404).json({ success: false, message: 'Attempt not found' })
    if (db.data.examAttempts[idx].status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Exam already submitted' })
    }

    db.data.examAttempts[idx].answers[questionKey] = {
      answer,
      markedForReview: markedForReview || false,
      answeredAt: new Date()
    }
    await db.write()
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Submit exam
exports.submitExam = async (req, res) => {
  try {
    await db.read()
    const { attemptId } = req.params
    const { timeSpent, submittedBy } = req.body

    const attemptIdx = (db.data.examAttempts || []).findIndex(a => a._id === attemptId && a.userId === req.user._id)
    if (attemptIdx === -1) return res.status(404).json({ success: false, message: 'Attempt not found' })

    const attempt = db.data.examAttempts[attemptIdx]
    if (attempt.status !== 'in_progress') {
      // Already submitted — return cached result
      return res.json({ success: true, result: attempt })
    }

    const exam = (db.data.exams || []).find(e => e._id === attempt.examId)
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' })

    // ── Evaluate ──────────────────────────────────────────────────────────
    let totalScore = 0
    const sectionResults = []

    for (const section of exam.sections) {
      let sectionScore = 0
      let correct = 0, wrong = 0, unattempted = 0
      const questionResults = []

      for (const q of section.questions) {
        const key = `${section._id}_${q._id}`
        const userEntry = attempt.answers[key]
        const userAnswer = userEntry?.answer

        const marksForCorrect = q.marks || section.marksPerQuestion || 4
        const marksForWrong = exam.negativeMarking ? (q.negativeMarks !== undefined ? q.negativeMarks : exam.negativeMarkValue || 0.25) : 0

        let isCorrect = false
        let awarded = 0

        if (userAnswer === undefined || userAnswer === null || userAnswer === '') {
          unattempted++
        } else {
          // Compare: MCQ uses index, others use string
          if (q.type === 'mcq') {
            isCorrect = parseInt(userAnswer) === parseInt(q.correctAnswer)
          } else {
            isCorrect = String(userAnswer).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()
          }

          if (isCorrect) {
            correct++
            awarded = marksForCorrect
          } else {
            wrong++
            awarded = -marksForWrong
          }
        }

        sectionScore += awarded
        questionResults.push({
          questionId: q._id,
          question: q.question,
          type: q.type,
          options: q.options,
          userAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect,
          awarded,
          explanation: q.explanation || ''
        })
      }

      sectionScore = Math.max(0, sectionScore)  // floor at 0
      const sectionTotal = section.questions.reduce((s, q) => s + (q.marks || section.marksPerQuestion || 4), 0)
      totalScore += sectionScore

      sectionResults.push({
        sectionId: section._id,
        name: section.name,
        score: Math.round(sectionScore * 100) / 100,
        totalMarks: sectionTotal,
        percentage: sectionTotal > 0 ? Math.round((sectionScore / sectionTotal) * 100) : 0,
        correct,
        wrong,
        unattempted,
        questionResults
      })
    }

    totalScore = Math.round(totalScore * 100) / 100
    const percentage = exam.totalMarks > 0 ? Math.round((totalScore / exam.totalMarks) * 100) : 0
    const passed = totalScore >= exam.passingMarks

    // Compute rank among all submitted attempts
    const allSubmitted = (db.data.examAttempts || []).filter(a => a.examId === exam._id && a.status === 'submitted')
    const rank = allSubmitted.filter(a => a.totalScore > totalScore).length + 1

    // Update attempt
    db.data.examAttempts[attemptIdx] = {
      ...attempt,
      status: 'submitted',
      submittedAt: new Date(),
      submittedBy: submittedBy || 'user',
      timeSpent: timeSpent || 0,
      sectionResults,
      totalScore,
      totalMarks: exam.totalMarks,
      percentage,
      passed,
      rank
    }
    await db.write()

    res.json({ success: true, result: db.data.examAttempts[attemptIdx] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get attempt result
exports.getAttemptResult = async (req, res) => {
  try {
    await db.read()
    const attempt = (db.data.examAttempts || []).find(a => a._id === req.params.attemptId && a.userId === req.user._id)
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' })
    if (attempt.status !== 'submitted') return res.status(400).json({ success: false, message: 'Exam not yet submitted' })

    const exam = (db.data.exams || []).find(e => e._id === attempt.examId)
    res.json({ success: true, attempt, exam: exam ? { title: exam.title, totalMarks: exam.totalMarks, passingMarks: exam.passingMarks } : null })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get my attempts for an exam
exports.getMyAttempts = async (req, res) => {
  try {
    await db.read()
    const attempts = (db.data.examAttempts || [])
      .filter(a => a.examId === req.params.examId && a.userId === req.user._id && a.status === 'submitted')
      .map(a => ({ _id: a._id, totalScore: a.totalScore, percentage: a.percentage, passed: a.passed, submittedAt: a.submittedAt, timeSpent: a.timeSpent, rank: a.rank }))
    res.json({ success: true, attempts })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
