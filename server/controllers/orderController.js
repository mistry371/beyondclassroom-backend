const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const Course = require('../models/Course');

exports.createOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.course');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const courses = cart.items.map(item => item.course._id);
    const totalAmount = cart.items.reduce((sum, item) => sum + item.course.price, 0);

    const order = await Order.create({
      user: req.user.id,
      courses,
      totalAmount,
      status: 'completed'
    });

    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { purchasedCourses: { $each: courses } }
    });

    await Promise.all(courses.map(courseId => 
      Course.findByIdAndUpdate(courseId, { $inc: { enrolledCount: 1 } })
    ));

    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('courses')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('courses')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
