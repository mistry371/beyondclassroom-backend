const { db, models } = require('../database/db')
const zoomService = require('../services/zoomService')

exports.getAllClasses = async (req, res) => {
  try {
    const liveClasses = await models.liveClasses.find().lean()
    res.json({ success: true, liveClasses })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

exports.createClass = async (req, res) => {
  try {
    const { title, instructor, date, time, duration, topic, zoomLink, maxStudents } = req.body

    // Auto-create Zoom meeting if no manual link provided
    let finalZoomLink = zoomLink || ''
    let zoomMeetingId = null
    let zoomPassword = null
    let zoomStartUrl = null
    let zoomStatus = 'manual'

    if (!zoomLink) {
      const zoom = await zoomService.createMeeting({ title, date, time, duration, topic })
      if (zoom.success) {
        finalZoomLink = zoom.zoomLink
        zoomMeetingId = zoom.meetingId
        zoomPassword = zoom.password
        zoomStartUrl = zoom.startUrl
        zoomStatus = 'auto'
      } else {
        zoomStatus = 'failed'
        console.log('Zoom auto-create skipped:', zoom.message)
      }
    }

    const newClass = {
      _id: Date.now().toString() + Math.random().toString(36).slice(2, 9),
      title, instructor, date, time,
      duration: duration || '60 min',
      topic: topic || '',
      zoomLink: finalZoomLink,
      zoomMeetingId,
      zoomPassword,
      zoomStartUrl,
      zoomStatus,
      maxStudents: maxStudents || 30,
      enrolled: 0,
      status: 'upcoming',
      createdAt: new Date().toISOString()
    }
    
    await models.liveClasses.create(newClass)
    
    if (db.data.liveClasses) {
      db.data.liveClasses.push(newClass)
    }
    
    res.status(201).json({ success: true, liveClass: newClass, zoomStatus })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

exports.updateClass = async (req, res) => {
  try {
    const updatedClass = await models.liveClasses.findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    ).lean()
    
    if (!updatedClass) {
      return res.status(404).json({ message: 'Class not found' })
    }
    
    if (db.data.liveClasses) {
      const idx = db.data.liveClasses.findIndex(c => c._id === req.params.id)
      if (idx !== -1) {
        Object.assign(db.data.liveClasses[idx], req.body)
      }
    }
    
    res.json({ success: true, liveClass: updatedClass })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}

exports.deleteClass = async (req, res) => {
  try {
    const cls = await models.liveClasses.findOne({ _id: req.params.id }).lean()
    if (!cls) {
      return res.status(404).json({ message: 'Class not found' })
    }
    
    if (cls.zoomMeetingId) {
      await zoomService.deleteMeeting(cls.zoomMeetingId)
    }
    
    await models.liveClasses.deleteOne({ _id: req.params.id })
    
    if (db.data.liveClasses) {
      db.data.liveClasses = db.data.liveClasses.filter(c => c._id !== req.params.id)
    }
    
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ message: 'Server error' })
  }
}
