const { db } = require('../database/db');

const generateId = () => Date.now().toString() + Math.random().toString(36).slice(2, 9);

// Get all certificates
exports.getCertificates = async (req, res) => {
  try {
    await db.read();

    if (!db.data.certificates) {
      db.data.certificates = [];
      await db.write();
    }

    // Populate user and course references
    const populated = db.data.certificates.map(cert => {
      const user = typeof cert.user === 'string'
        ? db.data.users?.find(u => u._id === cert.user)
        : cert.user;
      const course = typeof cert.course === 'string'
        ? db.data.courses?.find(c => c._id === cert.course)
        : cert.course;
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

    await db.read();

    const user = db.data.users?.find(u => u._id === userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const course = db.data.courses?.find(c => c._id === courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Check if user is enrolled
    const isEnrolled = user.purchasedCourses?.includes(courseId);
    if (!isEnrolled) {
      return res.status(400).json({ message: 'User is not enrolled in this course' });
    }

    // Check for duplicate
    const existing = db.data.certificates?.find(c => {
      const cUserId = typeof c.user === 'string' ? c.user : c.user?._id;
      const cCourseId = typeof c.course === 'string' ? c.course : c.course?._id;
      return cUserId === userId && cCourseId === courseId;
    });
    if (existing) {
      return res.status(400).json({ message: 'Certificate already exists for this user and course' });
    }

    if (!db.data.certificates) db.data.certificates = [];

    const certNumber = `CERT-${new Date().getFullYear()}-${String(db.data.certificates.length + 1).padStart(3, '0')}`;
    const newCertificate = {
      _id: generateId(),
      user: userId,
      course: courseId,
      issuedDate: new Date().toISOString(),
      certificateNumber: certNumber,
      issuedBy: req.user._id
    };

    db.data.certificates.push(newCertificate);
    await db.write();

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
    await db.read();

    const index = db.data.certificates?.findIndex(c => c._id === req.params.id);
    if (index === -1 || index === undefined) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    db.data.certificates.splice(index, 1);
    await db.write();

    res.json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    console.error('Delete certificate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
