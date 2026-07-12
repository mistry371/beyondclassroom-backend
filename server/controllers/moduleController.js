const { db, models } = require('../database/db')
const Module = require('../models/Module')

// Get all modules (for admin)
exports.getAllModules = async (req, res) => {
  try {
    const modules = await models.modules.find().sort({ order: 1 }).lean()
    res.json({ success: true, modules })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get all modules for a course
exports.getModulesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params
    // Frontend navigates with composite "courseId_packageId" ids, but modules
    // are stored under the base course id. Strip the package suffix before querying.
    const baseCourseId = courseId.includes('_') ? courseId.split('_')[0] : courseId

    let modules = await models.modules.find({ courseId: baseCourseId }).sort({ order: 1 }).lean()
    
    const moduleIds = modules.map(m => m._id)
    
    const lessons = await models.lessons.find({ moduleId: { $in: moduleIds } }).lean()
    const quizzes = await models.quizzes.find({ moduleId: { $in: moduleIds } }).lean()
    const allSubtopics = await models.subtopics.find({ moduleId: { $in: moduleIds } }).select({ 'documents.data': 0, 'document.data': 0 }).lean()
    
    const { previewableSubtopicIds } = require('../utils/contentAccess')
    let isAuthorized = false;
    if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
      isAuthorized = true;
    } else if (req.user && req.user.purchasedCourses && req.user.purchasedCourses.some(id => (id.includes('_') ? id.split('_')[0] : id) === baseCourseId)) {
      isAuthorized = true;
    }

    // Populate lesson count and lessons for each module
    modules = modules.map(m => {
      let modLessons = lessons.filter(l => l.moduleId === m._id) || []
      let quiz = quizzes.find(q => q.moduleId === m._id) || null
      let directSubtopics = allSubtopics.filter(s => s.moduleId === m._id && (!s.lessonId || String(s.lessonId).trim() === ''))

      // ALWAYS strip massive base64 data payloads (viewer fetches per-doc)
      directSubtopics = directSubtopics.map(subtopic => {
        if (subtopic.documents) {
          subtopic.documents = subtopic.documents.map(({ data, ...doc }) => doc);
        }
        if (subtopic.document) {
          const { data, ...doc } = subtopic.document;
          subtopic.document = doc;
        }
        return subtopic;
      });

      // Preview mode (#1): unauthorized viewers can still SEE the structure and
      // documents; only premium extras (videos, quiz answers) are withheld.
      if (!isAuthorized) {
        modLessons = modLessons.map(({ videoUrl, ...rest }) => ({ ...rest, previewOnly: true }));
        if (quiz && quiz.questions) {
          quiz.questions = quiz.questions.map(({ correctAnswer, explanation, ...rest }) => rest);
        }
        directSubtopics = directSubtopics.map(subtopic => ({ ...subtopic, previewOnly: true }));
      }

      return { ...m, lessons: modLessons, lessonCount: modLessons.length, quiz, directSubtopics }
    })
    
    res.json({
      success: true,
      modules
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get single module
exports.getModule = async (req, res) => {
  try {
    const { moduleId } = req.params
    
    const module = await models.modules.findOne({ _id: moduleId }).lean()
    
    if (!module) {
      return res.status(404).json({ success: false, message: 'Module not found' })
    }
    
    res.json({ success: true, module })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Create module
exports.createModule = async (req, res) => {
  try {
    const newModuleData = { ...req.body }
    if (!newModuleData._id) {
      newModuleData._id = Date.now().toString() + Math.random().toString(36).slice(2, 11)
    }
    
    const newModule = await models.modules.create(newModuleData)
    
    if (db.data.modules) {
      db.data.modules.push(newModule)
    }
    
    res.status(201).json({ success: true, module: newModule })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Update module
exports.updateModule = async (req, res) => {
  try {
    const { moduleId } = req.params
    
    const updated = await models.modules.findOneAndUpdate(
      { _id: moduleId },
      { $set: { ...req.body, updatedAt: new Date().toISOString() } },
      { new: true }
    ).lean()
    
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Module not found' })
    }
    
    if (db.data.modules) {
      const index = db.data.modules.findIndex(m => m._id === moduleId)
      if (index !== -1) Object.assign(db.data.modules[index], updated)
    }
    
    res.json({ success: true, module: updated })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Delete module
exports.deleteModule = async (req, res) => {
  try {
    const { moduleId } = req.params
    
    await models.modules.deleteOne({ _id: moduleId })
    
    if (db.data.modules) {
      db.data.modules = db.data.modules.filter(m => m._id !== moduleId)
    }
    
    res.json({ success: true, message: 'Module deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
