const express = require('express')
const router = express.Router()
const { db, models } = require('../database/db')
const { protect, admin } = require('../middleware/auth')

const generateId = () => Date.now().toString() + Math.random().toString(36).slice(2, 11)

// GET /api/admin/promo-codes — admin list
router.get('/', protect, admin, async (req, res) => {
  try {
    const promoCodes = await models.promoCodes.find().sort({ createdAt: -1 }).lean()
    res.json({ success: true, promoCodes })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/admin/promo-codes — create
router.post('/', protect, admin, async (req, res) => {
  try {
    const { code, discountPercent, expiryDate, usageLimit, active, assignedTo } = req.body
    if (!code || !discountPercent || !expiryDate) {
      return res.status(400).json({ message: 'Code, discountPercent, and expiryDate are required' })
    }
    // Check duplicate
    const exists = await models.promoCodes.findOne({ code: code.toUpperCase() }).lean()
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
    
    await models.promoCodes.create(promoCode)
    if (db.data.promoCodes) db.data.promoCodes.push(promoCode)
    
    res.status(201).json({ success: true, promoCode })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// PUT /api/admin/promo-codes/:id — update
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const idx = await models.promoCodes.findOne({ _id: req.params.id }).lean()
    if (!idx) return res.status(404).json({ message: 'Promo code not found' })
    
    const { code, discountPercent, expiryDate, usageLimit, active, assignedTo } = req.body
    
    const updated = await models.promoCodes.findOneAndUpdate(
      { _id: req.params.id },
      { $set: {
        code: code ? code.toUpperCase().trim() : idx.code,
        discountPercent: discountPercent !== undefined ? Number(discountPercent) : idx.discountPercent,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : idx.expiryDate,
        usageLimit: usageLimit !== undefined ? (usageLimit ? Number(usageLimit) : null) : idx.usageLimit,
        active: active !== undefined ? active : idx.active,
        assignedTo: assignedTo !== undefined ? assignedTo : idx.assignedTo,
        updatedAt: new Date().toISOString(),
      }},
      { new: true }
    ).lean()
    
    if (db.data.promoCodes) {
      const pIdx = db.data.promoCodes.findIndex(p => p._id === req.params.id)
      if (pIdx !== -1) Object.assign(db.data.promoCodes[pIdx], updated)
    }
    
    res.json({ success: true, promoCode: updated })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// DELETE /api/admin/promo-codes/:id
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const result = await models.promoCodes.deleteOne({ _id: req.params.id })
    if (result.deletedCount === 0) return res.status(404).json({ message: 'Promo code not found' })
    
    if (db.data.promoCodes) {
      db.data.promoCodes = db.data.promoCodes.filter(p => p._id !== req.params.id)
    }
    
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// PATCH /api/admin/promo-codes/:id/toggle
router.patch('/:id/toggle', protect, admin, async (req, res) => {
  try {
    const promo = await models.promoCodes.findOne({ _id: req.params.id }).lean()
    if (!promo) return res.status(404).json({ message: 'Promo code not found' })
    
    const updated = await models.promoCodes.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { active: !promo.active, updatedAt: new Date().toISOString() } },
      { new: true }
    ).lean()
    
    if (db.data.promoCodes) {
      const pIdx = db.data.promoCodes.findIndex(p => p._id === req.params.id)
      if (pIdx !== -1) Object.assign(db.data.promoCodes[pIdx], updated)
    }
    
    res.json({ success: true, promoCode: updated })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/promo-codes/validate — public (requires auth), validate a code at checkout
router.post('/validate', protect, async (req, res) => {
  try {
    const { code, amount } = req.body
    if (!code) return res.status(400).json({ message: 'Promo code is required' })
    
    const promo = await models.promoCodes.findOne({ code: code.toUpperCase().trim() }).lean()
    
    if (!promo) return res.status(404).json({ success: false, message: 'Invalid promo code' })
    if (promo.active === false) return res.status(400).json({ success: false, message: 'This promo code is inactive' })
    if (promo.expiryDate && new Date(promo.expiryDate) < new Date()) {
      return res.status(400).json({ success: false, message: 'This promo code has expired' })
    }
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return res.status(400).json({ success: false, message: 'This promo code has reached its usage limit' })
    }
    
    const originalAmount = Number(amount) || 0
    const rawDiscount = (originalAmount * promo.discountPercent) / 100
    const discountAmount = Number(rawDiscount.toFixed(2))
    const finalAmount = Number(Math.max(0, originalAmount - discountAmount).toFixed(2))
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
router.post('/apply', protect, async (req, res) => {
  try {
    const { code } = req.body
    if (!code) return res.status(400).json({ message: 'Code required' })
    
    const promo = await models.promoCodes.findOne({ code: code.toUpperCase().trim() }).lean()
    if (!promo) return res.status(404).json({ message: 'Promo code not found' })
    
    const updated = await models.promoCodes.findOneAndUpdate(
      { _id: promo._id },
      { $inc: { usedCount: 1 } },
      { new: true }
    ).lean()
    
    if (db.data.promoCodes) {
      const idx = db.data.promoCodes.findIndex(p => p._id === promo._id)
      if (idx !== -1) db.data.promoCodes[idx].usedCount = updated.usedCount
    }
    
    res.json({ success: true, usedCount: updated.usedCount })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
