# Beyond Classroom

Online Mathematics Learning Platform — Full Stack LMS

## Project Structure

```
beyond-classroom/
├── frontend/     → Next.js 14 (deployed on Netlify)
└── backend/      → Node.js + Express (deployed on Render)
```

## Quick Start (Local)

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env    # fill in your values
node server-simple.js   # runs on port 5000

# 2. Frontend
cd frontend
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev              # runs on port 3000
```

## Deployment

| Service  | Platform | URL |
|----------|----------|-----|
| Frontend | Netlify  | https://beyondclassroom.netlify.app |
| Backend  | Render   | https://your-render-backend.onrender.com |

### Frontend (Netlify)
- Build command: `npm run build`
- Publish directory: `.next`
- Plugin: `@netlify/plugin-nextjs`
- Set env var: `NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com/api`

### Backend (Render)
- Build command: `npm install`
- Start command: `node server-simple.js`
- Set all env vars from `backend/.env.example`

## Tech Stack

- **Frontend**: Next.js 14, React 18, Redux Toolkit, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js, LowDB, JWT, Nodemailer
- **Integrations**: Zoom (Server-to-Server OAuth), Razorpay
