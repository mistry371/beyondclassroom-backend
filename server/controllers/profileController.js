const { models } = require('../database/db');

exports.getProfile = async (req, res) => {
  try {
    const user = await models.users.findOne({ _id: req.user._id }).lean();

    if (user) {
      const populatedCourses = await models.courses.find({ _id: { $in: user.purchasedCourses || [] } }).lean();

      const { password, ...userWithoutPassword } = user;
      res.json({ success: true, user: {
        ...userWithoutPassword,
        purchasedCourses: populatedCourses,
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
    const { name, email, profilePhoto } = req.body;
    let updates = { updatedAt: new Date() };
    if (name) updates.name = name;
    if (email) updates.email = email;
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
