import React, { useState, useEffect } from 'react';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, Calendar, Edit3, Save, X, Camera } from 'lucide-react';
import './ProfileSettings.css';

const ProfileSettingsPage = () => {
    const { currentUser, isAuthenticated, getUserDisplayName } = useAuth();
    const navigate = useNavigate();
    
    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Initialize profile data from Firebase user
    const [profileData, setProfileData] = useState({
        displayName: '',
        email: '',
        phoneNumber: '',
        photoURL: '',
        city: '',
        dateOfBirth: '',
        bio: ''
    });

    useEffect(() => {
        if (currentUser) {
            setProfileData({
                displayName: currentUser.displayName || '',
                email: currentUser.email || '',
                phoneNumber: currentUser.phoneNumber || '',
                photoURL: currentUser.photoURL || '',
                city: '',
                dateOfBirth: '',
                bio: ''
            });
        }
    }, [currentUser]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Update Firestore user profile
            if (currentUser) {
                const userRef = doc(db, 'users', currentUser.uid);
                await setDoc(userRef, {
                    displayName: profileData.displayName,
                    email: profileData.email,
                    phoneNumber: profileData.phoneNumber,
                    photoURL: profileData.photoURL,
                    city: profileData.city,
                    dateOfBirth: profileData.dateOfBirth,
                    bio: profileData.bio
                }, { merge: true });
            }
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    // Utility: Set admin user in Firestore
    useEffect(() => {
        async function setAdminUser() {
            const adminEmail = 'gauravdeepgd12007@gmail.com';
            // Find user by email (requires user to have logged in at least once)
            // For demo: set admin flag in users collection
            try {
                // You may want to run this only once or from an admin panel
                const adminQueryRef = doc(db, 'adminUsers', adminEmail);
                await setDoc(adminQueryRef, { isAdmin: true }, { merge: true });
            } catch (e) {
                // Ignore errors for now
            }
        }
        setAdminUser();
    }, []);
    };

    const handleCancel = () => {
        // Reset form data to original values
        if (currentUser) {
            setProfileData({
                displayName: currentUser.displayName || '',
                email: currentUser.email || '',
                phoneNumber: currentUser.phoneNumber || '',
                photoURL: currentUser.photoURL || '',
                city: '',
                dateOfBirth: '',
                bio: ''
            });
        }
        setIsEditing(false);
        setError('');
    };

    if (!isAuthenticated) {
        return null; // Will redirect to login
    }

    return (
        <div className="profile-settings-page">
            <div className="profile-container">
                {/* Header */}
                <div className="profile-header">
                    <div className="header-content">
                        <div className="header-info">
                            <h1 className="page-title">Profile Settings</h1>
                            <p className="page-subtitle">Manage your account information and preferences</p>
                        </div>
                        <div className="header-actions">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="btn btn-primary"
                                >
                                    <Edit3 size={18} />
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="button-group">
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="btn btn-primary"
                                    >
                                        <Save size={18} />
                                        {loading ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={loading}
                                        className="btn btn-secondary"
                                    >
                                        <X size={18} />
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="success-message">
                            {success}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {/* Profile Photo Section */}
                    <div className="profile-photo-section">
                        <div className="avatar-section">
                            <div className="profile-avatar-container">
                                {profileData.photoURL ? (
                                    <img 
                                        src={profileData.photoURL} 
                                        alt="Profile" 
                                        className="profile-avatar"
                                    />
                                ) : (
                                    <div className="avatar-placeholder">
                                        <User size={40} />
                                    </div>
                                )}
                            </div>
                            {isEditing && (
                                <button
                                    className="avatar-edit-button"
                                    title="Change Profile Photo"
                                >
                                    <Camera size={16} />
                                </button>
                            )}
                        </div>
                        <div className="profile-info">
                            <h2 className="profile-display-name">
                                {profileData.displayName || currentUser?.displayName || 'No Name Set'}
                            </h2>
                            <p className="profile-email-display">{profileData.email}</p>
                            <p className="member-since">
                                Member since {currentUser?.metadata?.creationTime 
                                    ? new Date(currentUser.metadata.creationTime).toLocaleDateString() 
                                    : 'Unknown'}
                            </p>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <div className="form-grid">
                        <div className="form-group">
                            <label className="form-label">
                                <User size={16} />
                                Display Name
                            </label>
                            <input
                                type="text"
                                name="displayName"
                                value={profileData.displayName}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className={`form-input ${!isEditing ? 'disabled' : ''}`}
                                placeholder="Enter your display name"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <Mail size={16} />
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={profileData.email}
                                onChange={handleInputChange}
                                disabled={true}
                                className="form-input disabled"
                                placeholder="your@email.com"
                            />
                            <p className="field-note">Email cannot be changed here</p>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <Phone size={16} />
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={profileData.phoneNumber}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className={`form-input ${!isEditing ? 'disabled' : ''}`}
                                placeholder="+91 00000 00000"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <MapPin size={16} />
                                City
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={profileData.city}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className={`form-input ${!isEditing ? 'disabled' : ''}`}
                                placeholder="Enter your city"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                <Calendar size={16} />
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={profileData.dateOfBirth}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className={`form-input ${!isEditing ? 'disabled' : ''}`}
                            />
                        </div>

                        <div className="form-group full-width">
                            <label className="form-label">
                                Bio
                            </label>
                            <textarea
                                name="bio"
                                value={profileData.bio}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                rows={4}
                                className={`form-textarea ${!isEditing ? 'disabled' : ''}`}
                                placeholder="Tell us a bit about yourself..."
                            />
                        </div>
                    </div>
                </div>

                {/* Account Management Section */}
                <div className="settings-card">
                    <div className="card-header">
                        <h2 className="card-title">Account Management</h2>
                    </div>
                    <div className="card-content">
                        <div className="account-section">
                            <div className="account-item">
                                <div className="account-info">
                                    <h3 className="account-item-title">Email Verification</h3>
                                    <p className="account-item-description">
                                        {currentUser?.emailVerified ? 'Email is verified' : 'Email is not verified'}
                                    </p>
                                </div>
                                <div className={`status-badge ${currentUser?.emailVerified ? 'verified' : 'pending'}`}>
                                    {currentUser?.emailVerified ? 'Verified' : 'Pending'}
                                </div>
                            </div>

                            <div className="account-item">
                                <div className="account-info">
                                    <h3 className="account-item-title">Account Security</h3>
                                    <p className="account-item-description">
                                        Last sign-in: {currentUser?.metadata?.lastSignInTime 
                                            ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString()
                                            : 'Unknown'}
                                    </p>
                                </div>
                                <button className="btn btn-primary">
                                    Change Password
                                </button>
                            </div>

                            <div className="danger-zone">
                                <div className="account-info">
                                    <h3 className="danger-title">Delete Account</h3>
                                    <p className="danger-description">Permanently delete your account and all data</p>
                                </div>
                                <button className="btn btn-danger">
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettingsPage;
