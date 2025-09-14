import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../firebase/config';
import { Phone, Shield } from 'lucide-react';
import './phone-login.css';

const PhoneLoginPage = () => {
    const [phone, setPhone] = useState('91'); // Default to India country code
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Set up reCAPTCHA verifier
    useEffect(() => {
        const setupRecaptcha = () => {
            try {
                if (!window.recaptchaVerifier) {
                    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                        'size': 'invisible',
                        'callback': (response) => {
                            // reCAPTCHA solved, allow signInWithPhoneNumber
                            console.log('reCAPTCHA verified');
                        },
                        'expired-callback': () => {
                            // Response expired. Ask user to solve reCAPTCHA again
                            console.log('reCAPTCHA expired');
                        }
                    });
                }
            } catch (error) {
                console.error('reCAPTCHA setup error:', error);
                setError('Failed to initialize verification. Please refresh the page.');
            }
        };

        setupRecaptcha();

        // Cleanup on unmount
        return () => {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        };
    }, []);

    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            // Get phone number from user input
            const phoneNumber = `+${phone}`;
            const appVerifier = window.recaptchaVerifier;
            
            // Send SMS using Firebase phone authentication
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            
            // SMS sent. Store confirmation result and show OTP input
            setConfirmationResult(confirmationResult);
            setOtpSent(true);
            
        } catch (error) {
            // Error; SMS not sent
            console.error('Phone authentication error:', error);
            
            if (error.code === 'auth/billing-not-enabled') {
                setError('Phone authentication requires a paid Firebase plan. Please use email login or contact support to enable this feature.');
            } else if (error.code === 'auth/invalid-phone-number') {
                setError('Invalid phone number format. Please enter a valid phone number with country code.');
            } else if (error.code === 'auth/too-many-requests') {
                setError('Too many requests. Please try again later.');
            } else if (error.code === 'auth/captcha-check-failed') {
                setError('Captcha verification failed. Please refresh and try again.');
            } else {
                setError('Phone authentication is currently unavailable. Please use email login instead.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        if (!confirmationResult) {
            setError('Something went wrong. Please try sending the OTP again.');
            setLoading(false);
            return;
        }
        
        try {
            // Verify the OTP code entered by user
            const result = await confirmationResult.confirm(otp);
            
            // User signed in successfully
            console.log('Phone authentication successful:', result.user);
            navigate('/'); // Redirect to homepage on successful login
            
        } catch (error) {
            console.error('OTP verification error:', error);
            
            if (error.code === 'auth/invalid-verification-code') {
                setError('Invalid OTP code. Please check and try again.');
            } else if (error.code === 'auth/code-expired') {
                setError('OTP code has expired. Please request a new one.');
            } else {
                setError('Failed to verify OTP. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="phone-login-container">
            <div className="phone-login-card">
                <h1 className="phone-login-title">
                    {otpSent ? 'Verify OTP' : 'Log In with Phone'}
                </h1>
                
                {/* Billing Notice */}
                <div className="billing-notice">
                    <p>📱 <strong>Note:</strong> Phone authentication requires Firebase Blaze plan. 
                    For now, please use <Link to="/login" className="email-login-link">email login</Link> instead.</p>
                </div>
                
                {otpSent && (
                    <div className="otp-sent-status">
                        OTP sent successfully to your phone number
                    </div>
                )}
                
                {error && <div className="alert alert-error">{error}</div>}
                
                {!otpSent ? (
                    <form onSubmit={handlePhoneSubmit} className="phone-login-form">
                        <div className="form-group">
                            <label htmlFor="phone" className="form-label">Phone Number</label>
                            <div className="phone-input-container">
                                <span className="country-code-prefix">+</span>
                                <input 
                                    id="phone" 
                                    name="phone" 
                                    type="tel" 
                                    value={phone} 
                                    onChange={(e) => setPhone(e.target.value)} 
                                    placeholder="919876543210"
                                    required 
                                    className="form-input phone-input"
                                />
                            </div>
                            <div className="helper-text">
                                Enter your phone number with country code (default: +91 for India)
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="submit-button send-otp">
                            {loading && <div className="loading-spinner"></div>}
                            <Phone size={16} />
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleOtpSubmit} className="phone-login-form">
                        <div className="phone-display">
                            OTP sent to: <span className="phone-number">+{phone}</span>
                        </div>
                        <div className="form-group">
                            <label htmlFor="otp" className="form-label">Enter OTP</label>
                            <input 
                                id="otp" 
                                name="otp" 
                                type="text" 
                                value={otp} 
                                onChange={(e) => setOtp(e.target.value)} 
                                placeholder="Enter 6-digit OTP"
                                maxLength="6"
                                required 
                                className="form-input otp-input"
                            />
                            <div className="helper-text">
                                Check your SMS for the 6-digit verification code
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="submit-button verify-otp">
                            {loading && <div className="loading-spinner"></div>}
                            <Shield size={16} />
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        
                        <button 
                            type="button"
                            onClick={() => {
                                setOtpSent(false);
                                setOtp('');
                                setError('');
                            }}
                            className="resend-otp-button"
                        >
                            Send OTP again
                        </button>
                    </form>
                )}

                <div id="recaptcha-container"></div>
                
                <div className="phone-login-footer">
                    <Link to="/login" className="phone-login-link">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PhoneLoginPage;

