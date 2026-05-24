import {
  getStoredPromoter,
  savePromoterSession,
  clearPromoterSession,
} from './promoterApi'

export function getPromoter() {
  return getStoredPromoter()
}

export function setPromoter(promoter) {
  if (typeof window !== 'undefined' && promoter) {
    localStorage.setItem('promoter', JSON.stringify(promoter))
  }
}

export function clearPromoter() {
  clearPromoterSession()
}

export { savePromoterSession, clearPromoterSession, getStoredPromoter }
