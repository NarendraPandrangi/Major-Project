import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import './Auth.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id';

const Login = () => {
    const navigate = useNavigate();
    const { login, googleLogin, googleSignInWithFirebase, resetPassword } = useAuth();
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

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        const result = await googleLogin(credentialResponse.credential);
        setLoading(false);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setErrors({ submit: result.error });
        }
    };

    const handleGoogleError = () => {
        setErrors({ submit: 'Google sign-in failed. Please try again.' });
    };

    const handleFirebaseGoogleSignIn = async () => {
        setLoading(true);
        const result = await googleSignInWithFirebase();
        setLoading(false);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setErrors({ submit: result.error });
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
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
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
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            useOneTap
                            theme="outline"
                            size="large"
                            text="signin_with"
                            width="100%"
                        />
                    </div>

                    <div className="auth-footer">
                        <p>
                            Don't have an account?{' '}
                            <Link to="/register" className="auth-link">Create one</Link>
                        </p>
                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
};

export default Login;
