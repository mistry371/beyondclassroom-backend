const { models } = require('../database/db');

exports.getTrialStatus = async (req, res) => {
  try {
    const user = await models.users.findOne({ _id: req.user._id }).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const now = new Date();
    const trialEndsAt = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
    const trialActive = trialEndsAt && now < trialEndsAt;
    const trialExpired = trialEndsAt && now >= trialEndsAt;
    const daysLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24))) : 0;
    const hoursLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt - now) / (1000 * 60 * 60))) : 0;

    // Auto-mark expired
    if (trialExpired && !user.trialExpired) {
      await models.users.updateOne({ _id: req.user._id }, { $set: { trialExpired: true } });
    }

    res.json({
      success: true,
      trialActive,
      trialExpired: trialExpired || user.trialExpired || false,
      trialEndsAt: user.trialEndsAt || null,
      daysLeft,
      hoursLeft,
      hasPurchasedCourses: (user.purchasedCourses || []).length > 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
