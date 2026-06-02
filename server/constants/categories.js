/** Platform course categories — only Mathematics is valid */
const COURSE_CATEGORIES = ['Mathematics']

const LEGACY_MATH_CATEGORIES = new Set([
  'Mathematics', 'Math', 'math', 'Algebra', 'Geometry', 'Arithmetic', 'Calculus',
  'Statistics', 'Trigonometry', 'Linear Algebra', 'Abstract Algebra', 'Science',
  'English', 'Number Theory', 'Advanced', 'Basic', 'Learning',
])

function normalizeCourseCategory(category) {
  return 'Mathematics'
}

module.exports = { COURSE_CATEGORIES, normalizeCourseCategory }
