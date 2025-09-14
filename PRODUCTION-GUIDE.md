# TicketSphere Production Deployment Guide

## Pre-deployment Checklist

### 1. Environment Setup
- [ ] Copy `.env.example` to `.env` in both client and server directories
- [ ] Update MongoDB connection string with production database
- [ ] Generate secure JWT secret (min 32 characters)
- [ ] Configure Firebase service account key
- [ ] Set production domain URLs
- [ ] Configure email service credentials
- [ ] Update UPI payment details

### 2. Security Configuration
- [ ] All sensitive data removed from codebase
- [ ] Environment variables properly configured
- [ ] CORS settings restricted to production domains
- [ ] Rate limiting enabled
- [ ] Firebase security rules updated

### 3. Build Configuration
- [ ] Client build optimized for production
- [ ] Server configured for production mode
- [ ] Static assets properly served
- [ ] Gzip compression enabled

## Deployment Commands

### Local Production Test
```bash
# Build client
cd client
npm run build

# Start server in production mode
cd ../server
NODE_ENV=production npm start

# Serve client build (optional)
cd ../client
npm run preview
```

### Production Deployment

#### Option 1: Single Server Deployment
```bash
# Install dependencies
npm install --production

# Build client
cd client && npm run build && cd ..

# Start server
cd server && NODE_ENV=production npm start
```

#### Option 2: Docker Deployment
```bash
# Build Docker images
docker build -t ticketsphere-client ./client
docker build -t ticketsphere-server ./server

# Run containers
docker-compose up -d
```

## Environment Variables Setup

### Server (.env)
```env
MONGODB_URI=your_mongodb_production_uri
NODE_ENV=production
JWT_SECRET=your_secure_jwt_secret_32_chars_minimum
FRONTEND_URL=https://yourdomain.com
UPI_ID=your_production_upi_id@bank
```

### Client (.env)
```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_FIREBASE_API_KEY=your_firebase_api_key
```

## Performance Optimizations

### Client Optimizations
- [x] Vite build optimization enabled
- [x] CSS optimized with custom classes instead of inline styles
- [x] React components optimized
- [x] Lazy loading implemented where needed

### Server Optimizations  
- [x] Debug logs removed in production
- [x] Error handling improved
- [x] MongoDB queries optimized
- [x] Middleware order optimized

## Security Measures

### Data Protection
- [x] Sensitive credentials removed from codebase
- [x] Environment variables used for secrets
- [x] MongoDB connection secured
- [x] JWT tokens properly configured

### API Security
- [x] CORS properly configured
- [x] Input validation implemented
- [x] Authentication middleware secured
- [x] Rate limiting ready for implementation

## Post-deployment Monitoring

### Health Checks
- Server health endpoint: `/api/health`
- Database connection monitoring
- Payment system monitoring
- Authentication service monitoring

### Logs Monitoring
- Server error logs
- Payment transaction logs
- Authentication logs
- Performance metrics

## Rollback Plan

### Quick Rollback
```bash
# Keep previous version backup
git tag v1.0.0-backup
git checkout main

# Deploy previous stable version
npm run deploy:rollback
```

## Support Contacts
- Development Team: [contact details]
- DevOps Team: [contact details]
- Database Team: [contact details]
