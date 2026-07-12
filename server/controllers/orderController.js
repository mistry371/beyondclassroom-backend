const { models } = require('../database/db');

const generateId = () => Date.now().toString() + Math.random().toString(36).slice(2, 11);

exports.createOrder = async (req, res) => {
  try {
    const cart = await models.cart.findOne({ user: req.user._id }).lean();

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const courseIds = cart.items.map(item => item.course);
    const coursesObj = await models.courses.find({ _id: { $in: courseIds } }).lean();

    // Block direct order for paid courses — must go through Razorpay payment
    const paidCourses = courseIds.filter(courseId => {
      const course = coursesObj.find(c => c._id === courseId);
      return course && course.price > 0 && !course.isFree && !course.isDemo;
    });

    if (paidCourses.length > 0) {
      const paidTitles = paidCourses.map(courseId => {
        const course = coursesObj.find(c => c._id === courseId);
        return course?.title || courseId;
      });
      return res.status(403).json({
        message: 'Paid courses require payment. Please complete payment via the course page.',
        paidCourses: paidTitles
      });
    }

    // Only free/demo courses allowed here
    const totalAmount = 0;

    const order = {
      _id: generateId(),
      user: req.user._id,
      courses: courseIds,
      totalAmount,
      status: 'completed',
      createdAt: new Date()
    };

    await models.orders.create(order);

    // Add courses to user's purchased courses
    const user = await models.users.findOne({ _id: req.user._id });
    if (user) {
      const newCourses = [...new Set([...(user.purchasedCourses || []), ...courseIds])];
      await models.users.updateOne({ _id: req.user._id }, { $set: { purchasedCourses: newCourses } });
    }

    // Clear cart
    await models.cart.updateOne({ user: req.user._id }, { $set: { items: [] } });

    // Respond immediately; fire enrollment notifications in the background
    // (don't block the order response on N sequential notification/email sends).
    res.status(201).json({ success: true, order });

    const notificationService = require('../services/notificationService');
    Promise.allSettled(
      courseIds.map(courseId => {
        const course = coursesObj.find(c => c._id === courseId);
        return course
          ? notificationService.sendEnrollmentNotification(req.user._id, req.user.name, req.user.email, course.title)
          : Promise.resolve();
      })
    ).catch(() => {});
    return;
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await models.orders.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await models.orders.find().sort({ createdAt: -1 }).limit(500).lean();
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
