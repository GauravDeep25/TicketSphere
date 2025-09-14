import { getFirebaseAdmin } from '../config/firebase.js';

/**
 * Set up admin user in Firestore
 * This script ensures that gauravdeepgd12007@gmail.com is marked as an admin
 */
async function setupAdminUser() {
  try {
    const firebaseAdmin = getFirebaseAdmin();
    
    if (!firebaseAdmin) {
      console.error('❌ Firebase Admin not initialized');
      return;
    }

    const adminEmail = 'gauravdeepgd12007@gmail.com';
    const db = firebaseAdmin.firestore();
    
    console.log('🔧 Setting up admin user...');
    
    // Create/update admin user document in Firestore
    const adminUserRef = db.collection('users').doc(adminEmail);
    
    const adminUserData = {
      email: adminEmail,
      role: 'admin',
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: {
        canApproveEvents: true,
        canRejectEvents: true,
        canViewAllEvents: true,
        canManageUsers: true
      }
    };

    await adminUserRef.set(adminUserData, { merge: true });
    
    console.log('✅ Admin user setup completed!');
    console.log('📧 Admin email:', adminEmail);
    console.log('🔑 Admin permissions:', adminUserData.permissions);
    
    // Also create admin profile if needed
    const adminProfileRef = db.collection('profiles').doc(adminEmail);
    const adminProfileData = {
      email: adminEmail,
      displayName: 'Admin User',
      role: 'admin',
      isAdmin: true,
      bio: 'System Administrator',
      location: 'System',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await adminProfileRef.set(adminProfileData, { merge: true });
    console.log('✅ Admin profile created!');
    
    return true;
  } catch (error) {
    console.error('❌ Error setting up admin user:', error);
    return false;
  }
}

// Export for use in other files
export { setupAdminUser };

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupAdminUser()
    .then((success) => {
      if (success) {
        console.log('🎉 Admin setup completed successfully!');
        process.exit(0);
      } else {
        console.log('❌ Admin setup failed!');
        process.exit(1);
      }
    });
}
