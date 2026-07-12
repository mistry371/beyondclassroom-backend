const { models } = require('../database/db');

exports.getDashboardSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await models.users.findOne({ _id: userId }).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 1. Courses
    const courseIds = user.purchasedCourses || [];
    const baseCourseIds = [...new Set(courseIds.map(id => id.includes('_') ? id.split('_')[0] : id))];
    const packageIds = [...new Set(courseIds.filter(id => id.includes('_')).map(id => id.split('_')[1]))];

    const dbCourses = await models.courses.find({ _id: { $in: baseCourseIds } })
      .select('title description duration difficulty _id thumbnail')
      .lean();
      
    const dbPackages = await models.packages.find({ _id: { $in: packageIds } }).select('name _id').lean();

    const courses = courseIds.map(purchasedId => {
      const isCompound = purchasedId.includes('_');
      const baseId = isCompound ? purchasedId.split('_')[0] : purchasedId;
      const pkgId = isCompound ? purchasedId.split('_')[1] : null;
      
      const c = dbCourses.find(c => c._id === baseId);
      if (!c) return null;
      
      const pkg = pkgId ? dbPackages.find(p => p._id === pkgId) : null;
      
      return {
        ...c,
        _id: purchasedId,
        originalCourseId: baseId,
        title: pkg ? `${c.title} (${pkg.name})` : c.title
      };
    }).filter(Boolean);

    // 2. Progress
    const progress = await models.progress.find({ userId, courseId: { $in: courseIds } }).lean();

    // 3. Custom Requests Stats
    const customRequests = await models.customRequests.find({ userId }).select('status').lean();
    const customRequestsStats = {
      total: customRequests.length,
      completed: customRequests.filter(r => r.status === 'completed').length
    };

    // 4. Announcements
    const announcements = await models.announcements.find({ isActive: true }).sort({ createdAt: -1 }).lean();

    // 5. Trial Status logic
    const now = new Date();
    const trialEndsAt = user.trialEndsAt ? new Date(user.trialEndsAt) : null;
    const trialActive = trialEndsAt && now < trialEndsAt;
    const trialExpired = trialEndsAt && now >= trialEndsAt;
    const daysLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt - now) / (1000 * 60 * 60 * 24))) : 0;
    const hoursLeft = trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt - now) / (1000 * 60 * 60))) : 0;

    if (trialExpired && !user.trialExpired) {
      await models.users.updateOne({ _id: userId }, { $set: { trialExpired: true } });
    }

    const trialStatus = {
      trialActive,
      trialExpired: trialExpired || user.trialExpired || false,
      trialEndsAt: user.trialEndsAt || null,
      daysLeft,
      hoursLeft,
      hasPurchasedCourses: courseIds.length > 0
    };

    const { password, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: {
        ...userWithoutPassword,
        purchasedCourseIds: courseIds,
      },
      courses,
      progress,
      customRequestsStats,
      announcements,
      trialStatus
    });
  } catch (error) {
    console.error('getDashboardSummary Error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await models.users.findOne({ _id: req.user._id }).lean();

    if (user) {
      const courseIds = user.purchasedCourses || [];
      const baseCourseIds = [...new Set(courseIds.map(id => id.includes('_') ? id.split('_')[0] : id))];
      const packageIds = [...new Set(courseIds.filter(id => id.includes('_')).map(id => id.split('_')[1]))];

      const dbCourses = await models.courses.find({ _id: { $in: baseCourseIds } }).lean();
      const dbPackages = await models.packages.find({ _id: { $in: packageIds } }).select('name _id').lean();

      const populatedCourses = courseIds.map(purchasedId => {
        const isCompound = purchasedId.includes('_');
        const baseId = isCompound ? purchasedId.split('_')[0] : purchasedId;
        const pkgId = isCompound ? purchasedId.split('_')[1] : null;
        
        const c = dbCourses.find(c => c._id === baseId);
        if (!c) return null;
        
        const pkg = pkgId ? dbPackages.find(p => p._id === pkgId) : null;
        
        return {
          ...c,
          _id: purchasedId,
          originalCourseId: baseId,
          title: pkg ? `${c.title} (${pkg.name})` : c.title
        };
      }).filter(Boolean);

      const { password, ...userWithoutPassword } = user;
      res.json({ success: true, user: {
        ...userWithoutPassword,
        purchasedCourses: populatedCourses,
        purchasedCourseIds: user.purchasedCourses || [],
        trialEndsAt: user.trialEndsAt || null,
        trialExpired: user.trialExpired || false
      } });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, profilePhoto } = req.body;
    let updates = { updatedAt: new Date() };
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (profilePhoto !== undefined) updates.profilePhoto = profilePhoto;

    const user = await models.users.findOneAndUpdate(
      { _id: req.user._id },
      { $set: updates },
      { new: true }
    ).lean();

    if (!user) return res.status(404).json({ message: 'User not found' });

    const { password, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addToFavorites = async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = await models.users.findOneAndUpdate(
      { _id: req.user._id },
      { $addToSet: { favorites: courseId } },
      { new: true }
    ).lean();

    res.json({ success: true, favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeFromFavorites = async (req, res) => {
  try {
    const user = await models.users.findOneAndUpdate(
      { _id: req.user._id },
      { $pull: { favorites: req.params.courseId } },
      { new: true }
    ).lean();

    res.json({ success: true, favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
