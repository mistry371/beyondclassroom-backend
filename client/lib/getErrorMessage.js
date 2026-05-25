export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'Request timed out. The server may be waking up — please retry in a few seconds.'
  }
  if (!error.response) {
    return 'Network error. Check your connection and try again.'
  }
  const msg = error.response?.data?.message
  if (typeof msg === 'string' && msg.length) return msg
  if (error.response.status === 401) return 'Session expired. Please sign in again.'
  if (error.response.status === 403) return 'You do not have permission for this action.'
  if (error.response.status >= 500) return 'Server error. Our team has been notified — please retry.'
  return fallback
}
