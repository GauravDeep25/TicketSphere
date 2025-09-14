# ✅ TicketSphere Deployment Checklist

## Pre-Deployment Setup
- [x] Repository configured for manual deployment
- [x] render.yaml removed to avoid blueprint conflicts
- [x] requirements.txt created for Render compatibility
- [x] Build scripts created for both server and client
- [x] Environment variables documented

## Backend Service Deployment
- [ ] Create new Web Service on Render
- [ ] Connect GitHub repository: GauravDeep25/TicketSphere
- [ ] Set root directory: `server`
- [ ] Set build command: `npm install`
- [ ] Set start command: `npm start`
- [ ] Add all environment variables from MANUAL_DEPLOYMENT_GUIDE.md
- [ ] Deploy and verify health check endpoint

## Frontend Service Deployment
- [ ] Create new Static Site on Render
- [ ] Connect same GitHub repository
- [ ] Set root directory: `client`
- [ ] Set build command: `npm install && npm run build`
- [ ] Set publish directory: `dist`
- [ ] Add all VITE_ environment variables
- [ ] Update VITE_API_URL with actual backend URL

## Post-Deployment Configuration
- [ ] Update Firebase credentials with actual values
- [ ] Test user registration and login
- [ ] Verify email verification system
- [ ] Test event creation and viewing
- [ ] Check MongoDB database connectivity
- [ ] Verify all API endpoints working

## Firebase Configuration
- [ ] Update Firebase authorized domains
- [ ] Add Render URLs to Firebase Console
- [ ] Test authentication flows
- [ ] Verify email verification emails

## Final Testing
- [ ] Frontend loads without errors
- [ ] Backend API responds to health checks
- [ ] User authentication works
- [ ] Database operations successful
- [ ] All features functional for demo

## 🎯 Ready for Investor Demo!

Expected URLs:
- Backend: https://ticketsphere-api.onrender.com
- Frontend: https://ticketsphere-frontend.onrender.com
- Health: https://ticketsphere-api.onrender.com/api/health
