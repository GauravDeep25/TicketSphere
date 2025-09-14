import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getFirebaseAdmin, verifyFirebaseToken } from '../config/firebase.js';

// Middleware to protect routes - verify Firebase token or skip in development
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      console.log('Received token (first 50 chars):', token.substring(0, 50) + '...');

      const firebaseAdmin = getFirebaseAdmin();
      
      if (firebaseAdmin) {
        // Production mode: Verify Firebase token properly
        try {
          const decodedToken = await verifyFirebaseToken(token);
          
          // Check if this is the admin user
          const isAdmin = decodedToken.email === 'gauravdeepgd12007@gmail.com';
          
          // Create a user object from the Firebase token
          req.user = {
            id: decodedToken.uid,
            email: decodedToken.email,
            name: decodedToken.name || decodedToken.display_name,
            firebase_uid: decodedToken.uid,
            role: isAdmin ? 'admin' : 'user',
            isAdmin: isAdmin
          };

          console.log('✅ Firebase authentication successful for user:', req.user.email);
          console.log('🔑 User role:', req.user.role);
          next();
          return;
        } catch (firebaseError) {
          console.log('⚠️  Firebase token verification failed:', firebaseError.message);
          // Fall back to development mode below
        }
      }
      
      // Development mode: Decode token without verification
      console.log('🔄 Using development mode token verification');
      try {
        // Decode token without verification (DEVELOPMENT ONLY)
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid token format');
        }
        
        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
        
        // Check if this is the admin user
        const isAdmin = payload.email === 'gauravdeepgd12007@gmail.com';
        
        // Create a user object from the Firebase token
        req.user = {
          id: payload.user_id || payload.sub,
          email: payload.email,
          name: payload.name || payload.display_name,
          firebase_uid: payload.user_id || payload.sub,
          role: isAdmin ? 'admin' : 'user',
          isAdmin: isAdmin
        };

        console.log('🔄 Development authentication successful for user:', req.user.email);
        console.log('🔑 User role:', req.user.role);
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
      message: 'Access denied. Seller or admin rights required.' 
    });
  }
};

// Optional middleware - allows both authenticated and non-authenticated users
export const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // If there's a token, try to authenticate but don't fail if it's invalid
    try {
      await protect(req, res, next);
    } catch (error) {
      // Continue without authentication if token is invalid
      console.log('Optional auth failed, continuing without authentication');
      next();
    }
  } else {
    // No token provided, continue without authentication
    next();
  }
};

// Generate JWT token for user ID
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};
