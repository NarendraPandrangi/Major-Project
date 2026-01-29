import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/client';
import {
    auth,
    signInWithPopup,
    googleProvider,
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    sendEmailVerification
} from '../firebase/config';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check if user is logged in on mount
        const token = localStorage.getItem('access_token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
                setIsAuthenticated(true);

                // Verify token is still valid
                authAPI.getCurrentUser()
                    .then(response => {
                        setUser(response.data);
                        localStorage.setItem('user', JSON.stringify(response.data));
                    })
                    .catch(() => {
                        // Token is invalid, clear everything
                        logout();
                    })
                    .finally(() => {
                        setLoading(false);
                    });
            } catch (error) {
                logout();
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (credentials) => {
        try {
            const response = await authAPI.loginWithEmail(credentials);
            const { user, access_token } = response.data;

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('user', JSON.stringify(user));

            setUser(user);
            setIsAuthenticated(true);

            return { success: true, user };
        } catch (error) {
            const message = error.response?.data?.detail || 'Login failed';
            return { success: false, error: message };
        }
    };

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            const { user, access_token } = response.data;

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('user', JSON.stringify(user));

            setUser(user);
            setIsAuthenticated(true);

            return { success: true, user };
        } catch (error) {
            const message = error.response?.data?.detail || 'Registration failed';
            return { success: false, error: message };
        }
    };

    const googleLogin = async (googleToken) => {
        try {
            const response = await authAPI.googleAuth(googleToken);
            const { user, access_token } = response.data;

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('user', JSON.stringify(user));

            setUser(user);
            setIsAuthenticated(true);

            return { success: true, user };
        } catch (error) {
            const message = error.response?.data?.detail || 'Google login failed';
            return { success: false, error: message };
        }
    };

    // Firebase-enhanced Google Sign-in
    const googleSignInWithFirebase = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const firebaseUser = result.user;
            const idToken = await firebaseUser.getIdToken();

            const response = await authAPI.googleAuth(idToken);
            const { user, access_token } = response.data;

            localStorage.setItem('access_token', access_token);
            localStorage.setItem('user', JSON.stringify(user));

            setUser(user);
            setIsAuthenticated(true);

            return { success: true, user };
        } catch (error) {
            return { success: false, error: error.message || 'Google sign-in failed' };
        }
    };

    // Password Reset with Firebase
    const resetPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
            return { success: true, message: 'Password reset email sent successfully' };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to send reset email' };
        }
    };

    // Send Email Verification
    const sendVerificationEmail = async () => {
        try {
            if (auth.currentUser) {
                await sendEmailVerification(auth.currentUser);
                return { success: true, message: 'Verification email sent' };
            }
            return { success: false, error: 'No user logged in' };
        } catch (error) {
            return { success: false, error: error.message || 'Failed to send verification email' };
        }
    };

    const logout = () => {
        // Sign out from Firebase
        firebaseSignOut(auth).catch(console.error);

        // Clear local storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setUser(null);
        setIsAuthenticated(false);
    };

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        googleLogin,
        googleSignInWithFirebase,
        resetPassword,
        sendVerificationEmail,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
