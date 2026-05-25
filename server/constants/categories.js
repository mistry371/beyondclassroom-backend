/** Platform course categories — only these two are valid */
const COURSE_CATEGORIES = ['Mathematics', 'French']

const LEGACY_MATH_CATEGORIES = new Set([
  'Mathematics', 'Math', 'math', 'Algebra', 'Geometry', 'Arithmetic', 'Calculus',
  'Statistics', 'Trigonometry', 'Linear Algebra', 'Abstract Algebra', 'Science',
  'English', 'Number Theory', 'Advanced', 'Basic', 'Learning',
])

const LEGACY_FRENCH = new Set(['French', 'french', 'Français', 'Francais'])

function normalizeCourseCategory(category) {
  if (!category) return 'Mathematics'
  if (COURSE_CATEGORIES.includes(category)) return category
  if (LEGACY_FRENCH.has(category)) return 'French'
  return 'Mathematics'
}

module.exports = { COURSE_CATEGORIES, normalizeCourseCategory }
