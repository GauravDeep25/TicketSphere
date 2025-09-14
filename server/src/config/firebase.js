import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let firebaseApp = null;

/**
 * Initialize Firebase Admin SDK
 * Supports multiple configuration methods:
 * 1. Environment variables (Production - Render)
 * 2. Service account key file (Development)
 * 3. Development mode (skip initialization)
 */
export const initializeFirebase = () => {
  // Skip if already initialized
  if (firebaseApp || admin.apps.length > 0) {
    return admin.apps[0] || firebaseApp;
  }

  console.log('🔍 Firebase initialization starting...');
  console.log('🔍 Environment:', process.env.NODE_ENV);
  console.log('🔍 Render deployment:', !!process.env.RENDER);

  try {
    let serviceAccount = null;
    
    // Method 1: Production - Load from environment variables (Render deployment)
    if (process.env.RENDER || process.env.NODE_ENV === 'production') {
      console.log('🚀 Loading Firebase config from environment variables...');
      
      if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
        serviceAccount = {
          type: 'service_account',
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
          token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
          auth_provider_x509_cert_url: `https://www.googleapis.com/oauth2/v1/certs`,
          client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.FIREBASE_CLIENT_EMAIL)}`
        };
        
        console.log('✅ Firebase config loaded from environment variables');
        console.log('📧 Service account email:', serviceAccount.client_email);
      } else {
        console.error('❌ Missing required Firebase environment variables for production');
        console.log('Required: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL');
        return null;
      }
    }

    // Method 2: Development - Try to load from service account key file
    if (!serviceAccount) {
      console.log('🔧 Loading Firebase config from service account file...');
      
      const possiblePaths = [
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH,
        './config/firebase-service-account.json',
        'config/firebase-service-account.json',
        '/home/gaurav/CODE/TicketSphere/server/config/firebase-service-account.json'
      ].filter(Boolean);

      for (const keyPath of possiblePaths) {
        try {
          const fullPath = resolve(keyPath);
          console.log('🔍 Attempting to load Firebase key from:', fullPath);
          const serviceAccountKey = readFileSync(fullPath, 'utf8');
          serviceAccount = JSON.parse(serviceAccountKey);
          console.log('✅ Firebase Admin initialized with service account key file');
          console.log('📧 Service account email:', serviceAccount.client_email);
          break;
        } catch (fileError) {
          console.log('⚠️  Failed to load from:', keyPath, '-', fileError.message);
        }
      }
    }

    // Method 3: Try environment variables as fallback
    if (!serviceAccount && process.env.FIREBASE_PROJECT_ID) {
      serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
      };
      console.log('✅ Firebase Admin initialized with environment variables');
    }

    // Initialize Firebase Admin
    if (serviceAccount) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
      return firebaseApp;
    } else {
      // Development mode - no Firebase Admin
      console.log('🔄 Firebase Admin not configured - running in development mode');
      console.log('   To enable Firebase Admin:');
      console.log('   1. Download service account key from Firebase Console');
      console.log('   2. Place it at: server/config/firebase-service-account.json');
      console.log('   3. Or set environment variables: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL');
      return null;
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message);
    return null;
  }
};

/**
 * Get Firebase Admin instance
 */
export const getFirebaseAdmin = () => {
  if (!firebaseApp && admin.apps.length === 0) {
    return initializeFirebase();
  }
  return firebaseApp || admin.apps[0];
};

/**
 * Verify Firebase ID token
 */
export const verifyFirebaseToken = async (idToken) => {
  const app = getFirebaseAdmin();
  if (!app) {
    throw new Error('Firebase Admin not initialized');
  }
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error(`Firebase token verification failed: ${error.message}`);
  }
};

// Initialize on module load
initializeFirebase();
