const express = require('express');
const router = express.Router();
const {
  getPublicTeam,
  getAllTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember
} = require('../controllers/teamController');
const { protect, admin } = require('../middleware/auth');

// Public route
router.get('/public', getPublicTeam);

// Admin routes
router.get('/', protect, admin, getAllTeamMembers);
router.post('/', protect, admin, createTeamMember);
router.put('/:id', protect, admin, updateTeamMember);
router.delete('/:id', protect, admin, deleteTeamMember);

module.exports = router;
