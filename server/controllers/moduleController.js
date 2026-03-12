const { db } = require('../database/db')
const Module = require('../models/Module')

// Get all modules for a course
exports.getModulesByCourse = async (req, res) => {
  try {
    await db.read()
    const { courseId } = req.params
    
    const modules = db.data.modules?.filter(m => m.courseId === courseId) || []
    
    res.json({
      success: true,
      modules: modules.sort((a, b) => a.order - b.order)
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Get single module
exports.getModule = async (req, res) => {
  try {
    await db.read()
    const { moduleId } = req.params
    
    const module = db.data.modules?.find(m => m._id === moduleId)
    
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
    await db.read()
    
    const newModule = new Module(req.body)
    
    db.data.modules = db.data.modules || []
    db.data.modules.push(newModule)
    
    await db.write()
    
    res.status(201).json({ success: true, module: newModule })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Update module
exports.updateModule = async (req, res) => {
  try {
    await db.read()
    const { moduleId } = req.params
    
    const index = db.data.modules?.findIndex(m => m._id === moduleId)
    
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Module not found' })
    }
    
    db.data.modules[index] = { ...db.data.modules[index], ...req.body, updatedAt: new Date() }
    
    await db.write()
    
    res.json({ success: true, module: db.data.modules[index] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Delete module
exports.deleteModule = async (req, res) => {
  try {
    await db.read()
    const { moduleId } = req.params
    
    db.data.modules = db.data.modules?.filter(m => m._id !== moduleId) || []
    
    await db.write()
    
    res.json({ success: true, message: 'Module deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
