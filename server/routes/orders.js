const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, getAllOrders } = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/', protect, getUserOrders);
router.get('/all', protect, admin, getAllOrders);

module.exports = router;
