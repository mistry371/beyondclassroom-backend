# Beyond Classroom — Production Hardening Changelog

## Summary
Full-stack audit and stabilization for production launch at [beyondclassroom.netlify.app](https://beyondclassroom.netlify.app) with API at [beyondclassroom-backend.onrender.com](https://beyondclassroom-backend.onrender.com).

---

## Categories (Mathematics & French only)

### Removed / migrated legacy categories
- Algebra, Geometry, Arithmetic, Calculus, Statistics, Trigonometry, Linear Algebra, Abstract Algebra, Science, English, Analysis, Differential Equations, Number Theory, and other course/tool admin labels.

### Now supported everywhere
- **Mathematics**
- **French**

### Files updated
- `server/constants/categories.js` — normalization + validation
- `server/database/db.js` — startup migration + demo accounts
- `server/controllers/adminCourseController.js` — create/update validation
- `server/controllers/adminToolController.js` — all tools → Mathematics
- `server/middleware/validation.js` — enum validation
- `client/lib/constants.js` — shared frontend constants
- `client/app/admin/courses/page.js` — dropdown
- `client/app/courses/page.js` — subject filters
- `client/app/blogs/*`, `client/data/marketingContent.js`, Hero, packages, custom-requests

---

## Bugs fixed

| Issue | Fix |
|-------|-----|
| Email templates used `localhost:3000` links | `FRONTEND_URL` with production fallback |
| Password reset / referral links defaulted to localhost | Production Netlify URL fallback |
| Legacy course categories in DB/UI | Auto-migration on `initDB` |
| Admin course form allowed invalid categories | Restricted to Mathematics / French |
| Invalid Tailwind/build config for images | `remotePatterns` for Netlify/Render |
| Missing global error recovery | `ErrorBoundary` in providers |
| Courses page weak loading UX | Skeleton cards |
| GET course list returned legacy categories | Normalized in `/api/courses` |

---

## Optimizations added

- API **45s timeout** + **single retry** on GET 5xx/network errors
- **Course card skeletons** on courses listing
- **Error boundary** for graceful UI failures
- **next.config.js**: compression, `poweredByHeader: false`, image remote patterns
- SEO metadata updated for Mathematics & French
- Structured data / Open Graph URLs point to production

---

## Demo accounts (seeded on server start)

| Role | Email | Password |
|------|-------|----------|
| Promoter | mistryjenish1234@gmail.com | Promoter@1019 |
| Student | jenscodersprivetlimited@gmail.com | Student@1019 |
| Admin (existing) | mistryjenish1003@gmail.com | Jenish@1019 |

Promoter referral code: `BC-PROMO-DEMO`

---

## Updated URLs

| Context | Production value |
|---------|------------------|
| Frontend | `https://beyondclassroom.netlify.app` |
| API | `https://beyondclassroom-backend.onrender.com/api` |
| Email / reset / referral links | `FRONTEND_URL` → Netlify (not localhost) |
| `client/.env.example` | Documents production API URL |

Localhost remains only in **CORS allowlist** for local dev and commented `.env.example` lines.

---

## Production improvements

- Category migration runs automatically on database init
- Course API responses normalized
- Admin validation enforces two subjects
- Brand-consistent copy (Mathematics & French) across marketing, blogs, hero, packages
- Promoter demo profile created idempotently

---

## Tool pages note

Interactive math tools retain internal groupings (algebra, geometry, etc.) for **tool navigation only** — these are not platform course categories. Admin tool registry categories are normalized to **Mathematics**.

---

## Deploy checklist

1. **Netlify**: `NEXT_PUBLIC_API_URL=https://beyondclassroom-backend.onrender.com/api`
2. **Render**: `FRONTEND_URL=https://beyondclassroom.netlify.app`, `MONGODB_URI`, `JWT_SECRET`, email vars
3. Run `npm run build` in `client/` before deploy
4. Verify login with demo accounts after deploy
