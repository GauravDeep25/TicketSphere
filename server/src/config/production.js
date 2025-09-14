/**
 * Production configuration for TicketSphere server
 * This file contains production-specific settings
 */

const productionConfig = {
  // Server settings
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'production',
  
  // Database settings
  mongodb: {
    uri: process.env.MONGODB_URI,
    options: {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // Disable mongoose buffering
    }
  },
  
  // CORS settings
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5174',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  
  // JWT settings
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRE || '30d',
    issuer: 'TicketSphere',
    audience: 'TicketSphere-Users'
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  },
  
  // Security settings
  security: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  },
  
  // Logging settings
  logging: {
    level: process.env.LOG_LEVEL || 'error',
    enableConsole: process.env.ENABLE_CONSOLE_LOGS === 'true' || false,
    enableFile: process.env.ENABLE_FILE_LOGS === 'true' || false
  },
  
  // Payment settings
  payment: {
    upiId: process.env.UPI_ID,
    merchantName: process.env.MERCHANT_NAME || 'TicketSphere',
    commissionRate: parseFloat(process.env.COMMISSION_RATE) || 0.05, // 5% default
    currency: 'INR'
  },
  
  // Email settings
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER
  },
  
  // Firebase settings
  firebase: {
    serviceAccountKeyPath: process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH
  },
  
  // Performance settings
  performance: {
    compressionLevel: 6,
    cacheControl: 'public, max-age=31536000', // 1 year for static assets
    enableGzip: true,
    enableBrotli: true
  }
};

// Validation function
export const validateConfig = () => {
  const required = [
    'MONGODB_URI',
    'JWT_SECRET',
    'UPI_ID'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long for security');
  }
  
  return true;
};

export default productionConfig;
