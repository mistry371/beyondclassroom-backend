// Central authorization helpers for premium course content (#1 preview, #4 protection).

const baseId = (id) => {
  const s = String(id || '')
  return s.includes('_') ? s.split('_')[0] : s
}

const isAdmin = (user) => !!user && (user.role === 'admin' || user.role === 'super_admin')

// Does the user own the given course (by base id), via any purchasedCourses entry?
const ownsCourse = (user, courseId) => {
  if (!user) return false
  const base = baseId(courseId)
  return (user.purchasedCourses || []).some((entry) => {
    const e = String(entry)
    const b = e.includes('_') ? e.split('_')[0] : e
    return b === base || e === courseId
  })
}

// Which subtopics are previewable (viewable without login/purchase)?
// Rule: any subtopic explicitly flagged isPreview. For consistency across ALL
// courses (so every class has a free preview even if none was flagged), fall
// back to the single lowest-order subtopic when nothing is flagged.
const previewableSubtopicIds = (subtopics = []) => {
  const flagged = subtopics.filter((s) => s.isPreview)
  if (flagged.length) return new Set(flagged.map((s) => s._id))
  if (!subtopics.length) return new Set()
  const first = [...subtopics].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0]
  return new Set(first ? [first._id] : [])
}

// Strip the downloadable payload (base64 data) from a doc, always. Optionally
// strip the url too (for users who may only PREVIEW, not download).
const stripDoc = (doc, { keepUrl }) => {
  if (!doc || typeof doc !== 'object') return doc
  const { data, url, ...rest } = doc
  return keepUrl && url ? { ...rest, url } : rest
}

module.exports = { baseId, isAdmin, ownsCourse, previewableSubtopicIds, stripDoc }
