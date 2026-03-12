# 🚀 Deployment Guide

This guide covers deploying the Elite Mathematics Learning Platform to production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
- [Backend Deployment (Railway/Render)](#backend-deployment-railway-render)
- [Database Setup (MongoDB Atlas)](#database-setup-mongodb-atlas)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- GitHub account
- Vercel account (for frontend)
- Railway or Render account (for backend)
- MongoDB Atlas account
- Gmail account with App Password

---

## Environment Setup

### Production Environment Variables

#### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Configuration
MONGODB_URI=your-production-mongodb-uri

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-min-32-chars
JWT_EXPIRE=7d

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Elite Math Platform <your-email@gmail.com>

# OTP Configuration
OTP_EXPIRY=10
OTP_LENGTH=6

# Frontend URL
FRONTEND_URL=https://your-domain.vercel.app
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api
```

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Repository

1. Ensure all changes are committed:
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Your backend URL

6. Click "Deploy"

### Step 3: Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

---

## Backend Deployment (Railway/Render)

### Option A: Railway

1. Go to [Railway](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Configure:
   - **Root Directory**: `server`
   - **Start Command**: `node server-simple.js`

5. Add Environment Variables (all from backend .env)

6. Deploy

### Option B: Render

1. Go to [Render](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: elite-math-backend
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node server-simple.js`
   - **Instance Type**: Free or Starter

5. Add Environment Variables

6. Create Web Service

---

## Database Setup (MongoDB Atlas)

### Step 1: Create Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Choose a cloud provider and region
4. Create cluster

### Step 2: Configure Access

1. **Database Access**:
   - Create a database user
   - Set username and password
   - Grant read/write permissions

2. **Network Access**:
   - Add IP Address: `0.0.0.0/0` (allow from anywhere)
   - Or add specific IPs for better security

### Step 3: Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database password
5. Add to backend environment variables

### Step 4: Seed Data (Optional)

```bash
# Set MONGODB_URI in your local .env
cd server
node seed-complete-data.js
```

---

## Post-Deployment

### 1. Update Frontend URL

Update `FRONTEND_URL` in backend environment variables to your Vercel URL.

### 2. Update API URL

Update `NEXT_PUBLIC_API_URL` in frontend environment variables to your Railway/Render URL.

### 3. Test Email Service

1. Try registering a new user
2. Verify OTP email is received
3. Check spam folder if not in inbox

### 4. Test Core Features

- [ ] User registration with OTP
- [ ] User login
- [ ] Course browsing
- [ ] Course enrollment
- [ ] Dashboard access
- [ ] Calculator tools
- [ ] Admin panel access

### 5. Configure CORS

Ensure backend allows your frontend domain:

```javascript
// server/server-simple.js
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://your-domain.vercel.app'
  ],
  credentials: true
}
```

### 6. Set Up Monitoring

- Enable Vercel Analytics
- Set up error tracking (Sentry)
- Monitor API performance
- Set up uptime monitoring

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS only
- [ ] Set secure cookie flags
- [ ] Implement rate limiting
- [ ] Validate all inputs
- [ ] Sanitize user data
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB IP whitelist
- [ ] Set up backup strategy

---

## Performance Optimization

### Frontend
- Enable Next.js Image Optimization
- Implement lazy loading
- Use CDN for static assets
- Enable compression
- Minimize bundle size

### Backend
- Enable response compression
- Implement caching (Redis)
- Optimize database queries
- Use connection pooling
- Enable API rate limiting

---

## Troubleshooting

### Frontend Issues

**Build Fails**
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

**Environment Variables Not Working**
- Ensure variables start with `NEXT_PUBLIC_`
- Redeploy after adding variables
- Check Vercel dashboard for variables

### Backend Issues

**Database Connection Fails**
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Check database user permissions
- Ensure network access is configured

**Email Not Sending**
- Verify Gmail App Password
- Check email credentials
- Enable "Less secure app access" (if needed)
- Check spam folder

**CORS Errors**
- Add frontend URL to CORS whitelist
- Check credentials setting
- Verify origin configuration

### General Issues

**502 Bad Gateway**
- Check backend is running
- Verify API URL is correct
- Check backend logs

**Slow Performance**
- Enable caching
- Optimize database queries
- Use CDN for assets
- Upgrade server instance

---

## Monitoring & Maintenance

### Daily
- Check error logs
- Monitor uptime
- Review user feedback

### Weekly
- Review analytics
- Check database performance
- Update dependencies

### Monthly
- Security audit
- Performance review
- Backup verification
- Cost optimization

---

## Rollback Procedure

### Vercel (Frontend)
1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Railway/Render (Backend)
1. Go to Deployments
2. Select previous version
3. Redeploy

### Database
1. Restore from MongoDB Atlas backup
2. Or use manual backup

---

## Support

For deployment issues:
- Check logs in Vercel/Railway/Render dashboard
- Review MongoDB Atlas logs
- Email: mistryjenish1003@gmail.com
- Open GitHub issue

---

## Additional Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)

---

**🎉 Congratulations on deploying your platform!**
