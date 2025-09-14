# 🚀 TicketSphere - Render Deployment Guide

## Complete Production Deployment Setup

### 🔧 Prerequisites
1. **Firebase Project**: Set up with authentication enabled
2. **MongoDB Atlas**: Database cluster with proper IP whitelisting (0.0.0.0/0 for production)
3. **Gmail App Password**: For email verification functionality
4. **Render Account**: Free tier sufficient for deployment

### 📁 Files Already Configured

✅ **render.yaml** - Complete deployment configuration
✅ **client/.env** - Production environment variables  
✅ **server/.env** - Server configuration with all required variables
✅ **CORS Configuration** - Production-ready cross-origin settings
✅ **Firebase Config** - Environment variable support for production

### 🚀 One-Click Deployment Steps

#### 1. **Push to GitHub** (Required)
```bash
# Initialize git repo if not already done
git init
git add .
git commit -m "Production ready deployment"

# Push to your GitHub repository
git remote add origin https://github.com/GauravDeep25/TicketSphere.git
git push -u origin main
```

#### 2. **Deploy to Render**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Select the repository containing your TicketSphere code
5. Render will automatically detect `render.yaml` and configure both services

#### 3. **Update Firebase Configuration (Important)**
Replace placeholder values in the following files with your actual Firebase config:

**client/.env:**
```env
VITE_FIREBASE_API_KEY=your_actual_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-actual-project-id
# ... etc
```

**server/.env & render.yaml:**
```env
FIREBASE_PROJECT_ID=your-actual-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n[your_actual_private_key]\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
# ... etc
```

### 🔄 What Gets Deployed

**Two Services Will Be Created:**

1. **ticketsphere-api** (Backend)
   - Node.js API server
   - MongoDB Atlas connection
   - Firebase authentication
   - Email verification system
   - URL: `https://ticketsphere-api.onrender.com`

2. **ticketsphere-frontend** (Frontend)
   - React static site
   - Vite build optimization
   - Firebase client integration
   - URL: `https://ticketsphere-frontend.onrender.com`

### 🌟 Zero-Configuration Features

- **Automatic SSL/TLS** - HTTPS enabled by default
- **Health Checks** - Server monitoring and auto-restart
- **Environment Variables** - All secrets properly configured
- **CORS** - Production-ready cross-origin settings
- **Build Optimization** - Automated production builds
- **CDN** - Global content delivery for frontend

### 🔐 Security Features Included

- **Environment Variables** - All sensitive data properly secured
- **CORS Protection** - Only allow legitimate origins
- **Firebase Auth** - Secure user authentication
- **MongoDB Atlas** - Encrypted database connection
- **JWT Tokens** - Secure API authentication
- **Email Verification** - Account security enforcement

### 📊 Monitoring & Logs

After deployment, you can:
- View real-time logs in Render dashboard
- Monitor service health and performance
- Set up alerts for downtime
- View deployment history and rollbacks

### 🚨 Important Notes

1. **Free Tier Limitations**:
   - Services sleep after 15 minutes of inactivity
   - Cold start time: ~30-60 seconds
   - 750 hours/month limit

2. **Domain Setup** (Optional):
   - Add custom domain in Render dashboard
   - Update CORS origins in server code
   - Update Firebase authorized domains

3. **MongoDB Atlas**:
   - Ensure IP whitelist includes `0.0.0.0/0` for production
   - Monitor connection limits on free tier

### 🛠 Troubleshooting

**Common Issues:**
- **Build Failures**: Check environment variables are set correctly
- **CORS Errors**: Verify frontend/backend URLs in CORS configuration
- **Firebase Errors**: Ensure all Firebase environment variables are correct
- **Database Connection**: Check MongoDB Atlas IP whitelist and connection string

### 📱 Testing Deployment

After deployment:
1. Visit your frontend URL
2. Test user registration/login
3. Verify email verification flow
4. Test event creation and booking
5. Check all payment flows work properly

---

## 🎉 Your App is Production Ready!

With this configuration, your TicketSphere application will be:
- ✅ Fully deployed and accessible via HTTPS
- ✅ Secured with proper authentication and authorization
- ✅ Connected to production MongoDB database
- ✅ Ready for real users and transactions
- ✅ Monitored and automatically maintained

**Frontend URL**: `https://ticketsphere-frontend.onrender.com`
**API URL**: `https://ticketsphere-api.onrender.com/api`

Happy deploying! 🚀
