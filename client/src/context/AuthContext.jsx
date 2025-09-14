import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, sendEmailVerification, reload } from 'firebase/auth';
import { auth } from '../firebase/config';

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sign out function
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout');
    }
  };

  // Resend email verification
  const resendEmailVerification = async () => {
    try {
      if (currentUser && !currentUser.emailVerified) {
        await sendEmailVerification(currentUser);
        return { success: true, message: 'Verification email sent successfully!' };
      }
      return { success: false, message: 'Email already verified or user not found' };
    } catch (error) {
      console.error('Resend verification error:', error);
      return { success: false, message: 'Failed to send verification email' };
    }
  };

  // Reload user to check email verification status
  const reloadUser = async () => {
    try {
      if (currentUser) {
        await reload(currentUser);
        // Force update by triggering auth state change
        setCurrentUser({ ...currentUser });
      }
    } catch (error) {
      console.error('Reload user error:', error);
    }
  };

  // Check if user account is fully activated (email verified)
  const isAccountActivated = () => {
    return currentUser && currentUser.emailVerified;
  };

  // Get user display name
  const getUserDisplayName = (user) => {
    // Priority: displayName > extracted from email > phone > default
    if (user?.displayName && user.displayName.trim()) {
      return user.displayName;
    }
    if (user?.email) {
      // Extract username part from email and make it more readable
      const username = user.email.split('@')[0];
      return username.charAt(0).toUpperCase() + username.slice(1);
    }
    if (user?.phoneNumber) {
      return user.phoneNumber;
    }
    return 'Anonymous User';
  };

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
      setError(null);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Context value
  const value = {
    currentUser,
    loading,
    error,
    logout,
    resendEmailVerification,
    reloadUser,
    isAccountActivated,
    getUserDisplayName,
    isAuthenticated: !!currentUser,
    isEmailVerified: currentUser?.emailVerified || false
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
