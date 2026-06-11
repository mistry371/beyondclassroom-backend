const { db, models } = require('../database/db')

const generateId = () => Date.now().toString() + Math.random().toString(36).slice(2, 11)

// ─── Admin: CRUD ────────────────────────────────────────────────────────────

exports.getAllExams = async (req, res) => {
  try {
    const exams = await models.exams.find().lean()
    
    const examIds = exams.map(e => e._id)
    
    // Aggregation to get attempt counts
    const counts = await models.examAttempts.aggregate([
      { $match: { examId: { $in: examIds }, status: 'submitted' } },
      { $group: { _id: "$examId", count: { $sum: 1 } } }
    ])
    
    const countMap = {}
    counts.forEach(c => countMap[c._id] = c.count)
    
    const populated = exams.map(e => ({
      ...e,
      attemptCount: countMap[e._id] || 0
    }))
    
    res.json({ success: true, exams: populated })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.getExam = async (req, res) => {
  try {
    const exam = await models.exams.findOne({ _id: req.params.examId }).lean()
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' })
    res.json({ success: true, exam })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.createExam = async (req, res) => {
  try {
    // Auto-calculate totalMarks from sections
    const sections = req.body.sections || []
    const totalMarks = sections.reduce((sum, s) => {
      return sum + (s.questions || []).length * (s.marksPerQuestion || 4)
    }, 0) || req.body.totalMarks || 100

    const exam = { 
      _id: generateId(),
      ...req.body, 
      totalMarks,
      createdAt: new Date().toISOString()
    }
    
    await models.exams.create(exam)
    if (db.data.exams) db.data.exams.push(exam)
    
    res.status(201).json({ success: true, exam })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.updateExam = async (req, res) => {
  try {
    const oldExam = await models.exams.findOne({ _id: req.params.examId }).lean()
    if (!oldExam) return res.status(404).json({ success: false, message: 'Exam not found' })

    const sections = req.body.sections || oldExam.sections || []
    const totalMarks = sections.reduce((sum, s) => {
      return sum + (s.questions || []).length * (s.marksPerQuestion || 4)
    }, 0) || req.body.totalMarks || oldExam.totalMarks

    const updated = await models.exams.findOneAndUpdate(
      { _id: req.params.examId },
      { $set: { ...req.body, totalMarks, updatedAt: new Date() } },
      { new: true }
    ).lean()
    
    if (db.data.exams) {
      const idx = db.data.exams.findIndex(e => e._id === req.params.examId)
      if (idx !== -1) Object.assign(db.data.exams[idx], updated)
    }
    
    res.json({ success: true, exam: updated })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

exports.deleteExam = async (req, res) => {
  try {
    await models.exams.deleteOne({ _id: req.params.examId })
    await models.examAttempts.deleteMany({ examId: req.params.examId })
    
    if (db.data.exams) {
      db.data.exams = db.data.exams.filter(e => e._id !== req.params.examId)
    }
    if (db.data.examAttempts) {
      db.data.examAttempts = db.data.examAttempts.filter(a => a.examId !== req.params.examId)
    }
    
    res.json({ success: true, message: 'Exam deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─── Admin: Analytics ───────────────────────────────────────────────────────

exports.getExamAnalytics = async (req, res) => {
  try {
    const { examId } = req.params
    const exam = await models.exams.findOne({ _id: examId }).lean()
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' })

    const attempts = await models.examAttempts.find({ examId, status: 'submitted' }).lean()
    
    const userIds = [...new Set(attempts.map(a => a.userId).filter(Boolean))]
    const users = await models.users.find({ _id: { $in: userIds } }).select('name _id').lean()

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
    const sectionAnalysis = (exam.sections || []).map(section => {
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
    const userId = req.user._id
    const now = new Date()

    const allExams = await models.exams.find({ isPublished: true }).lean()
    
    const exams = allExams.filter(e => {
      if (e.startDate && new Date(e.startDate) > now) return false
      if (e.endDate && new Date(e.endDate) < now) return false
      return true
    })
    
    const examIds = exams.map(e => e._id)
    
    const userAttempts = await models.examAttempts.find({ 
      examId: { $in: examIds }, 
      userId 
    }).lean()

    const populated = exams.map(e => {
      const myAttempts = userAttempts.filter(a => a.examId === e._id && a.status === 'submitted')
      const inProgress = userAttempts.find(a => a.examId === e._id && a.status === 'in_progress')
      return {
        _id: e._id,
        title: e.title,
        description: e.description,
        duration: e.duration,
        totalMarks: e.totalMarks,
        passingMarks: e.passingMarks,
        negativeMarking: e.negativeMarking,
        negativeMarkValue: e.negativeMarkValue,
        sections: (e.sections || []).map(s => ({ _id: s._id, name: s.name, questionCount: (s.questions || []).length, marksPerQuestion: s.marksPerQuestion })),
        instructions: e.instructions,
        maxAttempts: e.maxAttempts,
        attemptCount: myAttempts.length,
        canAttempt: myAttempts.length < e.maxAttempts,
        inProgressAttemptId: inProgress?._id || null,
        bestScore: myAttempts.length ? Math.max(...myAttempts.map(a => a.percentage)) : null,
      }
    })

    res.json({ success: true, exams: populated })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Start exam — creates attempt, returns exam with questions (no correct answers)
exports.startExam = async (req, res) => {
  try {
    const { examId } = req.params
    const userId = req.user._id

    const exam = await models.exams.findOne({ _id: examId }).lean()
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' })
    if (!exam.isPublished) return res.status(403).json({ success: false, message: 'Exam not available' })

    // Check attempt limit
    const prevAttempts = await models.examAttempts.find({ examId, userId, status: 'submitted' }).lean()
    if (prevAttempts.length >= exam.maxAttempts) {
      return res.status(403).json({ success: false, message: `Maximum ${exam.maxAttempts} attempt(s) allowed` })
    }

    // Check for existing in-progress attempt
    let attempt = await models.examAttempts.findOne({ examId, userId, status: 'in_progress' }).lean()
    
    if (!attempt) {
      attempt = {
        _id: generateId(),
        examId, 
        userId, 
        courseId: exam.courseId,
        status: 'in_progress',
        answers: {},
        startedAt: new Date().toISOString()
      }
      await models.examAttempts.create(attempt)
      if (db.data.examAttempts) db.data.examAttempts.push(attempt)
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
      sections: (exam.sections || []).map(section => {
        let questions = (section.questions || []).map(q => ({
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
    const { attemptId } = req.params
    const { questionKey, answer, markedForReview } = req.body

    const attempt = await models.examAttempts.findOne({ _id: attemptId, userId: req.user._id }).lean()
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' })
    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Exam already submitted' })
    }

    const setKey = `answers.${questionKey}`
    await models.examAttempts.updateOne(
      { _id: attemptId },
      { $set: { 
        [setKey]: {
          answer,
          markedForReview: markedForReview || false,
          answeredAt: new Date().toISOString()
        }
      }}
    )

    if (db.data.examAttempts) {
      const idx = db.data.examAttempts.findIndex(a => a._id === attemptId)
      if (idx !== -1) {
        db.data.examAttempts[idx].answers = db.data.examAttempts[idx].answers || {}
        db.data.examAttempts[idx].answers[questionKey] = {
          answer,
          markedForReview: markedForReview || false,
          answeredAt: new Date().toISOString()
        }
      }
    }
    
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Submit exam
exports.submitExam = async (req, res) => {
  try {
    const { attemptId } = req.params
    const { timeSpent, submittedBy } = req.body

    const attempt = await models.examAttempts.findOne({ _id: attemptId, userId: req.user._id }).lean()
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' })

    if (attempt.status !== 'in_progress') {
      // Already submitted — return cached result
      return res.json({ success: true, result: attempt })
    }

    const exam = await models.exams.findOne({ _id: attempt.examId }).lean()
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' })

    // ── Evaluate ──────────────────────────────────────────────────────────
    let totalScore = 0
    const sectionResults = []

    for (const section of (exam.sections || [])) {
      let sectionScore = 0
      let correct = 0, wrong = 0, unattempted = 0
      const questionResults = []

      for (const q of (section.questions || [])) {
        const key = `${section._id}_${q._id}`
        const userEntry = (attempt.answers || {})[key]
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
      const sectionTotal = (section.questions || []).reduce((s, q) => s + (q.marks || section.marksPerQuestion || 4), 0)
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
    const allSubmitted = await models.examAttempts.find({ examId: exam._id, status: 'submitted' }).lean()
    const rank = allSubmitted.filter(a => a.totalScore > totalScore).length + 1

    // Update attempt
    const updated = await models.examAttempts.findOneAndUpdate(
      { _id: attemptId },
      { $set: {
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        submittedBy: submittedBy || 'user',
        timeSpent: timeSpent || 0,
        sectionResults,
        totalScore,
        totalMarks: exam.totalMarks,
        percentage,
        passed,
        rank
      }},
      { new: true }
    ).lean()

    if (db.data.examAttempts) {
      const idx = db.data.examAttempts.findIndex(a => a._id === attemptId)
      if (idx !== -1) Object.assign(db.data.examAttempts[idx], updated)
    }

    res.json({ success: true, result: updated })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get attempt result
exports.getAttemptResult = async (req, res) => {
  try {
    const attempt = await models.examAttempts.findOne({ _id: req.params.attemptId, userId: req.user._id }).lean()
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' })
    if (attempt.status !== 'submitted') return res.status(400).json({ success: false, message: 'Exam not yet submitted' })

    const exam = await models.exams.findOne({ _id: attempt.examId }).lean()
    res.json({ success: true, attempt, exam: exam ? { title: exam.title, totalMarks: exam.totalMarks, passingMarks: exam.passingMarks } : null })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get my attempts for an exam
exports.getMyAttempts = async (req, res) => {
  try {
    const attempts = await models.examAttempts.find({ 
      examId: req.params.examId, 
      userId: req.user._id, 
      status: 'submitted' 
    }).lean()
    
    const mapped = attempts.map(a => ({ 
      _id: a._id, 
      totalScore: a.totalScore, 
      percentage: a.percentage, 
      passed: a.passed, 
      submittedAt: a.submittedAt, 
      timeSpent: a.timeSpent, 
      rank: a.rank 
    }))
    res.json({ success: true, attempts: mapped })
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
