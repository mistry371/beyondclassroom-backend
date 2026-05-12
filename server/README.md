# Beyond Classroom — Backend

Node.js + Express API server for the Beyond Classroom mathematics learning platform.

**Live:** https://your-backend.onrender.com

## Setup

```bash
npm install
cp .env.example .env
# Fill in all values in .env
node server-simple.js
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `JWT_SECRET` | Secret key for JWT signing |
| `EMAIL_USER` | Gmail address for sending emails |
| `EMAIL_PASS` | Gmail app password |
| `ZOOM_ACCOUNT_ID` | Zoom Server-to-Server OAuth Account ID |
| `ZOOM_CLIENT_ID` | Zoom Client ID |
| `ZOOM_CLIENT_SECRET` | Zoom Client Secret |
| `FRONTEND_URL` | Frontend URL for CORS (e.g. `https://beyondclassroom.netlify.app`) |

## Deploy (Render)

- Build command: `npm install`
- Start command: `node server-simple.js`
- Set all env vars in Render dashboard

## API

Base URL: `https://your-backend.onrender.com/api`

See full API reference in the SRS document.

## Tech Stack

Node.js · Express.js · LowDB · JWT · bcryptjs · Nodemailer · Zoom API
