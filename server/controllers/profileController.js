const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('purchasedCourses');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, profilePhoto } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, profilePhoto },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addToFavorites = async (req, res) => {
  try {
    const { courseId } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { favorites: courseId } },
      { new: true }
    ).populate('favorites');

    res.json({ success: true, favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeFromFavorites = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { favorites: req.params.courseId } },
      { new: true }
    ).populate('favorites');

    res.json({ success: true, favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
