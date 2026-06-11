const { db, models } = require('../database/db');

// Get activity logs (real data from DB)
exports.getLogs = async (req, res) => {
  try {
    const { type = 'all', limit = 200 } = req.query;

    let query = {}
    if (type !== 'all') {
      query = { $or: [{ type }, { module: type }] }
    }

    let logs = await models.activityLogs.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();
      
    const userIds = [...new Set(logs.map(l => l.userId).filter(Boolean))]
    const users = await models.users.find({ _id: { $in: userIds } }).select('name email _id').lean()

    // Populate user names and normalize type field
    logs = logs.map(log => {
      const user = users.find(u => u._id === log.userId);
      return {
        ...log,
        type: log.type || log.module || 'user',
        action: log.action || log.description || 'Action',
        timestamp: log.timestamp || log.createdAt || new Date().toISOString(),
        user: log.user || (user ? { name: user.name, email: user.email } : { name: log.userName || log.userEmail || 'System' })
      };
    });
    
    const total = await models.activityLogs.countDocuments(query)

    res.json({ logs, total });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Export logs as CSV
exports.exportLogs = async (req, res) => {
  try {
    const { type = 'all' } = req.query;
    
    let query = {}
    if (type !== 'all') {
      query = { type }
    }

    const logs = await models.activityLogs.find(query).sort({ createdAt: -1 }).lean()
    
    const userIds = [...new Set(logs.map(l => l.userId).filter(Boolean))]
    const users = await models.users.find({ _id: { $in: userIds } }).select('name _id').lean()

    const rows = logs.map(log => {
      const user = users.find(u => u._id === log.userId);
      const userName = log.user?.name || user?.name || log.userEmail || 'System';
      const ts = log.timestamp || log.createdAt;
      return `${log._id},"${log.type}","${(log.action || '').replace(/"/g, "'")}","${userName}","${new Date(ts).toLocaleString()}"`;
    });

    const csv = 'ID,Type,Action,User,Timestamp\\n' + rows.join('\\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=activity-logs.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
