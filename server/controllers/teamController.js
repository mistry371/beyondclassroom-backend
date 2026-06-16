const Team = require('../models/Team');

exports.getPublicTeam = async (req, res) => {
  try {
    const team = await Team.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, team });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching team' });
  }
};

exports.getAllTeamMembers = async (req, res) => {
  try {
    const team = await Team.find().sort({ order: 1 });
    res.json({ success: true, team });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching team' });
  }
};

exports.createTeamMember = async (req, res) => {
  try {
    const { name, role, photo, degree, experience, expertise, isActive, order } = req.body;
    
    // Parse expertise if it's a comma separated string
    let parsedExpertise = [];
    if (typeof expertise === 'string') {
      parsedExpertise = expertise.split(',').map(e => e.trim()).filter(Boolean);
    } else if (Array.isArray(expertise)) {
      parsedExpertise = expertise;
    }

    const teamMember = new Team({
      name,
      role,
      photo,
      degree,
      experience,
      expertise: parsedExpertise,
      isActive,
      order
    });

    await teamMember.save();
    res.status(201).json({ success: true, teamMember });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating team member' });
  }
};

exports.updateTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, photo, degree, experience, expertise, isActive, order } = req.body;

    let parsedExpertise = expertise;
    if (typeof expertise === 'string') {
      parsedExpertise = expertise.split(',').map(e => e.trim()).filter(Boolean);
    }

    const teamMember = await Team.findByIdAndUpdate(id, {
      name,
      role,
      photo,
      degree,
      experience,
      expertise: parsedExpertise,
      isActive,
      order
    }, { new: true });

    if (!teamMember) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }

    res.json({ success: true, teamMember });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating team member' });
  }
};

exports.deleteTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const teamMember = await Team.findByIdAndDelete(id);
    if (!teamMember) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }
    res.json({ success: true, message: 'Team member deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting team member' });
  }
};
