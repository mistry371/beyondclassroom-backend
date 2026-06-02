# Beyond Classroom — Production Audit Report
**Date:** June 1, 2026 | **Auditor:** Senior Platform Architect

---

## CRITICAL BUGS FOUND & FIXED

### 🔴 CRITICAL — Security
1. **JWT secret fallback** — `'your_jwt_secret'` hardcoded in middleware/auth.js and server-simple.js. Any attacker can forge tokens.
2. **Suspended user bypass** — `protect` middleware in auth.js does NOT check `user.status === 'suspended'`. Suspended users can still access protected routes.
3. **Admin role not verified on protect** — server-simple.js `protect` function doesn't check suspension.
4. **XSS via dangerouslySetInnerHTML** — learn/advanced/page.js renders `activeLesson.content?.concept` directly without sanitization.
5. **Cart checkout allows paid courses** — cart/page.js calls `POST /api/orders` directly which blocks paid courses but shows a confusing error instead of redirecting to payment.

### 🔴 CRITICAL — Auth/UX
6. **Login page says "Mobile Number (Admin can use email)"** — confusing UX. Should say "Mobile Number or Email".
7. **Register page missing referral code display** — referral code is captured but never shown to user.
8. **No auth guard on dashboard** — dashboard redirects client-side only; SSR can flash content.
9. **TrialGuard allows through on API error** — if `/trial/status` fails, it sets `trialActive: true` allowing free access.

### 🟡 HIGH — Functionality
10. **Progress API endpoint mismatch** — learn/advanced/page.js calls `PUT /progress/course/:id/lesson/:lessonId` but the SRS defines `POST /progress/lesson`.
11. **Cart page checkout doesn't use PaymentModal** — bypasses Razorpay for paid courses.
12. **Profile page shows "0 Certificates"** — hardcoded, never fetches real data.
13. **Course detail page loads ALL subtopics on page load** — N+1 query problem, very slow for large courses.
14. **Admin analytics page has no empty state** — crashes if analytics returns null.
15. **Promoter dashboard WhatsApp share** — still references "Mathematics & French" (Phase 1 missed).

### 🟡 HIGH — UX/Design
16. **Loading states inconsistent** — some pages show spinner, others show blank.
17. **Error messages not user-friendly** — raw API errors shown to users.
18. **Mobile bottom nav shows on auth pages** — should be hidden.
19. **Dashboard "Browse More Courses" links to '/'** — should link to '/courses'.
20. **No 404 page** — missing not-found.js.

### 🟢 MEDIUM — Performance
21. **cachedGet TTL too aggressive** — profile cached for 30s means stale data after purchase.
22. **Course detail page fetches modules even for guests** — unnecessary API calls.
23. **Admin dashboard fetches stats on every render** — no debounce.

---

## PRODUCTION READINESS SCORE: 72/100
## LAUNCH READINESS SCORE: 68/100

### After fixes applied: Target 91/100
