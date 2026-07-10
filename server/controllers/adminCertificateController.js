const { db, models } = require('../database/db');

const generateId = () => Date.now().toString() + Math.random().toString(36).slice(2, 9);

// Get all certificates
exports.getCertificates = async (req, res) => {
  try {
    const certificates = await models.certificates.find().lean()

    const userIds = [...new Set(certificates.map(c => c.user || c.userId).filter(Boolean))]
    const users = await models.users.find({ _id: { $in: userIds } }).select('name email _id').lean()
    
    const courseIds = [...new Set(certificates.map(c => c.course || c.courseId).filter(Boolean))]
    const baseCourseIds = courseIds.map(id => id.includes('_') ? id.split('_')[0] : id)
    const courses = await models.courses.find({ _id: { $in: baseCourseIds } }).select('title _id').lean()

    const populated = certificates.map(cert => {
      const user = users.find(u => u._id === (cert.user || cert.userId))
      const rawCourseId = cert.course || cert.courseId
      const baseCourseId = rawCourseId ? (rawCourseId.includes('_') ? rawCourseId.split('_')[0] : rawCourseId) : null
      const course = courses.find(c => c._id === baseCourseId)
      return {
        ...cert,
        user: user ? { _id: user._id, name: user.name, email: user.email } : cert.user,
        course: course ? { _id: course._id, title: course.title } : cert.course
      };
    });

    res.json({ certificates: populated });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate certificate
exports.generateCertificate = async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    if (!userId || !courseId) {
      return res.status(400).json({ message: 'userId and courseId are required' });
    }

    const user = await models.users.findOne({ _id: userId }).lean()
    if (!user) return res.status(404).json({ message: 'User not found' });

    const baseCourseId = courseId.includes('_') ? courseId.split('_')[0] : courseId;
    const course = await models.courses.findOne({ _id: baseCourseId }).lean()
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Check if user is enrolled
    const isEnrolled = user.purchasedCourses?.includes(courseId);
    if (!isEnrolled) {
      return res.status(400).json({ message: 'User is not enrolled in this course' });
    }

    // Check for duplicate
    const existing = await models.certificates.findOne({
      $or: [
        { user: userId, course: courseId },
        { userId: userId, courseId: courseId }
      ]
    }).lean()
    
    if (existing) {
      return res.status(400).json({ message: 'Certificate already exists for this user and course' });
    }

    const certCount = await models.certificates.countDocuments()
    const certNumber = `CERT-${new Date().getFullYear()}-${String(certCount + 1).padStart(3, '0')}`;
    
    const newCertificate = {
      _id: generateId(),
      user: userId,
      course: courseId,
      issuedDate: new Date().toISOString(),
      certificateNumber: certNumber,
      issuedBy: req.user._id
    };

    await models.certificates.create(newCertificate)
    
    if (db.data.certificates) {
      db.data.certificates.push(newCertificate);
    }

    res.status(201).json({
      certificate: {
        ...newCertificate,
        user: { _id: user._id, name: user.name, email: user.email },
        course: { _id: course._id, title: course.title }
      }
    });
  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete certificate
exports.deleteCertificate = async (req, res) => {
  try {
    const result = await models.certificates.deleteOne({ _id: req.params.id })
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    if (db.data.certificates) {
      const index = db.data.certificates.findIndex(c => c._id === req.params.id);
      if (index !== -1) db.data.certificates.splice(index, 1);
    }

    res.json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    console.error('Delete certificate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
