const { db } = require('../database/db')
const Setting = require('../models/Setting')
const { logActivity } = require('./adminController')

// Get all settings
exports.getAllSettings = async (req, res) => {
  try {
    await db.read()
    const { category } = req.query
    
    let settings = db.data.settings || []
    
    if (category) {
      settings = settings.filter(s => s.category === category)
    }
    
    res.json({ success: true, settings })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Update setting
exports.updateSetting = async (req, res) => {
  try {
    await db.read()
    
    const { key, value } = req.body
    const settingIndex = db.data.settings?.findIndex(s => s.key === key)
    
    if (settingIndex === -1) {
      // Create new setting
      const newSetting = new Setting({
        ...req.body,
        updatedBy: req.user._id
      })
      
      db.data.settings = db.data.settings || []
      db.data.settings.push(newSetting)
    } else {
      // Update existing
      db.data.settings[settingIndex] = {
        ...db.data.settings[settingIndex],
        value,
        updatedAt: new Date(),
        updatedBy: req.user._id
      }
    }
    
    await db.write()
    
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
    await db.read()
    const { settings } = req.body
    
    db.data.settings = db.data.settings || []
    
    settings.forEach(({ key, value }) => {
      const index = db.data.settings.findIndex(s => s.key === key)
      if (index !== -1) {
        db.data.settings[index].value = value
        db.data.settings[index].updatedAt = new Date()
        db.data.settings[index].updatedBy = req.user._id
      }
    })
    
    await db.write()
    
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
