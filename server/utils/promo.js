// Promo-code applicability rules (#9).
// A promo can apply to: all items ('all'), only specific packages ('packages'),
// or only purchases that include specific courses ('courses').

const baseId = (id) => {
  const s = String(id || '')
  return s.includes('_') ? s.split('_')[0] : s
}

/**
 * @param promo   the promo code doc (applicableType/applicablePackageIds/applicableCourseIds)
 * @param ctx     { packageId, courseId, selectedCourseIds, packageCourseIds }
 * @returns {{ ok: boolean, reason?: string }}
 */
function checkPromoApplicable(promo, ctx = {}) {
  const type = promo.applicableType || 'all'
  if (type === 'all') return { ok: true }

  const { packageId, courseId, selectedCourseIds = [], packageCourseIds = [] } = ctx

  if (type === 'packages') {
    const allowed = promo.applicablePackageIds || []
    if (packageId && allowed.includes(packageId)) return { ok: true }
    return { ok: false, reason: 'This promo code is not valid for the selected package' }
  }

  if (type === 'courses') {
    const allow = new Set((promo.applicableCourseIds || []).map(baseId))
    if (courseId) {
      return allow.has(baseId(courseId))
        ? { ok: true }
        : { ok: false, reason: 'This promo code is not valid for the selected course' }
    }
    // Package purchase: valid if any purchased course is in the allow list.
    const bought = (selectedCourseIds.length ? selectedCourseIds : packageCourseIds).map(baseId)
    return bought.some((id) => allow.has(id))
      ? { ok: true }
      : { ok: false, reason: 'This promo code is not valid for the selected course(s)' }
  }

  return { ok: true }
}

module.exports = { checkPromoApplicable, baseId }
