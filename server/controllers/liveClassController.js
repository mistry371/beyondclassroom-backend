const { models } = require('../database/db');
const zoomService = require('../services/zoomService');

// Public/user-facing: get live classes with purchase-based filtering
exports.getLiveClasses = async (req, res) => {
  try {
    const user = await models.users.findOne({ _id: req.user._id }).lean();
    const purchased = user?.purchasedCourses || [];
    let liveClasses = await models.liveClasses.find().lean();

    // Admin sees all classes
    if (user?.role === 'admin' || user?.role === 'super_admin') {
      return res.json({ success: true, liveClasses });
    }

    // Students only see classes if they have at least one purchased course
    if (purchased.length === 0) {
      return res.json({ success: true, liveClasses: [], locked: true, message: 'Purchase a course to access live classes' });
    }

    // Filter live classes to only those for courses the user has purchased (or general classes without a courseId)
    liveClasses = liveClasses.filter(lc => !lc.courseId || purchased.includes(lc.courseId));

    res.json({ success: true, liveClasses, locked: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: get all classes (no filtering)
exports.getAllClasses = async (req, res) => {
  try {
    const liveClasses = await models.liveClasses.find().lean();
    res.json({ success: true, liveClasses });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createClass = async (req, res) => {
  try {
    const { title, instructor, date, time, duration, topic, zoomLink, maxStudents } = req.body;

    // Auto-create Zoom meeting if no manual link provided
    let finalZoomLink = zoomLink || '';
    let zoomMeetingId = null;
    let zoomPassword = null;
    let zoomStartUrl = null;
    let zoomStatus = 'manual';

    if (!zoomLink) {
      const zoom = await zoomService.createMeeting({ title, date, time, duration, topic });
      if (zoom.success) {
        finalZoomLink = zoom.zoomLink;
        zoomMeetingId = zoom.meetingId;
        zoomPassword = zoom.password;
        zoomStartUrl = zoom.startUrl;
        zoomStatus = 'auto';
      } else {
        zoomStatus = 'failed';
        console.log('Zoom auto-create skipped:', zoom.message);
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
    };

    await models.liveClasses.create(newClass);

    res.status(201).json({ success: true, liveClass: newClass, zoomStatus });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const updatedClass = await models.liveClasses.findOneAndUpdate(
      { _id: req.params.id },
      { $set: req.body },
      { new: true }
    ).lean();

    if (!updatedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    res.json({ success: true, liveClass: updatedClass });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteClass = async (req, res) => {
  try {
    const cls = await models.liveClasses.findOne({ _id: req.params.id }).lean();
    if (!cls) {
      return res.status(404).json({ message: 'Class not found' });
    }

    if (cls.zoomMeetingId) {
      await zoomService.deleteMeeting(cls.zoomMeetingId);
    }

    await models.liveClasses.deleteOne({ _id: req.params.id });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
