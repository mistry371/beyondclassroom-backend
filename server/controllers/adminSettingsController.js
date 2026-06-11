const { db, models } = require('../database/db')
const { logActivity } = require('./adminController')

// Get all settings
exports.getAllSettings = async (req, res) => {
  try {
    const { category } = req.query
    
    let query = {}
    if (category) {
      query.category = category
    }
    
    const settings = await models.settings.find(query).lean()
    
    res.json({ success: true, settings })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Update setting
exports.updateSetting = async (req, res) => {
  try {
    const { key, value } = req.body
    
    const updated = await models.settings.findOneAndUpdate(
      { key },
      { $set: { ...req.body, updatedBy: req.user._id, updatedAt: new Date() } },
      { new: true, upsert: true }
    ).lean()
    
    if (db.data.settings) {
      const settingIndex = db.data.settings.findIndex(s => s.key === key)
      if (settingIndex === -1) {
        db.data.settings.push(updated)
      } else {
        Object.assign(db.data.settings[settingIndex], updated)
      }
    }
    
    await logActivity(
      req.user._id,
      req.user.name,
      'update',
      'settings',
      `Updated setting: ${key}`,
      { key, value }
    )
    
    res.json({ success: true, message: 'Setting updated successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Bulk update settings
exports.bulkUpdateSettings = async (req, res) => {
  try {
    const { settings } = req.body
    
    const bulkOps = settings.map(({ key, value }) => ({
      updateOne: {
        filter: { key },
        update: { $set: { value, updatedBy: req.user._id, updatedAt: new Date() } },
        upsert: true
      }
    }))
    
    await models.settings.bulkWrite(bulkOps)
    
    if (db.data.settings) {
      settings.forEach(({ key, value }) => {
        const index = db.data.settings.findIndex(s => s.key === key)
        if (index !== -1) {
          db.data.settings[index].value = value
          db.data.settings[index].updatedAt = new Date()
          db.data.settings[index].updatedBy = req.user._id
        }
      })
    }
    
    await logActivity(
      req.user._id,
      req.user.name,
      'bulk_update',
      'settings',
      `Updated ${settings.length} settings`,
      { count: settings.length }
    )
    
    res.json({ success: true, message: 'Settings updated successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}
