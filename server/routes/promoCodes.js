const express = require('express')
const router = express.Router()
const { db } = require('../database/db')

const generateId = () => Date.now().toString() + Math.random().toString(36).slice(2, 11)

const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) return next()
  res.status(403).json({ success: false, message: 'Admin access required' })
}

// GET /api/admin/promo-codes — admin list
router.get('/', isAdmin, async (req, res) => {
  try {
    await db.read()
    db.data.promoCodes = db.data.promoCodes || []
    const promoCodes = db.data.promoCodes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    res.json({ success: true, promoCodes })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/admin/promo-codes — create
router.post('/', isAdmin, async (req, res) => {
  try {
    await db.read()
    db.data.promoCodes = db.data.promoCodes || []
    const { code, discountPercent, expiryDate, usageLimit, active, assignedTo } = req.body
    if (!code || !discountPercent || !expiryDate) {
      return res.status(400).json({ message: 'Code, discountPercent, and expiryDate are required' })
    }
    // Check duplicate
    const exists = db.data.promoCodes.find(p => p.code.toUpperCase() === code.toUpperCase())
    if (exists) return res.status(400).json({ message: 'Promo code already exists' })

    const promoCode = {
      _id: generateId(),
      code: code.toUpperCase().trim(),
      discountPercent: Number(discountPercent),
      expiryDate: new Date(expiryDate).toISOString(),
      usageLimit: usageLimit ? Number(usageLimit) : null,
      usedCount: 0,
      active: active !== false,
      assignedTo: assignedTo || '',
      createdAt: new Date().toISOString(),
    }
    db.data.promoCodes.push(promoCode)
    await db.write()
    res.status(201).json({ success: true, promoCode })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// PUT /api/admin/promo-codes/:id — update
router.put('/:id', isAdmin, async (req, res) => {
  try {
    await db.read()
    db.data.promoCodes = db.data.promoCodes || []
    const idx = db.data.promoCodes.findIndex(p => p._id === req.params.id)
    if (idx === -1) return res.status(404).json({ message: 'Promo code not found' })
    const { code, discountPercent, expiryDate, usageLimit, active, assignedTo } = req.body
    db.data.promoCodes[idx] = {
      ...db.data.promoCodes[idx],
      code: code ? code.toUpperCase().trim() : db.data.promoCodes[idx].code,
      discountPercent: discountPercent !== undefined ? Number(discountPercent) : db.data.promoCodes[idx].discountPercent,
      expiryDate: expiryDate ? new Date(expiryDate).toISOString() : db.data.promoCodes[idx].expiryDate,
      usageLimit: usageLimit !== undefined ? (usageLimit ? Number(usageLimit) : null) : db.data.promoCodes[idx].usageLimit,
      active: active !== undefined ? active : db.data.promoCodes[idx].active,
      assignedTo: assignedTo !== undefined ? assignedTo : db.data.promoCodes[idx].assignedTo,
      updatedAt: new Date().toISOString(),
    }
    await db.write()
    res.json({ success: true, promoCode: db.data.promoCodes[idx] })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// DELETE /api/admin/promo-codes/:id
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    await db.read()
    db.data.promoCodes = db.data.promoCodes || []
    const before = db.data.promoCodes.length
    db.data.promoCodes = db.data.promoCodes.filter(p => p._id !== req.params.id)
    if (db.data.promoCodes.length === before) return res.status(404).json({ message: 'Promo code not found' })
    await db.write()
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// PATCH /api/admin/promo-codes/:id/toggle
router.patch('/:id/toggle', isAdmin, async (req, res) => {
  try {
    await db.read()
    db.data.promoCodes = db.data.promoCodes || []
    const idx = db.data.promoCodes.findIndex(p => p._id === req.params.id)
    if (idx === -1) return res.status(404).json({ message: 'Promo code not found' })
    db.data.promoCodes[idx].active = !db.data.promoCodes[idx].active
    db.data.promoCodes[idx].updatedAt = new Date().toISOString()
    await db.write()
    res.json({ success: true, promoCode: db.data.promoCodes[idx] })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/promo-codes/validate — public (requires auth), validate a code at checkout
router.post('/validate', async (req, res) => {
  try {
    const { code, amount } = req.body
    if (!code) return res.status(400).json({ message: 'Promo code is required' })
    await db.read()
    db.data.promoCodes = db.data.promoCodes || []
    const promo = db.data.promoCodes.find(p => p.code === code.toUpperCase().trim())
    if (!promo) return res.status(404).json({ success: false, message: 'Invalid promo code' })
    if (promo.active === false) return res.status(400).json({ success: false, message: 'This promo code is inactive' })
    if (promo.expiryDate && new Date(promo.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: 'This promo code has expired' })
    }
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return res.status(400).json({ success: false, message: 'This promo code has reached its usage limit' })
    }
    const originalAmount = Number(amount) || 0
    const discountAmount = Math.round((originalAmount * promo.discountPercent) / 100)
    const finalAmount = Math.max(0, originalAmount - discountAmount)
    res.json({
      success: true,
      promoCode: promo.code,
      discountPercent: promo.discountPercent,
      discountAmount,
      originalAmount,
      finalAmount,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/promo-codes/apply — record usage after successful payment
router.post('/apply', async (req, res) => {
  try {
    const { code } = req.body
    if (!code) return res.status(400).json({ message: 'Code required' })
    await db.read()
    db.data.promoCodes = db.data.promoCodes || []
    const idx = db.data.promoCodes.findIndex(p => p.code === code.toUpperCase().trim())
    if (idx === -1) return res.status(404).json({ message: 'Promo code not found' })
    db.data.promoCodes[idx].usedCount = (db.data.promoCodes[idx].usedCount || 0) + 1
    await db.write()
    res.json({ success: true, usedCount: db.data.promoCodes[idx].usedCount })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
