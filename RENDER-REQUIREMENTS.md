# TicketSphere - Render Deployment Requirements

## Project Structure
- **Backend**: Node.js with Express
- **Frontend**: React with Vite
- **Database**: MongoDB Atlas
- **Authentication**: Firebase

## Node.js Dependencies

### Backend (server/package.json)
```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "firebase-admin": "^12.1.1",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.0.0",
    "nodemailer": "^6.9.14",
    "qrcode": "^1.5.3"
  }
}
```

### Frontend (client/package.json)
```json
{
  "dependencies": {
    "axios": "^1.11.0",
    "firebase": "^12.2.1",
    "lucide-react": "^0.544.0",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.8.2"
  }
}
```

## Render Configuration

### Backend Service Settings
- **Environment**: Node.js 18+
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Auto-Deploy**: Yes

### Frontend Service Settings  
- **Environment**: Static Site
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Auto-Deploy**: Yes

## Required Environment Variables for Render

### Backend Environment Variables (Set in Render Dashboard)
```
MONGODB_URI=mongodb+srv://ticketsphere01_db_user:FnH1jzAOz5xIDA1u@ticketspherecluster.mcxvqml.mongodb.net/ticketsphere?retryWrites=true&w=majority&appName=TicketSphereCluster
NODE_ENV=production
PORT=10000
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure_for_production_use
JWT_EXPIRE=30d
FRONTEND_URL=https://your-frontend-app.onrender.com
UPI_ID=7362065730@ptsbi
MERCHANT_NAME=TicketSphere
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=config/firebase-service-account.json
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@domain.com
EMAIL_PASS=your_secure_app_password
```

### Frontend Environment Variables (Set in Render Dashboard)
```
VITE_API_URL=https://your-backend-app.onrender.com/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## External Services Required
- MongoDB Atlas (Database)
- Firebase (Authentication)
- Gmail SMTP (Email notifications - optional)

## Files to Upload
- All source code (sensitive files already excluded by .gitignore)
- Firebase service account key (upload separately to Render)

## Deployment Steps
1. Push code to GitHub repository
2. Create Backend service on Render
3. Create Frontend service on Render  
4. Set environment variables in Render dashboard
5. Upload Firebase service account key
6. Deploy both services

## Health Checks
- Backend: GET /api/health
- Frontend: Root URL loads successfully
- Database: MongoDB connection established
- Auth: Firebase authentication working
