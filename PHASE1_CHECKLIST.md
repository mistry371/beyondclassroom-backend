# Phase 1 Platform Restructuring — Execution Checklist

## Status Legend: ✅ Done | 🔄 In Progress | ⬜ Pending

---

## 1. GLOBAL CHANGES
- ✅ Remove French from COURSE_CATEGORIES (lib/constants.js)
- ✅ Update metadata in layout.js (remove French, Class 10/12 references)
- ✅ Update brand description in marketingContent.js
- ✅ Remove French from Hero learning tracks
- ✅ Remove Class 10 / Class 12 from all references

## 2. HEADER NAVIGATION
- ✅ Navbar publicLinks already correct (Home, About Us, Our Packages, Course & Content, Our Partners, Our Team, Career & Contact Us)
- ✅ Remove "Start Free Trial" / "Sign Up Free" CTA from navbar (keep Sign In)
- ✅ MobileBottomNav — remove Tools and Live items

## 3. HOME PAGE
- ✅ Hero — Remove "Start Free Trial" button, remove French references, add Class 1–8 cards
- ✅ Stats — Keep only Active Students, remove others
- ✅ Remove: Why Choose Us section
- ✅ Remove: Learning Packages preview section
- ✅ Remove: Featured Courses section
- ✅ Remove: Earn With Us / Promoter CTA section
- ✅ Remove: Partners section (Trusted Institutional Collaborations)
- ✅ Remove: Trust section (Secure Razorpay, Verified Educators, Happy Students, Math Tools)
- ✅ Remove: TrustSection component
- ✅ Remove: Final CTA with "Mathematics & French"
- ✅ Update LiveStatsBar — remove French reference
- ✅ Update StickyCTA — remove French reference

## 4. ABOUT US PAGE
- ✅ Remove existing content
- ✅ Replace with Google Sites content (professional, responsive)

## 5. OUR PACKAGES PAGE
- ✅ Remove "Mathematics and French" from header text
- ✅ Remove free trial CTA at bottom
- ✅ Admin panel: Create /admin/packages page with full CRUD + visibility toggle + ordering

## 6. COURSE & CONTENT PAGE
- ✅ Remove French category filter
- ✅ Add Class 1–8 navigation structure
- ✅ Update header text (remove French)
- ✅ Guest browsing allowed, login only for purchase/downloads/progress

## 7. PROMO CODE SYSTEM
- ✅ Create /admin/promo-codes page with full CRUD

## 8. OUR TEAM PAGE
- ✅ Remove blue header section
- ✅ Remove categories from profiles
- ✅ Display as slider/carousel
- ✅ Remove Courses Designed, Success Rate stats section

## 9. CAREER & CONTACT PAGE
- ✅ Remove WhatsApp section/button
- ✅ Remove Promoter Opportunity section
- ✅ Remove Promoter Program Button
- ✅ Remove WhatsApp Team Button
- ✅ Remove Partnership Section
- ✅ Remove "How We Can Help" section
- ✅ Remove "We usually respond within 1 working day" text

## 10. FOOTER
- ✅ Logo size already increased (w-16/w-20)
- ✅ Remove Class 10, Class 12 from Subjects
- ✅ Remove Custom Request from Platform
- ✅ Remove Learning Hub from Platform
- ✅ Rename Faculty → Our Team (already done)
- ✅ Remove Grow section
- ✅ Remove Mobile Number

## 11. RESPONSIVENESS
- ✅ All pages mobile-first (existing Tailwind responsive classes maintained)
- ✅ Consistent spacing and typography preserved

---
*Generated: Phase 1 Implementation*
