const { db } = require('../database/db');

// Get security data
exports.getSecurityData = async (req, res) => {
  try {
    await db.read();
    
    const securityData = {
      failedLogins: [
        {
          email: 'hacker@example.com',
          ip: '192.168.1.100',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          email: 'test@example.com',
          ip: '192.168.1.101',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        }
      ],
      blockedIPs: [
        { address: '192.168.1.200', blockedAt: new Date(Date.now() - 86400000).toISOString() }
      ],
      suspiciousActivity: [
        {
          type: 'Multiple failed logins',
          description: '5 failed login attempts from same IP',
          severity: 'high',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          type: 'Unusual access pattern',
          description: 'Access from new location',
          severity: 'medium',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        }
      ]
    };

    res.json(securityData);
  } catch (error) {
    console.error('Get security data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Block IP
exports.blockIP = async (req, res) => {
  try {
    const { ip } = req.body;
    await db.read();
    
    if (!db.data.blockedIPs) {
      db.data.blockedIPs = [];
    }

    db.data.blockedIPs.push({
      address: ip,
      blockedAt: new Date().toISOString()
    });
    
    await db.write();

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
    await db.read();
    
    if (db.data.blockedIPs) {
      db.data.blockedIPs = db.data.blockedIPs.filter(item => item.address !== ip);
      await db.write();
    }

    res.json({ message: 'IP unblocked successfully' });
  } catch (error) {
    console.error('Unblock IP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
