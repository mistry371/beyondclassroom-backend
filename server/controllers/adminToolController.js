const { db } = require('../database/db');

const DEFAULT_TOOLS = [
  { _id: '1', name: 'Basic Calculator', description: 'Perform basic arithmetic operations (+, -, ×, ÷)', category: 'Basic', enabled: true },
  { _id: '2', name: 'Quadratic Solver', description: 'Solve quadratic equations ax²+bx+c=0', category: 'Algebra', enabled: true },
  { _id: '3', name: 'Graphing Calculator', description: 'Plot mathematical functions on a graph', category: 'Calculus', enabled: true },
  { _id: '4', name: 'Matrix Calculator', description: 'Matrix addition, multiplication, determinant, inverse', category: 'Advanced', enabled: true },
  { _id: '5', name: 'Statistics Calculator', description: 'Mean, median, mode, standard deviation', category: 'Statistics', enabled: true },
  { _id: '6', name: 'Trigonometry Calculator', description: 'Sin, cos, tan and inverse functions', category: 'Trigonometry', enabled: true },
  { _id: '7', name: 'Derivative Calculator', description: 'Calculate derivatives of functions', category: 'Calculus', enabled: true },
  { _id: '8', name: 'Integral Calculator', description: 'Calculate definite and indefinite integrals', category: 'Calculus', enabled: true },
  { _id: '9', name: 'Limit Calculator', description: 'Calculate limits of functions', category: 'Calculus', enabled: true },
  { _id: '10', name: 'Vector Calculator', description: 'Vector addition, dot product, cross product', category: 'Advanced', enabled: true },
  { _id: '11', name: 'Fraction Calculator', description: 'Fraction arithmetic and simplification', category: 'Basic', enabled: true },
  { _id: '12', name: 'Percentage Calculator', description: 'Percentage, increase/decrease calculations', category: 'Basic', enabled: true },
  { _id: '13', name: 'LCM/GCD Calculator', description: 'Least common multiple and greatest common divisor', category: 'Number Theory', enabled: true },
  { _id: '14', name: 'Prime Checker', description: 'Check if a number is prime, find prime factors', category: 'Number Theory', enabled: true },
  { _id: '15', name: 'Probability Calculator', description: 'Probability, combinations, permutations', category: 'Statistics', enabled: true },
  { _id: '16', name: 'Area Calculator', description: 'Calculate area of geometric shapes', category: 'Geometry', enabled: true },
  { _id: '17', name: 'Volume Calculator', description: 'Calculate volume of 3D shapes', category: 'Geometry', enabled: true },
  { _id: '18', name: 'Geometry Visualizer', description: 'Visualize geometric shapes interactively', category: 'Geometry', enabled: true },
  { _id: '19', name: 'Number Line', description: 'Interactive number line visualization', category: 'Basic', enabled: true },
  { _id: '20', name: 'Fraction Visualizer', description: 'Visual representation of fractions', category: 'Basic', enabled: true },
  { _id: '21', name: 'Equation Builder', description: 'Build and solve equations step by step', category: 'Algebra', enabled: true },
  { _id: '22', name: 'Linear Equation Solver', description: 'Solve systems of linear equations', category: 'Algebra', enabled: true },
  { _id: '23', name: 'Sequence Calculator', description: 'Arithmetic and geometric sequences', category: 'Algebra', enabled: true },
  { _id: '24', name: 'Logarithm Calculator', description: 'Calculate logarithms in any base', category: 'Advanced', enabled: true },
  { _id: '25', name: 'Exponent Calculator', description: 'Powers, roots, and scientific notation', category: 'Basic', enabled: true },
  { _id: '26', name: 'Root Calculator', description: 'Square roots, cube roots, nth roots', category: 'Basic', enabled: true },
  { _id: '27', name: 'Complex Number Calculator', description: 'Operations with complex numbers', category: 'Advanced', enabled: true },
  { _id: '28', name: 'Ratio Calculator', description: 'Ratio, proportion, and scaling', category: 'Basic', enabled: true },
  { _id: '29', name: 'Factorial Calculator', description: 'Calculate factorials and combinations', category: 'Number Theory', enabled: true },
  { _id: '30', name: 'Permutation & Combination', description: 'nPr and nCr calculations', category: 'Statistics', enabled: true },
  { _id: '31', name: 'Quadratic Solver Enhanced', description: 'Advanced quadratic solver with graph', category: 'Algebra', enabled: true },
  { _id: '32', name: 'Step-by-Step Solver', description: 'Solve problems with detailed steps', category: 'Learning', enabled: true },
  { _id: '33', name: 'Concept Simplifier', description: 'Complex concepts explained simply', category: 'Learning', enabled: true },
  { _id: '34', name: 'Practice Generator', description: 'Generate practice problems by topic', category: 'Learning', enabled: true },
  { _id: '35', name: 'Timed Practice', description: 'Timed math practice sessions', category: 'Learning', enabled: true },
  { _id: '36', name: 'Daily Challenge', description: 'Daily math challenge problems', category: 'Learning', enabled: true },
  { _id: '37', name: 'Hint Generator', description: 'Get progressive hints for problems', category: 'Learning', enabled: true },
  { _id: '38', name: 'Mistake Analyzer', description: 'Analyze and learn from mistakes', category: 'Learning', enabled: true },
  { _id: '39', name: 'Formula Explorer', description: 'Explore and understand math formulas', category: 'Learning', enabled: true },
  { _id: '40', name: 'Visual Graph Tool', description: 'Advanced visual graphing and analysis', category: 'Calculus', enabled: true },
];

exports.getTools = async (req, res) => {
  try {
    await db.read();
    // Always sync — ensure all 40 tools exist, preserving existing enabled states
    const existing = db.data.tools || [];
    db.data.tools = DEFAULT_TOOLS.map(dt => {
      const found = existing.find(t => t._id === dt._id);
      return found ? { ...dt, enabled: found.enabled } : dt;
    });
    await db.write();
    res.json({ tools: db.data.tools });
  } catch (error) {
    console.error('Get tools error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateTool = async (req, res) => {
  try {
    await db.read();
    const { enabled } = req.body;
    if (!db.data.tools) db.data.tools = DEFAULT_TOOLS;
    const index = db.data.tools.findIndex(t => t._id === req.params.id);
    if (index === -1) return res.status(404).json({ message: 'Tool not found' });
    db.data.tools[index] = { ...db.data.tools[index], enabled };
    await db.write();
    res.json({ message: 'Tool updated successfully', tool: db.data.tools[index] });
  } catch (error) {
    console.error('Update tool error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
