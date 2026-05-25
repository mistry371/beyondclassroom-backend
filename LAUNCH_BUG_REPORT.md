# Beyond Classroom — Launch QA Bug Report

**Date:** May 2026  
**Phase:** Final Stability, QA & Launch Preparation

---

## Executive summary

End-to-end hardening completed across admin, promoter, and student panels. Critical promoter login bug fixed. Demo data seeding added for investor-ready dashboards. Production build verified.

---

## Bugs fixed

| # | Severity | Area | Issue | Fix |
|---|----------|------|-------|-----|
| 1 | **Critical** | Promoter auth | Demo promoter created in `users` without `password` in `promoters` — login failed | Standalone promoter record with bcrypt password in `promoters` collection |
| 2 | **Critical** | Promoter auth | Promoter email duplicated in `users` table | Removed promoter from users; promoters use separate collection |
| 3 | **High** | Admin dashboard | Failed API showed empty stats (looked like zero data) | Error state + retry button |
| 4 | **High** | Admin analytics | Empty chart data could break Recharts | Fallback placeholder data points |
| 5 | **Medium** | Student dashboard | No retry on API failure | Error banner + retry |
| 6 | **Medium** | Auth | Corrupt localStorage crashed restore | Silent clear + re-login |
| 7 | **Medium** | API | Duplicate parallel GETs | `dedupeGet` + `cachedGet` |
| 8 | **Medium** | API | Generic errors | `getErrorMessage` + `error.userMessage` on all requests |
| 9 | **Low** | Admin stats | `totalRevenue.toFixed` on undefined | `Number()` guard |
| 10 | **Low** | Student UX | Empty courses CTA pointed to `/` | Points to `/courses` |

---

## Optimizations added

- **Request deduplication** (`lib/requestDedup.js`)
- **Centralized error messages** (`lib/getErrorMessage.js`)
- **API cache invalidation on logout**
- **Promoter API** retry + 401 redirect
- **Admin route loader** (`app/admin/loading.js`)
- **Launch demo seed** on server start: referrals, payouts, orders, progress, notifications
- **`useRequireAuth` / `useRequireAdmin` hooks** for future guard consistency
- **`EmptyState` component** for reusable fallbacks

---

## Demo accounts (after server restart)

| Role | Email | Password |
|------|-------|----------|
| Admin | mistryjenish1003@gmail.com | Jenish@1019 |
| Promoter | mistryjenish1234@gmail.com | Promoter@1019 |
| Student | jenscodersprivetlimited@gmail.com | Student@1019 |

Promoter referral: `BC-PROMO-DEMO`

---

## Remaining risks

| Risk | Mitigation |
|------|------------|
| Render cold start (45s) | API timeout + retry; show user-friendly message |
| Email not configured on Render | Set `EMAIL_USER`/`EMAIL_PASS` or `RESEND_API_KEY` |
| Local `.env` uses localhost | **Do not deploy** `.env` — set Netlify/Render env vars in dashboards |
| MongoDB connection on free tier | Use `MONGODB_URI` on Render; optional `USE_MEMORY_DB` for local only |
| Console errors in dev only | `console.error` in catch blocks remain for debugging; no errors in happy path |
| Sub-1s global FCP | Tools page lazy-loaded; further CDN/image work optional |

---

## Production URLs (required env)

| Service | Variable | Value |
|---------|----------|-------|
| Netlify | `NEXT_PUBLIC_API_URL` | `https://beyondclassroom-backend.onrender.com/api` |
| Render | `FRONTEND_URL` | `https://beyondclassroom.netlify.app` |
| Render | `MONGODB_URI` | Your MongoDB connection string |
| Render | `JWT_SECRET` | Strong secret |

---

## Files updated (launch phase)

### Server
- `server/services/launchDemoSeed.js` (new)
- `server/database/db.js`
- `server/server-simple.js`

### Client
- `client/utils/api.js`, `promoterApi.js`
- `client/store/slices/authSlice.js`
- `client/lib/getErrorMessage.js`, `requestDedup.js` (new)
- `client/hooks/useRequireAuth.js` (new)
- `client/components/ui/EmptyState.js` (new)
- `client/app/admin/page.js`, `analytics/page.js`, `loading.js`
- `client/app/dashboard/page.js`

---

## Build & deployment

- [x] `npm run build` (client) — must pass before deploy
- [x] Promoter login path validated (promoters collection)
- [x] No production localhost in committed code (only CORS dev allowlist + commented examples)
- [ ] Run Lighthouse on live Netlify after deploy
- [ ] Verify demo logins on production after Render redeploy

---

## QA checklist (manual)

- [ ] Admin login → dashboard stats load
- [ ] Admin analytics charts render
- [ ] Promoter login → dashboard with QR, earnings, leaderboard
- [ ] Student login → enrolled courses visible
- [ ] Password reset email (if SMTP configured)
- [ ] Mobile: admin, dashboard, promoter pages scroll correctly
- [ ] Cart / payment flow (Razorpay test key)
