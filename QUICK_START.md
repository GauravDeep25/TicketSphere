# TicketSphere - Quick Start Guide

## 🚀 Starting the Application

**Simple Command** to start both frontend and backend:

```bash
cd /home/gaurav/CODE/TicketSphere
npm run dev
```

## 🔗 Application URLs

- **Frontend**: http://localhost:5173/
- **Backend**: http://localhost:5000/
- **Health Check**: http://localhost:5000/api/health

## 📦 Available Scripts

From root directory:
- `npm run dev` - Start both frontend and backend
- `npm run start` - Production start (backend only)
- `npm run build` - Build frontend for production
- `npm run install:all` - Install all dependencies
- `npm run clean` - Clean node_modules

## 🛠️ Features

✅ **Optimized Integration**: Single command startup  
✅ **MongoDB Atlas**: Cloud database connected  
✅ **CORS Fixed**: Frontend (5173) ↔ Backend (5000)  
✅ **Authentication**: Firebase + JWT support  
✅ **Clean Codebase**: Removed debug code and unused files  

## � Project Structure

```
TicketSphere/
├── client/          # React frontend (port 5173)
├── server/          # Express backend (port 5000)
└── package.json     # Root package for unified scripts
```

---
**Status**: ✅ Optimized & Ready for development!
