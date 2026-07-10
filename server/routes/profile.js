const express = require('express');
const router = express.Router();
const {
  getProfile,
  getDashboardSummary,
  updateProfile,
  addToFavorites,
  removeFromFavorites
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getProfile);
router.get('/dashboard-summary', getDashboardSummary);
router.put('/', updateProfile);
router.post('/favorites', addToFavorites);
router.delete('/favorites/:courseId', removeFromFavorites);

module.exports = router;
