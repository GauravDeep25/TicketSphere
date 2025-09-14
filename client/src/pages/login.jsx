import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase/config';
import { Phone } from 'lucide-react';
import './login.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleResendVerification = async () => {
        try {
            if (auth.currentUser) {
                 await sendEmailVerification(auth.currentUser);
                 setError("A new verification link has been sent to your email.");
            } else {
                 setError("Could not find user. Please try logging in again first.");
            }
        } catch (err) {
            setError("Failed to resend verification email.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (!user.emailVerified) {
                setError(
                    <span>
                        Your email is not verified. Please check your inbox or{' '}
                        <button onClick={handleResendVerification} className="text-blue-400 underline hover:text-blue-300">
                            resend the verification link
                        </button>.
                    </span>
                );
                await auth.signOut();
                return; 
            }
            navigate('/');
        } catch (err) {
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Invalid email or password.');
            } else {
                setError('Failed to log in. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-form-card">
                <h1 className="login-title">Log In to TicketSphere</h1>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit} className="login-form">
                    <div>
                        <label htmlFor="email" className="form-label">Email address</label>
                        <input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-input"/>
                    </div>
                    <div>
                        <div className="password-header">
                            <label htmlFor="password" className="form-label">Password</label>
                            <Link to="/reset-password" className="forgot-link">Forgot password?</Link>
                        </div>
                        <input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="form-input"/>
                    </div>
                    <div>
                        <button type="submit" disabled={loading} className="submit-button">
                            {loading ? 'Logging in...' : 'Log In with Email'}
                        </button>
                    </div>
                </form>

                <div className="divider">
                    <div className="divider-line"></div>
                    <span className="divider-text">OR</span>
                    <div className="divider-line"></div>
                </div>

                <div className="alt-login">
                    <Link to="/phone-login" className="phone-login-button phone-login-disabled">
                        <Phone size={16} />
                        Log In with Phone Number
                        <span className="coming-soon-badge">Coming Soon</span>
                    </Link>
                    <p className="phone-notice">
                        Phone authentication will be available once we upgrade to Firebase Blaze plan.
                    </p>
                </div>
                 <p className="signup-prompt">
                    Don't have an account?{' '}
                    <Link to="/register" className="signup-link">Sign Up</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;

