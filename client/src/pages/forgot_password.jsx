import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/config';
import { Mail } from 'lucide-react';
import './forgot_password.css';

const ResetPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('Password reset link sent! Please check your email inbox (and spam folder).');
        } catch (err) {
            if (err.code === 'auth/user-not-found') {
                 setError('No user found with this email address.');
            } else {
                 setError('Failed to send reset link. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-card">
                <h1 className="forgot-password-title">Reset Your Password</h1>
                <p className="forgot-password-subtitle">
                    Enter your email address and we'll send you a link to reset your password.
                </p>
                
                {error && <div className="alert alert-error">{error}</div>}
                {message && <div className="alert alert-success">{message}</div>}

                <form onSubmit={handleSubmit} className="forgot-password-form">
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input 
                            id="email" 
                            name="email" 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            placeholder="Enter your email address"
                            className="form-input"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="submit-button">
                        {loading && <div className="loading-spinner"></div>}
                        <Mail size={16} />
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>
                
                <div className="forgot-password-footer">
                    Remember your password?{' '}
                    <Link to="/login" className="forgot-password-link">Log In</Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;

