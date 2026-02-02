import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import DisputeForm from './pages/DisputeForm';
import DisputeDetails from './pages/DisputeDetails';
import AdminPanel from './pages/AdminPanel';
import DisputeList from './pages/DisputeList';
import './emailConfigValidator'; // Validate email config on startup
import './index.css';


// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh'
            }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh'
            }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <PublicRoute>
                                <Register />
                            </PublicRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dispute/new"
                        element={
                            <ProtectedRoute>
                                <DisputeForm />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dispute/filed"
                        element={
                            <ProtectedRoute>
                                <DisputeList type="filed" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dispute/against"
                        element={
                            <ProtectedRoute>
                                <DisputeList type="against" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dispute/all"
                        element={
                            <ProtectedRoute>
                                <DisputeList type="all" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dispute/:id/*"
                        element={
                            <ProtectedRoute>
                                <DisputeDetails />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute>
                                <AdminPanel />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" />} />

                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
