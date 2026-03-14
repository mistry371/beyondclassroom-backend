const { db } = require('../database/db');

// Get activity logs
exports.getLogs = async (req, res) => {
  try {
    const { type = 'all' } = req.query;
    await db.read();
    
    if (!db.data.activityLogs) {
      db.data.activityLogs = [
        {
          _id: Date.now().toString() + '1',
          type: 'user',
          action: 'User registered',
          user: { name: 'John Doe' },
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          _id: Date.now().toString() + '2',
          type: 'admin',
          action: 'Course created',
          user: { name: 'Admin' },
          timestamp: new Date(Date.now() - 7200000).toISOString()
        },
        {
          _id: Date.now().toString() + '3',
          type: 'system',
          action: 'Database backup completed',
          user: { name: 'System' },
          timestamp: new Date(Date.now() - 10800000).toISOString()
        },
        {
          _id: Date.now().toString() + '4',
          type: 'security',
          action: 'Failed login attempt',
          user: { name: 'Unknown' },
          timestamp: new Date(Date.now() - 14400000).toISOString()
        }
      ];
      await db.write();
    }

    let logs = db.data.activityLogs;
    if (type !== 'all') {
      logs = logs.filter(log => log.type === type);
    }

    res.json({ logs });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
