# 🚀 TicketSphere Manual Deployment Guide for Render

## 📋 Overview
This guide will help you manually deploy TicketSphere on Render using the Projects page without any payment requirements.

## 🏗️ Architecture
Your TicketSphere app consists of two separate services:
1. **Backend API** (Node.js Express server)
2. **Frontend** (React static site)

## 📦 Step-by-Step Manual Deployment

### 🔧 Step 1: Prepare Repository
✅ Your repository is already configured with:
- `requirements.txt` for Render compatibility
- Build scripts for both server and client  
- Proper package.json configurations
- Optimized Vite build with esbuild minifier
- Firebase v10+ with proper module handling
- No render.yaml (to avoid blueprint conflicts)

### 🖥️ Step 2: Deploy Backend API Service

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → **"Web Service"**
3. **Connect Repository**: 
   - Connect your GitHub account
   - Select repository: `GauravDeep25/TicketSphere`
4. **Configure Service**:
   ```
   Name: ticketsphere-api
   Root Directory: server
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

5. **Environment Variables** (Add in Render dashboard):
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://ticketsphere01_db_user:FnH1jzAOz5xIDA1u@ticketspherecluster.mcxvqml.mongodb.net/ticketsphere?retryWrites=true&w=majority&appName=TicketSphereCluster
   JWT_SECRET=4f8b5c2a9d6e1f3a8b7c5d2e9f6a3b8c5d2e9f6a3b8c5d2e9f6a3b8c5d2e9f6a3b
   JWT_EXPIRE=30d
   UPI_ID=7362065730@ptsbi
   MERCHANT_NAME=TicketSphere
   FIREBASE_PROJECT_ID=ticketsphere-0101
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@ticketsphere-0101.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_CONTENT_HERE\n-----END PRIVATE KEY-----\n"
   FIREBASE_PRIVATE_KEY_ID=your_private_key_id_here
   FIREBASE_CLIENT_ID=your_client_id_here
   EMAIL_SERVICE=gmail
   EMAIL_USER=support@ticketsphere.com
   ```

6. **Click "Create Web Service"**

### 🌐 Step 3: Deploy Frontend Static Site

1. **In Render Dashboard** → **"New +"** → **"Static Site"**
2. **Connect Same Repository**: `GauravDeep25/TicketSphere`
3. **Configure Static Site**:
   ```
   Name: ticketsphere-frontend
   Root Directory: client
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

4. **Environment Variables** (Add in Render dashboard):
   ```
   VITE_API_URL=https://ticketsphere-api.onrender.com/api
   VITE_FIREBASE_API_KEY=AIzaSyBvOkBwN6Va2yxaRPcHcL9H_z_XgT0xLDU
   VITE_FIREBASE_AUTH_DOMAIN=ticketsphere-0101.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=ticketsphere-0101
   VITE_FIREBASE_STORAGE_BUCKET=ticketsphere-0101.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890abcdef
   NODE_ENV=production
   ```

5. **Click "Create Static Site"**

## 🔄 Step 4: Update Frontend API URL

After backend deployment:
1. **Copy your backend URL** (e.g., `https://ticketsphere-api-xyz123.onrender.com`)
2. **Update frontend environment variable**:
   - Go to Frontend service settings
   - Update `VITE_API_URL` to your actual backend URL + `/api`
   - Example: `https://ticketsphere-api-xyz123.onrender.com/api`

## 🎯 Step 5: Final Configuration

### Update CORS in Backend
The backend is already configured to allow your Render frontend URLs.

### Update Firebase Configuration (Important!)
Replace the placeholder Firebase values with your actual Firebase project credentials:

**Backend Variables to Update**:
- `FIREBASE_PROJECT_ID`: Your actual Firebase project ID  
- `FIREBASE_CLIENT_EMAIL`: Your Firebase service account email
- `FIREBASE_PRIVATE_KEY`: Your Firebase service account private key (include the full key with -----BEGIN PRIVATE KEY----- headers)
- `FIREBASE_PRIVATE_KEY_ID`: Your Firebase private key ID
- `FIREBASE_CLIENT_ID`: Your Firebase client ID

**How to get Firebase Service Account credentials**:
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key" 
3. Download the JSON file
4. Extract the values for the environment variables above

**Frontend Variables to Update**:
- `VITE_FIREBASE_API_KEY`: Your actual Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain  
- `VITE_FIREBASE_PROJECT_ID`: Your Firebase project ID
- All other VITE_FIREBASE_* variables

## 🌟 Testing Your Deployment

1. **Backend Health Check**: Visit `https://your-backend-url.onrender.com/api/health`
2. **Frontend**: Visit your frontend URL
3. **Test Features**:
   - User registration/login
   - Email verification
   - Event creation and viewing
   - Database connectivity

## 🆓 Free Tier Benefits

✅ **No Payment Required**: Both services deploy on free tier
✅ **Automatic HTTPS**: SSL certificates included
✅ **Custom Domains**: Can add custom domain later
✅ **Automatic Deployments**: Updates when you push to GitHub
✅ **Logs & Monitoring**: Built-in logging and monitoring

## 📊 Expected URLs After Deployment
- **Backend API**: `https://ticketsphere-api.onrender.com`
- **Frontend**: `https://ticketsphere-frontend.onrender.com`
- **Health Check**: `https://ticketsphere-api.onrender.com/api/health`

## 🚨 Important Notes

1. **Cold Starts**: Free tier services sleep after 15 minutes of inactivity
2. **First Load**: May take 30-60 seconds to wake up
3. **MongoDB Atlas**: Ensure IP whitelist includes `0.0.0.0/0`
4. **Firebase Setup**: Update authorized domains in Firebase Console

## 🛠️ Troubleshooting

**Firebase Build Errors**:
- ✅ **FIXED**: Updated Firebase to v10.13.2 and Vite config for proper module handling
- ✅ **FIXED**: Configured Vite to handle Firebase modular imports correctly
- ✅ **FIXED**: Added proper chunking strategy for Firebase packages

**Vite Build Errors**:
- ✅ **FIXED**: Switched from Terser to esbuild minifier (faster, no extra dependencies)
- ✅ **FIXED**: Resolved "terser not found" error in production builds

**Build Failures**:
- Check environment variables are set correctly
- Verify root directory paths (server/ for backend, client/ for frontend)
- Firebase package resolution issues have been resolved

**CORS Errors**:
- Update FRONTEND_URL in backend environment variables
- Check Firebase authorized domains

**Database Connection**:
- Verify MongoDB Atlas connection string
- Check IP whitelist settings

**Common Firebase Issues**:
- ✅ **FIXED**: Added missing FIREBASE_PRIVATE_KEY and related environment variables
- Ensure Firebase environment variables are set correctly
- Check that Firebase project configuration matches your actual project  
- Verify authorized domains in Firebase Console

**MongoDB/Mongoose Issues**:
- ✅ **FIXED**: Removed duplicate transactionId index in Commission model
- If you see "Duplicate schema index" warnings, check for fields with both `unique: true` and explicit `.index()` calls

---

## 🎉 Success!

Your TicketSphere application is now deployed and ready for investor demonstrations!

**Perfect for showcasing**:
- Complete MERN stack architecture
- Real-time event management
- User authentication system  
- Professional deployment setup
- No payment information required

Happy demoing! 🚀
