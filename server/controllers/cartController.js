const Cart = require('../models/Cart');

exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.course');
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { courseId } = req.body;
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    const itemExists = cart.items.find(item => item.course.toString() === courseId);
    if (itemExists) {
      return res.status(400).json({ message: 'Course already in cart' });
    }

    cart.items.push({ course: courseId });
    cart.updatedAt = Date.now();
    await cart.save();

    cart = await cart.populate('items.course');
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.course.toString() !== req.params.courseId);
    cart.updatedAt = Date.now();
    await cart.save();

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      cart.updatedAt = Date.now();
      await cart.save();
    }
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
