# TicketSphere - Integrated Full Stack Deployment Guide

## � Quick Start (All Methods)

### Method 1: Single Command Startup (Recommended)
```bash
# Start both frontend and backend together
npm run dev

# Or use the startup script
./start.sh

# For production
./start.sh production
```

### Method 2: From Server Directory
```bash
cd server
npm run dev:full    # Development with both frontend and backend
npm run start:full  # Production with both frontend and backend
```

### Method 3: Manual (Traditional)
```bash
# Terminal 1 - Start backend
cd server && npm run dev

# Terminal 2 - Start frontend  
cd client && npm run dev
```

## 📋 Pre-Deployment Setup

### 1. Install All Dependencies
```bash
# Install root, server, and client dependencies
npm run install:all

# Or manually
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Environment Configuration
```bash
# Copy example environment file
cp server/.env.example server/.env

# Edit the .env file with your configurations
nano server/.env
```

## 🗂️ Final Integrated File Structure:
```
TicketSphere/
├── package.json (root - manages both frontend and backend)
├── start.sh (startup script)
├── server/
│   ├── src/
│   │   ├── server.js (serves frontend in production)
│   │   ├── middlewares/
│   │   │   └── authMiddleware.js (Firebase + JWT auth)
│   │   └── ...
│   ├── package.json (backend scripts)
│   └── .env
└── client/
    ├── src/
    │   ├── pages/
    │   │   ├── SellTicketsPage.jsx (optimized)
    │   │   └── ...
    │   └── ...
    ├── package.json (frontend scripts)
    └── dist/ (production build)
```

## 🚀 Startup Options

### Development Mode:
- **Root Directory**: `npm run dev` - Starts both with concurrently
- **Server Directory**: `npm run dev:full` - Same as above
- **Startup Script**: `./start.sh` - Includes dependency checks

### Production Mode:
- **Integrated**: Server serves frontend static files
- **Startup Script**: `./start.sh production` - Builds and serves
- **Manual**: `npm run build && npm run start`

## 🔧 Available Scripts (Root Level):

```bash
npm run dev              # Start both frontend and backend
npm run start            # Start server (serves frontend in production)
npm run build            # Build frontend for production
npm run server:dev       # Start only backend in dev mode
npm run server:start     # Start only backend in production
npm run client:dev       # Start only frontend in dev mode
npm run client:build     # Build frontend only
npm run install:all      # Install all dependencies
npm run clean           # Clean all node_modules
npm run lint            # Run frontend linting
```

## 🌐 Access URLs:

### Development:
- **Frontend**: http://localhost:5173 (or auto-assigned port)
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

### Production:
- **Full Application**: http://localhost:5000 (or PORT env variable)
- **API**: http://localhost:5000/api
- **Frontend**: Served from same port as backend

## 🔍 Integration Features:

### ✅ **Authentication Integration**:
- Backend accepts Firebase ID tokens
- Development mode token decoding
- JWT fallback for traditional auth
- Detailed logging for debugging

### ✅ **Static File Serving**:
- Production: Backend serves frontend build
- Development: Separate servers with CORS
- SPA routing handled correctly

### ✅ **Process Management**:
- Concurrently runs both processes
- Automatic port conflict resolution
- Graceful shutdown handling

### ✅ **Environment Management**:
- Shared environment configuration
- Development vs production modes
- Automatic dependency management

## 📊 Performance Optimizations:
- Single command startup
- Integrated build process
- Production-ready static serving
- Optimized CORS configuration
- Consolidated logging

## 🧪 Testing Integration:
- [x] Both services start simultaneously
- [x] API endpoints accessible from frontend
- [x] Authentication flow working
- [x] Static file serving in production
- [x] SPA routing properly handled

## 🚨 Troubleshooting:

### Port Conflicts:
```bash
# Kill processes on common ports
./start.sh  # Automatically handles this
```

### Dependencies Issues:
```bash
npm run clean       # Clean all node_modules
npm run install:all # Reinstall everything
```

### Environment Issues:
```bash
cp server/.env.example server/.env
# Edit server/.env with your actual values
```

## 📝 Production Deployment Notes:
- Use `NODE_ENV=production` for production builds
- Frontend is built and served by backend
- Single port deployment (easier for hosting)
- Environment variables properly configured
- MongoDB and Firebase connections working

## 🎯 **READY FOR DEPLOYMENT!**

The application now supports multiple startup methods:
1. **Single Command**: `npm run dev` (fastest development)
2. **Startup Script**: `./start.sh` (most robust)
3. **Production Ready**: Integrated static file serving
4. **Traditional**: Manual startup if needed

Both frontend and backend start simultaneously and are fully integrated! 🎉
