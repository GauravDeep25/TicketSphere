import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import './registration.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        city: '',
        gender: '',
        dob: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- Age Verification Logic ---
    const isUnder18 = (dob) => {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age < 18;
    };

    const createUserProfile = async (user, additionalData) => {
        if (!user) return;
        const userRef = doc(db, 'users', user.uid);
        const userData = {
            uid: user.uid,
            email: user.email,
            name: additionalData.name,
            phone: additionalData.phone,
            city: additionalData.city,
            gender: additionalData.gender,
            dob: additionalData.dob,
            role: 'buyer',
            createdAt: new Date(),
        };
        await setDoc(userRef, userData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // --- Check age before proceeding ---
        if (isUnder18(formData.dob)) {
            setError('You must be at least 18 years old to create an account.');
            return;
        }

        setLoading(true);
        try {
            const { email, password, name, phone, city, gender, dob } = formData;
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await sendEmailVerification(user);
            await createUserProfile(user, { name, phone, city, gender, dob });

            setMessage('Registration successful! A verification link has been sent to your email. Please verify before logging in.');
            setTimeout(() => navigate('/login'), 5000);

        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('This email address is already in use.');
            } else if (err.code === 'auth/weak-password') {
                setError('Password should be at least 6 characters.');
            } else {
                setError('Failed to create an account. Please try again.');
                console.error(err);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page-container">
            <div className="register-form-card">
                <h1 className="register-title">Create an Account</h1>
                
                {error && <p className="error-message">{error}</p>}
                {message && <p className="success-message">{message}</p>}

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-grid">
                         <div>
                            <label htmlFor="name" className="form-label">Full Name</label>
                            <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required className="form-input"/>
                        </div>
                        <div>
                            <label htmlFor="email" className="form-label">Email address</label>
                            <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="form-input"/>
                        </div>
                        <div>
                            <label htmlFor="password" className="form-label">Password</label>
                            <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required className="form-input"/>
                        </div>
                        <div>
                            <label htmlFor="phone" className="form-label">Phone Number</label>
                            <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required className="form-input"/>
                        </div>
                         <div>
                            <label htmlFor="city" className="form-label">City</label>
                            <input id="city" name="city" type="text" value={formData.city} onChange={handleChange} required className="form-input"/>
                        </div>
                        <div>
                            <label htmlFor="gender" className="form-label">Gender</label>
                            <select id="gender" name="gender" value={formData.gender} onChange={handleChange} required className="form-select">
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                                <option value="prefer-not-to-say">Prefer not to say</option>
                            </select>
                        </div>
                        <div className="form-group-span-2">
                            <label htmlFor="dob" className="form-label">Date of Birth</label>
                            <input id="dob" name="dob" type="date" value={formData.dob} onChange={handleChange} required className="form-input"/>
                        </div>
                    </div>

                    <div className="submit-button-container">
                        <button type="submit" disabled={loading} className="submit-button">
                            {loading ? 'Registering...' : 'Sign Up'}
                        </button>
                    </div>
                </form>
                <p className="login-prompt">
                    Already have an account?{' '}
                    <Link to="/login" className="login-link">Log In</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;

