const express = require('express');
const router = express.Router();
const { getCart, addToCart, removeFromCart, clearCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getCart);
router.post('/', addToCart);
router.delete('/:courseId', removeFromCart);
router.delete('/', clearCart);

module.exports = router;
