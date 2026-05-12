const { db } = require('../database/db');

// Get activity logs (real data from DB)
exports.getLogs = async (req, res) => {
  try {
    const { type = 'all', limit = 200 } = req.query;
    await db.read();

    // Ensure activityLogs array exists
    if (!db.data.activityLogs) {
      db.data.activityLogs = [];
      await db.write();
    }

    let logs = [...db.data.activityLogs].reverse(); // newest first

    if (type !== 'all') {
      logs = logs.filter(log => log.type === type || log.module === type);
    }

    // Populate user names and normalize type field
    logs = logs.slice(0, parseInt(limit)).map(log => {
      const user = log.userId ? db.data.users?.find(u => u._id === log.userId) : null;
      return {
        ...log,
        type: log.type || log.module || 'user',
        action: log.action || log.description || 'Action',
        timestamp: log.timestamp || log.createdAt || new Date().toISOString(),
        user: log.user || (user ? { name: user.name, email: user.email } : { name: log.userName || log.userEmail || 'System' })
      };
    });

    res.json({ logs, total: db.data.activityLogs.length });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Export logs as CSV
exports.exportLogs = async (req, res) => {
  try {
    const { type = 'all' } = req.query;
    await db.read();

    let logs = db.data.activityLogs || [];
    if (type !== 'all') {
      logs = logs.filter(l => l.type === type);
    }

    const rows = logs.map(log => {
      const user = log.userId ? db.data.users?.find(u => u._id === log.userId) : null;
      const userName = log.user?.name || user?.name || log.userEmail || 'System';
      const ts = log.timestamp || log.createdAt;
      return `${log._id},"${log.type}","${(log.action || '').replace(/"/g, "'")}","${userName}","${new Date(ts).toLocaleString()}"`;
    });

    const csv = 'ID,Type,Action,User,Timestamp\n' + rows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=activity-logs.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
