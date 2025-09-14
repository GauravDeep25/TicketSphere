# 🔐 TicketSphere Environment Variables Configuration

## Overview

This guide covers all environment variables needed for TicketSphere deployment on Render and local development.

## 🚨 Critical Fix: Firebase Private Key Formatting

**If you're seeing "Failed to parse private key: Error: Invalid PEM formatted message"**, see [FIREBASE_ENVIRONMENT_FIX.md](./FIREBASE_ENVIRONMENT_FIX.md) for immediate resolution steps.

## 🖥️ Backend Environment Variables (server/.env)

### Required for Production (Render)

```env
# Database
MONGODB_URI=mongodb+srv://ticketsphere01_db_user:FnH1jzAOz5xIDA1u@ticketspherecluster.mcxvqml.mongodb.net/ticketsphere?retryWrites=true&w=majority&appName=TicketSphereCluster

# Server Configuration
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://ticketsphere-frontend.onrender.com

# JWT Security
JWT_SECRET=4f8b5c2a9d6e1f3a8b7c5d2e9f6a3b8c5d2e9f6a3b8c5d2e9f6a3b8c5d2e9f6a3b
JWT_EXPIRE=30d

# Firebase Admin SDK - CRITICAL: Use proper formatting for Render
FIREBASE_PROJECT_ID=ticketsphere-0101
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB
[...your actual private key content...]
-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@ticketsphere-0101.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY_ID=your_private_key_id_here
FIREBASE_CLIENT_ID=your_client_id_here
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token

# Payment Configuration
UPI_ID=7362065730@ptsbi
MERCHANT_NAME=TicketSphere

# Email Configuration (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=support@ticketsphere.com
EMAIL_PASS=your_app_password_here

# Render Specific
RENDER=true
```

## 🌐 Frontend Environment Variables (client/.env)

### Required for Production (Render Static Site)

```env
# API Configuration
VITE_API_URL=https://ticketsphere-api.onrender.com/api

# Firebase Client Configuration (Public - Safe to expose)
VITE_FIREBASE_API_KEY=AIzaSyBvOkBwN6Va2yxaRPcHcL9H_z_XgT0xLDU
VITE_FIREBASE_AUTH_DOMAIN=ticketsphere-0101.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ticketsphere-0101
VITE_FIREBASE_STORAGE_BUCKET=ticketsphere-0101.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890abcdef

# App Configuration
NODE_ENV=production
```

## 🔧 Local Development Environment Variables

### Backend (server/.env)

```env
# Database - Development
MONGODB_URI=mongodb://localhost:27017/ticketsphere

# Server Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5174

# JWT Security
JWT_SECRET=development_jwt_secret_key_min_32_chars_long
JWT_EXPIRE=30d

# Firebase - Use service account file for development
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=config/firebase-service-account.json

# Payment Configuration
UPI_ID=your_test_upi@bank
MERCHANT_NAME=TicketSphere

# Email Configuration (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your_test_email@gmail.com
EMAIL_PASS=your_app_password
```

### Frontend (client/.env)

```env
# API Configuration
VITE_API_URL=http://localhost:3001/api

# Firebase Client Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Development Configuration
NODE_ENV=development
VITE_DEBUG=true
```

## 🔥 Firebase Configuration Guide

### Method 1: Environment Variables (Production - Render)

**Critical**: For Render deployment, format the private key correctly:

1. **Get Service Account Key**:
   - Firebase Console → Project Settings → Service Accounts
   - Generate new private key
   - Download JSON file

2. **Format Private Key for Render**:
   ```env
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
   [Your multiline private key content here]
   -----END PRIVATE KEY-----"
   ```

3. **Set in Render Dashboard**:
   - Go to your backend service
   - Environment tab
   - Add all Firebase variables

### Method 2: Service Account File (Development)

1. Download Firebase service account key JSON
2. Save as `server/config/firebase-service-account.json`
3. Set environment variable:
   ```env
   FIREBASE_SERVICE_ACCOUNT_KEY_PATH=config/firebase-service-account.json
   ```

## 🚀 Render Deployment Steps

### 1. Backend Service Environment Variables

In Render dashboard for your backend service, set:

```env
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=production
PORT=10000
JWT_SECRET=your_secure_jwt_secret_32_chars_minimum
FRONTEND_URL=https://your-frontend.onrender.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
[multiline private key]
-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY_ID=your_key_id
FIREBASE_CLIENT_ID=your_client_id
UPI_ID=your_upi_id
MERCHANT_NAME=YourAppName
```

### 2. Frontend Static Site Environment Variables

In Render dashboard for your static site, set:

```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
NODE_ENV=production
```

## 🔍 Troubleshooting

### Common Issues

1. **Firebase Private Key Error**:
   - Ensure proper multiline formatting in quotes
   - No `\n` escape characters needed in Render
   - Include full key with headers

2. **CORS Errors**:
   - Verify `FRONTEND_URL` matches your actual frontend URL
   - Check Firebase authorized domains

3. **Database Connection**:
   - Verify MongoDB Atlas IP whitelist (use 0.0.0.0/0 for Render)
   - Check connection string format

4. **JWT Errors**:
   - Ensure JWT_SECRET is at least 32 characters
   - Use secure, random secret for production

## 📚 Related Documentation

- [FIREBASE_ENVIRONMENT_FIX.md](./FIREBASE_ENVIRONMENT_FIX.md) - Fix Firebase private key errors
- [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [server/config/FIREBASE_SETUP.md](./server/config/FIREBASE_SETUP.md) - Detailed Firebase setup

## 🔐 Security Notes

### Never Commit to Git
- `.env` files
- `firebase-service-account.json`
- Any file containing private keys or secrets

### Environment Variable Security
- Use Render's environment variable system for production
- Keep development and production configs separate
- Regularly rotate secrets and keys

### Firebase Security
- Restrict API keys by domain/app
- Update security rules for production
- Monitor authentication logs