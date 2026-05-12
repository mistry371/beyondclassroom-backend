# Beyond Classroom — Frontend

Next.js 14 frontend for the Beyond Classroom mathematics learning platform.

**Live:** https://beyondclassroom.netlify.app

## Setup

```bash
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL to your backend URL
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (e.g. `https://your-backend.onrender.com/api`) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key |

## Deploy (Netlify)

- Build command: `npm run build`
- Publish directory: `.next`
- Plugin: `@netlify/plugin-nextjs` (auto-installed via netlify.toml)
- Set `NEXT_PUBLIC_API_URL` in Netlify environment variables

## Tech Stack

Next.js 14 · React 18 · Redux Toolkit · Tailwind CSS · Framer Motion · Recharts
