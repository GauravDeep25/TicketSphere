import admin from 'firebase-admin';
import User from '../models/User.js';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    // For development, we'll skip Firebase Admin verification
    // In production, you should properly initialize Firebase Admin with service account
    console.log('Firebase Admin not configured - using development mode');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

// Middleware to protect routes - verify Firebase token or skip in development
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      console.log('Received token (first 50 chars):', token.substring(0, 50) + '...');

      // For development purposes, we'll extract user info from the token payload
      // In production, you should verify the Firebase token properly
      try {
        // Decode token without verification (DEVELOPMENT ONLY)
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid token format');
        }
        
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        
        // Create a user object from the Firebase token
        req.user = {
          id: payload.user_id || payload.sub,
          email: payload.email,
          name: payload.name || payload.display_name,
          firebase_uid: payload.user_id || payload.sub
        };

        console.log('Authentication successful for user:', req.user.email);
        next();
      } catch (decodeError) {
        console.log('Firebase token decode failed, trying JWT fallback:', decodeError.message);
        
        // If Firebase token decode fails, try JWT verification as fallback
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        
        // Get user from the token (if using JWT)
        req.user = await User.findById(decoded.id).select('-password');
        
        if (!req.user) {
          return res.status(401).json({ 
            success: false, 
            message: 'User not found' 
          });
        }
        
        console.log('JWT authentication successful for user:', req.user.email);
        next();
      }
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, token failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  } else {
    console.log('No authorization header found');
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized, no token' 
    });
  }
};
// Middleware to check if user is admin
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin rights required.' 
    });
  }
};

// Middleware to check if user is seller or admin
export const isSeller = (req, res, next) => {
  if (req.user && (req.user.role === 'seller' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Access denied. Seller rights required.' 
    });
  }
};

// Generate JWT Token
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};
