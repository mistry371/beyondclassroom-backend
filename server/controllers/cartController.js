const { models } = require('../database/db');

const generateId = () => Date.now().toString() + Math.random().toString(36).slice(2, 11);

exports.getCart = async (req, res) => {
  try {
    let cart = await models.cart.findOne({ user: req.user._id }).lean();

    if (!cart) {
      cart = { user: req.user._id, items: [] };
      await models.cart.create(cart);
    }

    // Populate course details
    const courseIds = cart.items.map(i => i.course);
    const courses = await models.courses.find({ _id: { $in: courseIds } }).lean();

    cart.items = cart.items.map(item => ({
      ...item,
      course: courses.find(c => c._id === item.course)
    }));

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { courseId } = req.body;
    let cart = await models.cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await models.cart.create({ user: req.user._id, items: [] });
    }

    const itemExists = cart.items.find(item => item.course === courseId);
    if (itemExists) {
      return res.status(400).json({ message: 'Course already in cart' });
    }

    cart.items.push({
      _id: generateId(),
      course: courseId,
      addedAt: new Date()
    });

    await models.cart.updateOne({ user: req.user._id }, { $set: { items: cart.items } });

    // Populate course details
    const courseIds = cart.items.map(i => i.course);
    const courses = await models.courses.find({ _id: { $in: courseIds } }).lean();

    const populatedCart = {
      ...cart.toObject ? cart.toObject() : cart,
      items: cart.items.map(item => ({
        ...item.toObject ? item.toObject() : item,
        course: courses.find(c => c._id === item.course)
      }))
    };

    res.json({ success: true, cart: populatedCart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const cart = await models.cart.findOne({ user: req.user._id });

    if (cart) {
      cart.items = cart.items.filter(item => item.course !== req.params.courseId);
      await models.cart.updateOne({ user: req.user._id }, { $set: { items: cart.items } });
    }

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await models.cart.updateOne({ user: req.user._id }, { $set: { items: [] } });
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
