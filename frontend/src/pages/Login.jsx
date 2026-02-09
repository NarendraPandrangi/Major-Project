import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import './Auth.css';

const Login = () => {
    const navigate = useNavigate();
    const { login, googleSignInWithFirebase, resetPassword } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetMessage, setResetMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        setLoading(true);
        const result = await login(formData);
        setLoading(false);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setErrors({ submit: result.error });
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        const result = await googleSignInWithFirebase();
        setLoading(false);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setErrors({ submit: result.error || 'Google sign-in failed. Please try again.' });
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();

        if (!resetEmail || !/\S+@\S+\.\S+/.test(resetEmail)) {
            setResetMessage('Please enter a valid email address');
            return;
        }

        setLoading(true);
        const result = await resetPassword(resetEmail);
        setLoading(false);

        if (result.success) {
            setResetMessage(result.message);
            setTimeout(() => {
                setShowForgotPassword(false);
                setResetMessage('');
                setResetEmail('');
            }, 3000);
        } else {
            setResetMessage(result.error);
        }
    };

    if (showForgotPassword) {
        return (
            <div className="auth-container">
                <div className="auth-card fade-in">
                    <div className="auth-header">
                        <h1>Reset Password</h1>
                        <p>Enter your email to receive a password reset link</p>
                    </div>

                    {resetMessage && (
                        <div className={`alert ${resetMessage.includes('sent') ? 'alert-success' : 'alert-error'}`}>
                            {resetMessage.includes('sent') ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                            <span>{resetMessage}</span>
                        </div>
                    )}

                    <form onSubmit={handleForgotPassword} className="auth-form">
                        <div className="form-group">
                            <label className="form-label">
                                <Mail size={18} />
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                className="form-input"
                                placeholder="you@example.com"
                                disabled={loading}
                                autoComplete="email"
                            />
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                            {loading ? <div className="spinner-sm"></div> : 'Send Reset Link'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowForgotPassword(false)}
                            className="btn btn-secondary btn-lg"
                            disabled={loading}
                        >
                            Back to Login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card fade-in">
                <div className="auth-header">
                    <h1>Welcome Back</h1>
                    <p>Sign in to access your dispute resolution dashboard</p>
                </div>

                {errors.submit && (
                    <div className="alert alert-error">
                        <AlertCircle size={20} />
                        <span>{errors.submit}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">
                            <Mail size={18} />
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`form-input ${errors.email ? 'error' : ''}`}
                            placeholder="you@example.com"
                            disabled={loading}
                            autoComplete="email"
                        />
                        {errors.email && <div className="form-error">{errors.email}</div>}
                    </div>

                    <div className="form-group">
                        <div className="form-label-row">
                            <label className="form-label">
                                <Lock size={18} />
                                Password
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowForgotPassword(true)}
                                className="forgot-password-link"
                            >
                                Forgot password?
                            </button>
                        </div>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`form-input ${errors.password ? 'error' : ''}`}
                            placeholder="••••••••"
                            disabled={loading}
                            autoComplete="current-password"
                        />
                        {errors.password && <div className="form-error">{errors.password}</div>}
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                        {loading ? <div className="spinner-sm"></div> : 'Sign In'}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>or</span>
                </div>

                <div className="google-login-wrapper">
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="google-signin-btn"
                        disabled={loading}
                    >
                        <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                            <path fill="none" d="M0 0h48v48H0z" />
                        </svg>
                        {loading ? 'Signing in...' : 'Sign in with Google'}
                    </button>
                </div>

                <div className="auth-footer">
                    <p>
                        Don't have an account?{' '}
                        <Link to="/register" className="auth-link">Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
