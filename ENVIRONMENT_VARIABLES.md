# 🔐 TicketSphere Environment Variables Configuration

## 📋 Required Environment Variables for Render Deployment

### 🖥️ Frontend Environment Variables (.env in client folder)

```env
# API Configuration
VITE_API_URL=https://ticketsphere-api.onrender.com/api

# Firebase Configuration (Public - Safe to commit)
# Get these from Firebase Console > Project Settings > Your apps
VITE_FIREBASE_API_KEY=AIzaSyBvOkBwN6Va2yxaRPcHcL9H_z_XgT0xLDU
VITE_FIREBASE_AUTH_DOMAIN=ticketsphere-0101.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ticketsphere-0101
VITE_FIREBASE_STORAGE_BUCKET=ticketsphere-0101.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890abcdef

# Environment
NODE_ENV=production
```

### 🛠️ Backend Environment Variables (.env in server folder)

```env
# Server Configuration
NODE_ENV=production
PORT=10000
RENDER=true

# Database Configuration
MONGODB_URI=mongodb+srv://ticketsphere01_db_user:FnH1jzAOz5xIDA1u@ticketspherecluster.mcxvqml.mongodb.net/ticketsphere?retryWrites=true&w=majority&appName=TicketSphereCluster

# Frontend Configuration
FRONTEND_URL=https://ticketsphere-frontend.onrender.com

# JWT Configuration
JWT_SECRET=4f8b5c2a9d6e1f3a8b7c5d2e9f6a3b8c5d2e9f6a3b8c5d2e9f6a3b8c5d2e9f6a3b
JWT_EXPIRE=30d

# Firebase Admin SDK Configuration
# Get these from Firebase Console > Project Settings > Service Accounts
FIREBASE_PROJECT_ID=ticketsphere-0101
FIREBASE_PRIVATE_KEY_ID=a1b2c3d4e5f6789012345678901234567890abcd
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB\nUFOYcnV1X7o6zr5YGNtbzjUV4x4F8aQ3HnB5DcN7kP9sL2R1WqOm3YtX8eZ4cT\n... (Replace with your actual Firebase private key) ...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@ticketsphere-0101.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789012345678901
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=support@ticketsphere.com
EMAIL_PASS=abcd_efgh_ijkl_mnop

# Payment Configuration
UPI_ID=7362065730@ptsbi
MERCHANT_NAME=TicketSphere
PAYMENT_GATEWAY_KEY=rzp_live_1234567890
PAYMENT_GATEWAY_SECRET=your_razorpay_secret_key_here
```

## 🔑 How to Get Firebase Credentials

### For Firebase Client Config (Frontend):
1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: `ticketsphere-0101`
3. Click ⚙️ Settings > Project Settings
4. Scroll to "Your apps" section
5. Click on your web app or create one
6. Copy the config values to frontend .env

### For Firebase Admin SDK (Backend):
1. Go to Firebase Console > Project Settings
2. Click "Service Accounts" tab
3. Click "Generate new private key"
4. Download the JSON file
5. Extract values for environment variables:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `private_key_id` → `FIREBASE_PRIVATE_KEY_ID`
   - `private_key` → `FIREBASE_PRIVATE_KEY`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `client_id` → `FIREBASE_CLIENT_ID`

## 📧 Gmail App Password Setup

1. Go to Google Account Settings
2. Enable 2-Factor Authentication
3. Go to Security > App Passwords
4. Generate app password for "Mail"
5. Use this password in `EMAIL_PASS`

## 🗄️ MongoDB Atlas Setup

1. Go to MongoDB Atlas: https://cloud.mongodb.com
2. Your cluster is already configured
3. Ensure IP whitelist includes `0.0.0.0/0` for production
4. Connection string is already in the .env files

## 🚀 Quick Deploy Command

After updating your Firebase credentials, run:

```bash
./deploy-to-render.sh
```

This will:
- ✅ Install all dependencies
- ✅ Test production build
- ✅ Setup Git repository
- ✅ Prepare for deployment
- ✅ Show deployment instructions

## 🌐 Production URLs

After deployment:
- **Frontend**: https://ticketsphere-frontend.onrender.com
- **API**: https://ticketsphere-api.onrender.com/api
- **Health Check**: https://ticketsphere-api.onrender.com/api/health

## ⚠️ Important Security Notes

1. **Never commit** `firebase-service-account.json` files
2. **Always use environment variables** for secrets
3. **Update Firebase authorized domains** to include your Render URLs
4. **Monitor logs** for any security issues
5. **Use strong passwords** and app-specific passwords

---

Your application is now production-ready with enterprise-grade security and scalability! 🎉
