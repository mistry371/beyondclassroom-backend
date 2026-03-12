const Notification = require('../models/Notification');

exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const notification = await Notification.create({
      user: req.body.userId || req.user.id,
      ...req.body
    });
    res.status(201).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
