const jwt = require('jsonwebtoken')
const { db, models } = require('../database/db')

exports.protectPromoter = async (req, res, next) => {
  try {
    let token
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Promoter login required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'beyond-classroom-fallback-secret-change-in-production')
    if (decoded.type !== 'promoter') {
      return res.status(401).json({ success: false, message: 'Invalid promoter token' })
    }

    req.promoter = await models.promoters.findOne({ _id: decoded.id }).lean()
    
    if (!req.promoter && db.data.promoters) {
      req.promoter = db.data.promoters.find((p) => p._id === decoded.id)
    }

    if (!req.promoter) {
      return res.status(401).json({ success: false, message: 'Promoter not found' })
    }
    if (req.promoter.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Promoter account suspended' })
    }
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Not authorized' })
  }
}
