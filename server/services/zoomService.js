/**
 * Zoom Meeting Service
 * 
 * Two modes:
 * 1. API Mode (Server-to-Server OAuth) — creates unique meeting per class
 *    Requires: ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET
 *    Setup: https://marketplace.zoom.us/develop/create → Server-to-Server OAuth
 *
 * 2. PMI Fallback Mode — uses your Personal Meeting ID for all classes
 *    Requires: ZOOM_PMI_LINK in .env
 *    Limitation: all classes share the same meeting room
 */

const https = require('https');

const ZOOM_ACCOUNT_ID   = process.env.ZOOM_ACCOUNT_ID;
const ZOOM_CLIENT_ID    = process.env.ZOOM_CLIENT_ID;
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;
const ZOOM_USER_ID      = process.env.ZOOM_USER_ID || 'me';
const ZOOM_PMI_LINK     = process.env.ZOOM_PMI_LINK;

// API mode: all three must be set and Account ID must not be placeholder
const isApiConfigured = () => !!(
  ZOOM_ACCOUNT_ID &&
  ZOOM_CLIENT_ID &&
  ZOOM_CLIENT_SECRET &&
  !ZOOM_ACCOUNT_ID.startsWith('REPLACE_') &&
  ZOOM_ACCOUNT_ID !== 'your_zoom_account_id'
);

// PMI fallback: just needs the link
const isPmiConfigured = () => !!(ZOOM_PMI_LINK && ZOOM_PMI_LINK.startsWith('https://'));

const isZoomConfigured = () => isApiConfigured() || isPmiConfigured();

// ─── Get OAuth access token ───────────────────────────────────────────────────
async function getAccessToken() {
  return new Promise((resolve, reject) => {
    const credentials = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64');
    const body = `grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`;

    const options = {
      hostname: 'zoom.us',
      path: '/oauth/token',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.access_token) {
            resolve(parsed.access_token);
          } else {
            console.error('Zoom token error response:', JSON.stringify(parsed));
            reject(new Error(parsed.reason || parsed.message || 'Failed to get Zoom token'));
          }
        } catch (e) {
          console.error('Zoom token raw response:', data);
          reject(new Error('Invalid Zoom token response'));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Get Zoom user ID (resolves 'me' to actual userId for admin scope) ────────
async function getZoomUserId(token) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.zoom.us',
      path: '/v2/users/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const p = JSON.parse(data);
          resolve(p.id || p.email || 'me');
        } catch { resolve('me'); }
      });
    });
    req.on('error', () => resolve('me'));
    req.end();
  });
}

// ─── Create meeting via API ───────────────────────────────────────────────────
async function createMeetingViaApi({ title, date, time, duration, topic }) {
  const token = await getAccessToken();
  const durationMinutes = parseInt(duration) || 60;
  const startTime = `${date}T${time}:00`;

  // Resolve actual user ID (admin scope requires explicit userId, not 'me')
  const userId = await getZoomUserId(token);

  const meetingData = JSON.stringify({
    topic: title || topic || 'Beyond Classroom Live Session',
    type: 2,
    start_time: startTime,
    duration: durationMinutes,
    timezone: 'Asia/Kolkata',
    agenda: topic || '',
    settings: {
      host_video: true,
      participant_video: true,
      join_before_host: false,
      mute_upon_entry: true,
      waiting_room: true,
      auto_recording: 'cloud',
    },
  });

  const result = await new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.zoom.us',
      path: `/v2/users/${userId}/meetings`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(meetingData),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.join_url) {
            resolve(parsed);
          } else {
            console.error('Zoom create meeting error:', JSON.stringify(parsed));
            resolve(parsed); // still resolve so we can check join_url below
          }
        } catch (e) { reject(new Error('Invalid Zoom API response')); }
      });
    });

    req.on('error', reject);
    req.write(meetingData);
    req.end();
  });

  if (result.join_url) {
    return {
      success: true,
      mode: 'api',
      zoomLink: result.join_url,
      startUrl: result.start_url,
      meetingId: String(result.id),
      password: result.password || '',
      message: 'Zoom meeting created via API'
    };
  }
  throw new Error(result.message || 'Zoom API meeting creation failed');
}

// ─── Main createMeeting (API first, PMI fallback) ─────────────────────────────
async function createMeeting({ title, date, time, duration, topic }) {
  // Try API mode first
  if (isApiConfigured()) {
    try {
      return await createMeetingViaApi({ title, date, time, duration, topic });
    } catch (error) {
      console.error('Zoom API failed, falling back to PMI:', error.message);
    }
  }

  // PMI fallback
  if (isPmiConfigured()) {
    console.log('Zoom not configured, using PMI fallback');
    return {
      success: true,
      mode: 'pmi',
      zoomLink: ZOOM_PMI_LINK,
      startUrl: ZOOM_PMI_LINK,
      meetingId: process.env.ZOOM_PMI_ID || null,
      password: '',
      message: 'Using Personal Meeting ID (PMI). All classes share this room.'
    };
  }

  // Nothing configured
  return {
    success: false,
    mode: 'none',
    zoomLink: null,
    meetingId: null,
    password: null,
    message: 'Zoom not configured. Set ZOOM_PMI_LINK or Server-to-Server OAuth credentials in .env'
  };
}

// ─── Delete meeting (API only — PMI cannot be deleted) ───────────────────────
async function deleteMeeting(meetingId) {
  if (!isApiConfigured() || !meetingId) return;
  // Don't delete PMI
  if (meetingId === process.env.ZOOM_PMI_ID) return;

  try {
    const token = await getAccessToken();
    await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.zoom.us',
        path: `/v2/meetings/${meetingId}`,
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      };
      const req = https.request(options, (res) => {
        res.on('data', () => {});
        res.on('end', resolve);
      });
      req.on('error', reject);
      req.end();
    });
  } catch (error) {
    console.error('Zoom delete error:', error.message);
  }
}

module.exports = { createMeeting, deleteMeeting, isZoomConfigured, isApiConfigured, isPmiConfigured };
