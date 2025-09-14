import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// CORS middleware - Production and Development
app.use((req, res, next) => {
  // Production origins
  const productionOrigins = [
    'https://ticketsphere-frontend.onrender.com',
    'https://ticketsphere.onrender.com',
    'https://www.ticketsphere.com',
    'https://ticketsphere.com'
  ];
  
  // Development origins
  const developmentOrigins = [
    'http://localhost:5174',
    'http://localhost:5175', 
    'http://localhost:5176',
    'http://localhost:3000',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'http://127.0.0.1:5176'
  ];
  
  const origin = req.headers.origin;
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Allow production origins in production, dev origins in development
  const allowedOrigins = isProduction ? productionOrigins : [...productionOrigins, ...developmentOrigins];
  
  if (origin && (
    allowedOrigins.includes(origin) ||
    // Allow local network access in development
    (!isProduction && (
      origin.match(/^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:(3000|5174|5175|5176)$/) ||
      origin.match(/^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:(3000|5174|5175|5176)$/) ||
      origin.match(/^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}:(3000|5174|5175|5176)$/)
    ))
  )) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());

// --- Basic Route ---
app.get('/', (req, res) => {
  res.send('TicketSphere API is running successfully!');
});

// --- API Routes ---
import authRoutes from './routes/authRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'TicketSphere API is running',
    timestamp: new Date().toISOString()
  });
});

export default app;
