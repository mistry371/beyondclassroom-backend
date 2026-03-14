const { db } = require('../database/db');

// Get all tools
exports.getTools = async (req, res) => {
  try {
    const tools = [
      { _id: '1', name: 'Basic Calculator', description: 'Perform basic arithmetic operations', enabled: true },
      { _id: '2', name: 'Quadratic Solver', description: 'Solve quadratic equations', enabled: true },
      { _id: '3', name: 'Graphing Calculator', description: 'Plot mathematical functions', enabled: true },
      { _id: '4', name: 'Matrix Calculator', description: 'Matrix operations', enabled: true },
      { _id: '5', name: 'Statistics Calculator', description: 'Statistical analysis', enabled: true },
      { _id: '6', name: 'Trigonometry Calculator', description: 'Trigonometric calculations', enabled: true },
      { _id: '7', name: 'Derivative Calculator', description: 'Calculate derivatives', enabled: true },
      { _id: '8', name: 'Integral Calculator', description: 'Calculate integrals', enabled: true },
      { _id: '9', name: 'Limit Calculator', description: 'Calculate limits', enabled: false },
      { _id: '10', name: 'Vector Calculator', description: 'Vector operations', enabled: true }
    ];

    res.json({ tools });
  } catch (error) {
    console.error('Get tools error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update tool
exports.updateTool = async (req, res) => {
  try {
    const { enabled } = req.body;
    
    res.json({ message: 'Tool updated successfully', enabled });
  } catch (error) {
    console.error('Update tool error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
