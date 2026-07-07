const { models } = require('../database/db');

exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await models.notifications.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await models.notifications.updateMany({ user: req.user._id }, { $set: { isRead: true } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await models.notifications.updateOne({ _id: req.params.id }, { $set: { isRead: true } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const notification = await models.notifications.create({
      ...req.body,
      user: req.body.userId || req.user._id,
    });
    res.status(201).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await models.notifications.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
