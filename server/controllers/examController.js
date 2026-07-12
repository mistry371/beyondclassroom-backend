const { models } = require('../database/db')

const generateId = () => Date.now().toString() + Math.random().toString(36).slice(2, 11)

const computeTotals = (sections = []) => {
  let totalMarks = 0
  for (const s of sections) {
    for (const q of (s.questions || [])) {
      totalMarks += Number(q.marks || s.marksPerQuestion || 0)
    }
  }
  return totalMarks
}

// GET /api/exams/admin/all
exports.adminGetAll = async (req, res) => {
  try {
    const exams = await models.exams.find().sort({ createdAt: -1 }).lean()
    res.json({ success: true, exams })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET /api/exams/published (for students)
exports.listPublished = async (req, res) => {
  try {
    const exams = await models.exams.find({ isPublished: true }).sort({ createdAt: -1 }).lean()
    res.json({ success: true, exams })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// POST /api/exams/admin
exports.create = async (req, res) => {
  try {
    const b = req.body || {}
    if (!b.title) return res.status(400).json({ success: false, message: 'Exam title is required' })
    const sections = Array.isArray(b.sections) ? b.sections : []
    const exam = {
      _id: generateId(),
      title: b.title,
      description: b.description || '',
      courseId: b.courseId || null,
      sections,
      isPublished: !!b.isPublished,
      startDate: b.startDate || null,
      endDate: b.endDate || null,
      duration: b.duration != null ? Number(b.duration) : 0,
      totalMarks: b.totalMarks != null ? Number(b.totalMarks) : computeTotals(sections),
      passingMarks: b.passingMarks != null ? Number(b.passingMarks) : 0,
      createdAt: new Date().toISOString(),
    }
    await models.exams.create(exam)
    res.status(201).json({ success: true, exam })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// PUT /api/exams/admin/:id
exports.update = async (req, res) => {
  try {
    const b = req.body || {}
    const updates = { updatedAt: new Date().toISOString() }
    for (const f of ['title', 'description', 'courseId', 'isPublished', 'startDate', 'endDate']) {
      if (b[f] !== undefined) updates[f] = b[f]
    }
    if (b.sections !== undefined) {
      updates.sections = Array.isArray(b.sections) ? b.sections : []
      updates.totalMarks = b.totalMarks != null ? Number(b.totalMarks) : computeTotals(updates.sections)
    }
    if (b.duration !== undefined) updates.duration = Number(b.duration)
    if (b.passingMarks !== undefined) updates.passingMarks = Number(b.passingMarks)

    const exam = await models.exams.findOneAndUpdate({ _id: req.params.id }, { $set: updates }, { new: true }).lean()
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' })
    res.json({ success: true, exam })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// DELETE /api/exams/admin/:id
exports.remove = async (req, res) => {
  try {
    const result = await models.exams.deleteOne({ _id: req.params.id })
    if (result.deletedCount === 0) return res.status(404).json({ success: false, message: 'Exam not found' })
    res.json({ success: true, message: 'Exam deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// GET /api/exams/admin/:examId/analytics
exports.analytics = async (req, res) => {
  try {
    const exam = await models.exams.findOne({ _id: req.params.examId }).lean()
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' })

    const attempts = await models.examAttempts.find({ examId: req.params.examId, status: { $ne: 'in_progress' } }).lean()
    const totalMarks = exam.totalMarks || computeTotals(exam.sections) || 1
    const passingMarks = exam.passingMarks || 0

    const totalAttempts = attempts.length
    if (totalAttempts === 0) {
      return res.json({ success: true, analytics: { totalAttempts: 0, avgScore: 0, passRate: 0, highestScore: 0, scoreDistribution: [], sectionAnalysis: [], toppers: [] } })
    }

    const pct = (score) => Math.round(((score || 0) / totalMarks) * 100)
    const percentages = attempts.map((a) => pct(a.score))
    const avgScore = Math.round(percentages.reduce((s, x) => s + x, 0) / totalAttempts)
    const highestScore = Math.max(...percentages)
    const passRate = Math.round((attempts.filter((a) => (a.score || 0) >= passingMarks).length / totalAttempts) * 100)

    // Score distribution buckets
    const buckets = [
      { range: '0-20', min: 0, max: 20, count: 0 },
      { range: '21-40', min: 21, max: 40, count: 0 },
      { range: '41-60', min: 41, max: 60, count: 0 },
      { range: '61-80', min: 61, max: 80, count: 0 },
      { range: '81-100', min: 81, max: 100, count: 0 },
    ]
    for (const p of percentages) {
      const b = buckets.find((b) => p >= b.min && p <= b.max) || buckets[buckets.length - 1]
      b.count++
    }
    const scoreDistribution = buckets.map(({ range, count }) => ({ range, count }))

    // Section-wise average (from attempt.answers[].sectionName if present, else overall)
    const sectionAnalysis = (exam.sections || []).map((s) => {
      const scores = attempts
        .map((a) => (a.sectionScores || {})[s._id] ?? (a.sectionScores || {})[s.name])
        .filter((v) => v != null)
      const avg = scores.length ? Math.round(scores.reduce((x, y) => x + y, 0) / scores.length) : avgScore
      return { name: s.name || 'Section', avgScore: avg }
    })

    // Toppers
    const toppers = attempts
      .map((a) => ({ name: a.userName || 'Student', percentage: pct(a.score), time: a.timeTaken || 0 }))
      .sort((x, y) => y.percentage - x.percentage)
      .slice(0, 5)

    res.json({ success: true, analytics: { totalAttempts, avgScore, passRate, highestScore, scoreDistribution, sectionAnalysis, toppers } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
