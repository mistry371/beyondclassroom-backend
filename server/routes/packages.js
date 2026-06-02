const express = require('express')
const router = express.Router()
const { db } = require('../database/db')

const generateId = () => Date.now().toString() + Math.random().toString(36).slice(2, 11)

// Middleware: admin check (req.user already set by protect in server-simple.js)
const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) return next()
  res.status(403).json({ success: false, message: 'Admin access required' })
}

// GET /api/packages — public, returns active packages ordered by sortOrder
router.get('/', async (req, res) => {
  try {
    await db.read()
    db.data.packages = db.data.packages || []
    const packages = db.data.packages
      .filter(p => p.active !== false)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    res.json({ success: true, packages })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// GET /api/admin/packages — admin, returns all packages
router.get('/admin', isAdmin, async (req, res) => {
  try {
    await db.read()
    db.data.packages = db.data.packages || []
    const packages = db.data.packages.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    res.json({ success: true, packages })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/admin/packages — create
router.post('/admin', isAdmin, async (req, res) => {
  try {
    await db.read()
    db.data.packages = db.data.packages || []
    const { name, description, features, priceINR, priceUSD, validity, image, active, popular } = req.body
    if (!name || priceINR === undefined) {
      return res.status(400).json({ message: 'Name and priceINR are required' })
    }
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
      sortOrder: db.data.packages.length,
      createdAt: new Date().toISOString(),
    }
    db.data.packages.push(pkg)
    await db.write()
    res.status(201).json({ success: true, package: pkg })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// PUT /api/admin/packages/:id — update
router.put('/admin/:id', isAdmin, async (req, res) => {
  try {
    await db.read()
    db.data.packages = db.data.packages || []
    const idx = db.data.packages.findIndex(p => p._id === req.params.id)
    if (idx === -1) return res.status(404).json({ message: 'Package not found' })
    const { name, description, features, priceINR, priceUSD, validity, image, active, popular } = req.body
    db.data.packages[idx] = {
      ...db.data.packages[idx],
      name: name ?? db.data.packages[idx].name,
      description: description ?? db.data.packages[idx].description,
      features: Array.isArray(features) ? features : db.data.packages[idx].features,
      priceINR: priceINR !== undefined ? Number(priceINR) : db.data.packages[idx].priceINR,
      priceUSD: priceUSD !== undefined ? Number(priceUSD) : db.data.packages[idx].priceUSD,
      validity: validity ?? db.data.packages[idx].validity,
      image: image ?? db.data.packages[idx].image,
      active: active !== undefined ? active : db.data.packages[idx].active,
      popular: popular !== undefined ? popular : db.data.packages[idx].popular,
      updatedAt: new Date().toISOString(),
    }
    await db.write()
    res.json({ success: true, package: db.data.packages[idx] })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// DELETE /api/admin/packages/:id
router.delete('/admin/:id', isAdmin, async (req, res) => {
  try {
    await db.read()
    db.data.packages = db.data.packages || []
    const before = db.data.packages.length
    db.data.packages = db.data.packages.filter(p => p._id !== req.params.id)
    if (db.data.packages.length === before) return res.status(404).json({ message: 'Package not found' })
    await db.write()
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// PATCH /api/admin/packages/:id/toggle — toggle active
router.patch('/admin/:id/toggle', isAdmin, async (req, res) => {
  try {
    await db.read()
    db.data.packages = db.data.packages || []
    const idx = db.data.packages.findIndex(p => p._id === req.params.id)
    if (idx === -1) return res.status(404).json({ message: 'Package not found' })
    db.data.packages[idx].active = !db.data.packages[idx].active
    db.data.packages[idx].updatedAt = new Date().toISOString()
    await db.write()
    res.json({ success: true, package: db.data.packages[idx] })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// PATCH /api/admin/packages/:id/reorder — move up or down
router.patch('/admin/:id/reorder', isAdmin, async (req, res) => {
  try {
    await db.read()
    db.data.packages = db.data.packages || []
    const { direction } = req.body // 'up' | 'down'
    const sorted = db.data.packages.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    const idx = sorted.findIndex(p => p._id === req.params.id)
    if (idx === -1) return res.status(404).json({ message: 'Package not found' })
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= sorted.length) return res.json({ success: true, packages: sorted })
    // Swap sortOrder values
    const tempOrder = sorted[idx].sortOrder
    sorted[idx].sortOrder = sorted[swapIdx].sortOrder
    sorted[swapIdx].sortOrder = tempOrder
    await db.write()
    res.json({ success: true, packages: sorted })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
