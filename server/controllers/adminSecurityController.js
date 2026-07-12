const { models } = require('../database/db');

const generateId = () => Date.now().toString() + Math.random().toString(36).slice(2, 11);

// Get security data — real data only (no fabricated sample incidents).
exports.getSecurityData = async (req, res) => {
  try {
    const [blocked, recentLogs] = await Promise.all([
      models.blockedIPs.find().sort({ createdAt: -1 }).limit(200).lean(),
      models.activityLogs
        ? models.activityLogs.find({ action: { $in: ['failed_login', 'login_failed'] } }).sort({ createdAt: -1 }).limit(50).lean()
        : [],
    ]);

    const failedLogins = (recentLogs || []).map((l) => ({
      email: l.userName || l.metadata?.email || 'unknown',
      ip: l.metadata?.ip || '—',
      timestamp: l.createdAt,
    }));

    res.json({
      failedLogins,
      blockedIPs: blocked.map((b) => ({ address: b.ip, reason: b.reason || '', blockedAt: b.createdAt })),
      suspiciousActivity: [], // populated from real telemetry when available
    });
  } catch (error) {
    console.error('Get security data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Block IP — persisted to the blockedIPs collection.
exports.blockIP = async (req, res) => {
  try {
    const { ip, reason } = req.body;
    if (!ip) return res.status(400).json({ message: 'IP address is required' });

    const existing = await models.blockedIPs.findOne({ ip }).lean();
    if (!existing) {
      await models.blockedIPs.create({ _id: generateId(), ip, reason: reason || 'Blocked by admin', createdAt: new Date() });
    }
    res.json({ message: 'IP blocked successfully' });
  } catch (error) {
    console.error('Block IP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Unblock IP
exports.unblockIP = async (req, res) => {
  try {
    const { ip } = req.body;
    if (!ip) return res.status(400).json({ message: 'IP address is required' });
    await models.blockedIPs.deleteOne({ ip });
    res.json({ message: 'IP unblocked successfully' });
  } catch (error) {
    console.error('Unblock IP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
