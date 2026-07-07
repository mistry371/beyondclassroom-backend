const express = require('express')
const router = express.Router()
const { db, models } = require('../database/db')
const { protect } = require('../middleware/auth')

const generateId = () => Date.now().toString() + Math.random().toString(36).slice(2, 11)

// Middleware: admin check (req.user already set by protect in server-simple.js)
const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) return next()
  res.status(403).json({ success: false, message: 'Admin access required' })
}

// GET /api/packages — public, returns active packages ordered by sortOrder
router.get('/', async (req, res) => {
  try {
    const packages = await models.packages.find({ active: { $ne: false } }).sort({ sortOrder: 1 }).lean()
    res.json({ success: true, packages })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/admin/packages — admin, returns all packages
router.get('/admin', protect, isAdmin, async (req, res) => {
  try {
    const packages = await models.packages.find().sort({ sortOrder: 1 }).lean()
    res.json({ success: true, packages })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/packages/:id - public, returns single package
router.get('/:id', async (req, res) => {
  try {
    const pkg = await models.packages.findById(req.params.id).lean()
    if (!pkg || pkg.active === false) {
      return res.status(404).json({ message: 'Package not found' })
    }

    if (req.query.populate === 'true' && pkg.courseIds && pkg.courseIds.length > 0) {
      // Fetch all courses for this package
      const courses = await models.courses.find({ _id: { $in: pkg.courseIds } }).lean()
      
      // Fetch all modules for these courses
      const modules = await models.modules.find({ courseId: { $in: pkg.courseIds } }).lean()
      const moduleIds = modules.map(m => m._id)
      
      // Fetch all lessons for these modules
      const lessons = moduleIds.length > 0 
        ? await models.lessons.find({ moduleId: { $in: moduleIds } }).lean() 
        : []
      const lessonIds = lessons.map(l => l._id)

      // Fetch all subtopics for these modules/lessons
      const subtopics = (moduleIds.length > 0 || lessonIds.length > 0)
        ? await models.subtopics.find({
            $or: [
              { moduleId: { $in: moduleIds } },
              { lessonId: { $in: lessonIds } }
            ]
          }).lean()
        : []

      // Map subtopics to lessons
      const mappedLessons = lessons.map(l => ({
        ...l,
        subtopics: subtopics.filter(st => st.lessonId === l._id)
      }))

      // Map lessons and remaining subtopics to modules
      const mappedModules = modules.map(m => ({
        ...m,
        lessons: mappedLessons.filter(l => l.moduleId === m._id),
        subtopics: subtopics.filter(st => st.moduleId === m._id && !st.lessonId)
      }))

      // Map modules to courses
      pkg.courses = courses.map(c => ({
        ...c,
        modules: mappedModules.filter(m => m.courseId === c._id)
      }))
    }

    res.json({ success: true, package: pkg })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/admin/packages — create
router.post('/admin', protect, isAdmin, async (req, res) => {
  try {
    const { name, description, features, priceINR, priceUSD, validity, image, active, popular, courseIds, customRequestLimit, customRequestMaxMarks } = req.body
    if (!name || priceINR === undefined) {
      return res.status(400).json({ message: 'Name and priceINR are required' })
    }
    
    const count = await models.packages.countDocuments()
    
    const pkg = {
      _id: generateId(),
      name,
      description: description || '',
      features: Array.isArray(features) ? features : [],
      priceINR: Number(priceINR) || 0,
      priceUSD: Number(priceUSD) || 0,
      validity: validity || '',
      image: image || '',
      active: active !== false,
      popular: popular || false,
      courseIds: Array.isArray(courseIds) ? courseIds : [],
      customRequestLimit: customRequestLimit !== undefined ? Number(customRequestLimit) : 0,
      customRequestMaxMarks: customRequestMaxMarks !== undefined ? Number(customRequestMaxMarks) : 0,
      sortOrder: count,
      createdAt: new Date(),
    }
    
    await models.packages.create(pkg)
    if (db.data.packages) db.data.packages.push(pkg)
    res.status(201).json({ success: true, package: pkg })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// PUT /api/admin/packages/:id — update
router.put('/admin/:id', protect, isAdmin, async (req, res) => {
  try {
    const { name, description, features, priceINR, priceUSD, validity, image, active, popular, courseIds, customRequestLimit, customRequestMaxMarks } = req.body
    
    const updates = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (Array.isArray(features)) updates.features = features
    if (priceINR !== undefined) updates.priceINR = Number(priceINR)
    if (priceUSD !== undefined) updates.priceUSD = Number(priceUSD)
    if (validity !== undefined) updates.validity = validity
    if (image !== undefined) updates.image = image
    if (active !== undefined) updates.active = active
    if (popular !== undefined) updates.popular = popular
    if (Array.isArray(courseIds)) updates.courseIds = courseIds
    if (customRequestLimit !== undefined) updates.customRequestLimit = Number(customRequestLimit)
    if (customRequestMaxMarks !== undefined) updates.customRequestMaxMarks = Number(customRequestMaxMarks)
    updates.updatedAt = new Date()

    const pkg = await models.packages.findOneAndUpdate(
      { _id: req.params.id },
      { $set: updates },
      { new: true }
    ).lean()

    if (!pkg) return res.status(404).json({ message: 'Package not found' })
    
    if (db.data.packages) {
      const idx = db.data.packages.findIndex(p => p._id === req.params.id)
      if (idx !== -1) Object.assign(db.data.packages[idx], updates)
    }

    res.json({ success: true, package: pkg })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// DELETE /api/admin/packages/:id
router.delete('/admin/:id', protect, isAdmin, async (req, res) => {
  try {
    const result = await models.packages.deleteOne({ _id: req.params.id })
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Package not found' })
    
    if (db.data.packages) {
      db.data.packages = db.data.packages.filter(p => p._id !== req.params.id)
    }

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// PATCH /api/admin/packages/:id/toggle — toggle active
router.patch('/admin/:id/toggle', protect, isAdmin, async (req, res) => {
  try {
    const pkg = await models.packages.findById(req.params.id)
    if (!pkg) return res.status(404).json({ message: 'Package not found' })
    
    pkg.active = !pkg.active
    pkg.updatedAt = new Date()
    await pkg.save()
    
    if (db.data.packages) {
      const idx = db.data.packages.findIndex(p => p._id === req.params.id)
      if (idx !== -1) {
        db.data.packages[idx].active = pkg.active
        db.data.packages[idx].updatedAt = pkg.updatedAt
      }
    }

    res.json({ success: true, package: pkg })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// PATCH /api/admin/packages/:id/reorder — move up or down
router.patch('/admin/:id/reorder', protect, isAdmin, async (req, res) => {
  try {
    const { direction } = req.body // 'up' | 'down'
    const sorted = await models.packages.find().sort({ sortOrder: 1 })
    const idx = sorted.findIndex(p => p._id === req.params.id)
    
    if (idx === -1) return res.status(404).json({ message: 'Package not found' })
    
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return res.json({ success: true, packages: sorted })
    
    // Swap sortOrder values
    const tempOrder = sorted[idx].sortOrder
    
    await models.packages.updateOne({ _id: sorted[idx]._id }, { $set: { sortOrder: sorted[swapIdx].sortOrder } })
    await models.packages.updateOne({ _id: sorted[swapIdx]._id }, { $set: { sortOrder: tempOrder } })
    
    if (db.data.packages) {
      const p1 = db.data.packages.find(p => p._id === sorted[idx]._id)
      const p2 = db.data.packages.find(p => p._id === sorted[swapIdx]._id)
      if (p1 && p2) {
        p1.sortOrder = sorted[swapIdx].sortOrder
        p2.sortOrder = tempOrder
      }
    }

    const newSorted = await models.packages.find().sort({ sortOrder: 1 })
    res.json({ success: true, packages: newSorted })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router

