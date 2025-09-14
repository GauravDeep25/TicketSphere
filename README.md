# 🎟️ TicketSphere - Full Stack Event Ticketing Platform

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/GauravDeep25/TicketSphere)

## 🌟 Features

- 🔐 **Firebase Authentication** - Secure user registration and login with email verification
- 🎫 **Event Management** - Create, view, and manage events with real-time data from MongoDB
- 💳 **UPI Payment Integration** - Seamless payment processing with Indian UPI system
- 📧 **Email Verification** - Complete email verification system with resend functionality
- 🎨 **Modern UI/UX** - Beautiful, responsive design with smooth animations
- 🔒 **Security** - JWT tokens, CORS protection, and secure environment configuration
- 📱 **Mobile Responsive** - Perfect experience across all devices
- 🚀 **Production Ready** - Fully configured for Render deployment

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and context
- **Vite** - Lightning-fast build tool and dev server
- **React Router** - Client-side routing with URL parameters
- **Lucide React** - Beautiful icons and illustrations
- **CSS3** - Modern styling with animations and responsive design

### Backend  
- **Node.js & Express** - RESTful API server
- **MongoDB Atlas** - Cloud database with full CRUD operations
- **Firebase Admin SDK** - Server-side authentication and user management
- **JWT** - Secure token-based authentication
- **Nodemon** - Development auto-restart

### DevOps & Deployment
- **Render** - Production hosting with automatic SSL and CDN
- **GitHub Actions** - CI/CD pipeline (ready to configure)
- **Environment Variables** - Secure configuration management
- **CORS** - Production-ready cross-origin resource sharing

## 🚀 Quick Deploy to Render

### One-Click Deployment
1. Click the "Deploy to Render" button above
2. Connect your GitHub account
3. Render will automatically deploy both frontend and backend
4. Update Firebase credentials in Render dashboard
5. Your app will be live at `https://your-app.onrender.com`

### Manual Deployment
1. Fork this repository
2. Sign up at [Render.com](https://render.com)
3. Create new "Blueprint" service
4. Connect your GitHub repository
5. Render will use `render.yaml` for automatic configuration

## 🔧 Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Firebase project
- Git

### Setup
```bash
# Clone the repository
git clone https://github.com/GauravDeep25/TicketSphere.git
cd TicketSphere

# Install all dependencies
npm run install:all

# Set up environment variables
# Copy and update client/.env and server/.env with your credentials

# Start development servers
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5174
- Backend API: http://localhost:3001

## 🔐 Environment Configuration

### Required Environment Variables

**Frontend (client/.env):**
```env
VITE_API_URL=your_api_url
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
# ... more Firebase config
```

**Backend (server/.env):**
```env
MONGODB_URI=your_mongodb_connection_string
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
JWT_SECRET=your_jwt_secret
UPI_ID=your_upi_id
# ... more configuration
```

See `ENVIRONMENT_VARIABLES.md` for complete configuration guide.

## 📱 Live Demo

- **Frontend**: https://ticketsphere-frontend.onrender.com
- **API**: https://ticketsphere-api.onrender.com/api
- **Health Check**: https://ticketsphere-api.onrender.com/api/health

## 🏗️ Project Structure

```
TicketSphere/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── context/        # React context (Auth)
│   │   └── api/            # API integration
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   └── config/         # Database & Firebase config
├── render.yaml            # Render deployment config
└── package.json           # Project configuration
```

## 🔄 Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run client:dev       # Start only frontend
npm run server:dev       # Start only backend

# Production
npm run build           # Build frontend for production
npm run start           # Start production server
npm run deploy:render   # Deploy to Render

# Utilities
npm run install:all     # Install all dependencies
npm run clean          # Clean node_modules
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Gaurav Deep**
- GitHub: [@GauravDeep25](https://github.com/GauravDeep25)
- Project: [TicketSphere](https://github.com/GauravDeep25/TicketSphere)

## 🙏 Acknowledgments

- Firebase for authentication services
- MongoDB Atlas for database hosting
- Render for deployment platform
- React and Node.js communities

---

**Ready for production deployment with zero configuration!** 🚀

For detailed deployment instructions, see `RENDER_DEPLOYMENT_GUIDE.md`
