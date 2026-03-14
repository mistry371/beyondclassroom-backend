const { db } = require('../database/db');

// Get all certificates
exports.getCertificates = async (req, res) => {
  try {
    await db.read();
    
    if (!db.data.certificates) {
      db.data.certificates = [
        {
          _id: Date.now().toString() + '1',
          user: db.data.users.find(u => u.role === 'student'),
          course: db.data.courses?.[0],
          issuedDate: new Date(Date.now() - 86400000).toISOString(),
          certificateNumber: 'CERT-2024-001'
        },
        {
          _id: Date.now().toString() + '2',
          user: db.data.users.find(u => u.role === 'student'),
          course: db.data.courses?.[1],
          issuedDate: new Date(Date.now() - 172800000).toISOString(),
          certificateNumber: 'CERT-2024-002'
        }
      ];
      await db.write();
    }

    res.json({ certificates: db.data.certificates });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate certificate
exports.generateCertificate = async (req, res) => {
  try {
    const { userId, courseId } = req.body;
    await db.read();
    
    if (!db.data.certificates) {
      db.data.certificates = [];
    }

    const user = db.data.users.find(u => u._id === userId);
    const course = db.data.courses?.find(c => c._id === courseId);

    const newCertificate = {
      _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      user,
      course,
      issuedDate: new Date().toISOString(),
      certificateNumber: `CERT-${new Date().getFullYear()}-${String(db.data.certificates.length + 1).padStart(3, '0')}`
    };

    db.data.certificates.push(newCertificate);
    await db.write();

    res.status(201).json({ certificate: newCertificate });
  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
