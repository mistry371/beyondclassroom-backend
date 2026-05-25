# Phase 2 — Performance, Conversion & Growth Changelog

## Performance optimization

### Bundle & code splitting
| Before | After |
|--------|-------|
| `/tools` eagerly imported **40 tool components** (~292 kB First Load) | **Dynamic imports** via `lib/toolRegistry.js` — only active tool loads |
| Tool metadata in `data/toolDefinitions.js` | Sidebar/icons without heavy JS |

### Global load reduction
- **Removed MathJax CDN** from root layout (unused; `MathRenderer` is custom — saves ~200KB+ blocking JS on every page)
- MathJax was `beforeInteractive`; layout now uses `dns-prefetch` for API only
- `AITutor` / `ScreenProtection` keep `dynamic()` with null loading state

### Caching
- `lib/apiCache.js` + `cachedGet()` — 90–120s TTL for `/courses` on home & courses pages (stale-while-revalidate pattern)

### Loading UX
- `app/loading.js` — root route loader
- `app/tools/loading.js` — tools-specific skeleton
- `CourseCardSkeleton` on homepage featured courses

### CSS / animation
- `.gpu-accelerated`, `.scroll-smooth-touch`, `.magnetic-btn`
- `prefers-reduced-motion` disables heavy animations
- Hero: fewer floating symbols on mobile (6 vs 10)

### Expected Lighthouse impact (estimate)
| Metric | Direction |
|--------|-----------|
| Performance | +15–30 pts (MathJax removal + tools split) |
| SEO | +5–10 (sitemap, metadata, landing pages) |
| Accessibility | Improved semantic sections + aria labels |
| Best Practices | `poweredByHeader` already off |

*Run Lighthouse on deployed Netlify for exact scores.*

---

## Conversion optimization

- **LiveStatsBar** — real-time-style student counter on homepage
- **StickyCTA** — dual CTAs: “Start Learning Today” + “Practice”
- **TrustSection** — verified educators, secure payments, trust badges
- **Homepage CTA copy** — parent-trust + Mathematics & French messaging
- **Packages** — “Save 40%” urgency on popular plan, glowing badge
- **Footer** — Subjects links, secure payment line, premium layout

---

## Promoter system upgrade

- **Onboarding tour** (`PromoterOnboarding`) — 4-step first-time flow
- **QR code** — referral QR via api.qrserver.com
- **WhatsApp share** — one-tap share with pre-filled message
- **Conversion rate** — backend + dashboard stat card
- **Badges** — milestone badges from referral/earnings/streak
- **Leaderboard** — top 5 promoters on dashboard
- **Payout history** — dedicated panel
- **GPU-optimized** cards and charts

Backend: `referralService.getPromoterDashboard` returns `conversionRate`, `badges`.

---

## Mobile-first

- Bottom nav (existing `MobileBottomNav`) unchanged
- Sticky CTA positioned above bottom nav (`bottom-20` on mobile)
- Touch-friendly scroll areas on promoter lists
- Reduced motion support

---

## SEO & growth

| Asset | Path |
|-------|------|
| Sitemap | `app/sitemap.js` → `/sitemap.xml` |
| Robots | `app/robots.js` |
| Metadata helper | `lib/seo.js` |
| Mathematics landing | `/learn/mathematics` |
| French landing | `/learn/french` |
| Grade hubs | `/grades/grade-6` … `/grades/grade-12` |
| Layout | `metadataBase`, template titles, canonical URLs |

---

## Files added

- `client/lib/toolRegistry.js`, `apiCache.js`, `seo.js`
- `client/data/toolDefinitions.js`
- `client/components/ui/ToolPanelSkeleton.js`
- `client/components/marketing/TrustSection.js`, `LiveStatsBar.js`, `MagneticButton.js`
- `client/components/promoter/PromoterOnboarding.js`
- `client/app/loading.js`, `tools/loading.js`, `sitemap.js`, `robots.js`
- `client/app/learn/mathematics/page.js`, `learn/french/page.js`
- `client/app/grades/[grade]/page.js`

---

## Optimized components (modified)

- `app/tools/page.js`, `app/layout.js`, `app/page.js`, `app/courses/page.js`, `app/packages/page.js`
- `app/promoter/dashboard/page.js`, `components/Hero.js`, `Footer.js`, `StickyCTA.js`
- `utils/api.js`, `globals.css`
- `server/services/referralService.js`

---

## Deployment readiness

1. Run `npm run build` in `client/` — must pass
2. Deploy frontend to Netlify; backend to Render (promoter API changes)
3. Verify `/tools` loads one tool at a time in Network tab
4. Verify `/sitemap.xml` and `/robots.txt`
5. Test promoter dashboard: QR, WhatsApp, tour, withdrawal

---

## Not changed (by design)

- All existing sections preserved on homepage
- Auth, payment, cart, learn, admin flows untouched
- Tool **filter categories** (algebra, geometry, etc.) remain internal navigation labels
