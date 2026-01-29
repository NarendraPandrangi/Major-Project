import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, disputeAPI } from '../api/client';
import {
    FileText,
    TrendingUp,
    CheckCircle,
    Clock,
    LogOut,
    User,
    Bell
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const response = await dashboardAPI.getStats();
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        if (!window.confirm("Accept this case to begin resolution?")) return;
        try {
            await disputeAPI.accept(id);
            fetchDashboardStats(); // Refresh stats/list
            navigate(`/dispute/${id}`);
        } catch (err) {
            alert('Failed to accept case: ' + (err.response?.data?.detail || err.message));
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            {/* Header */}
            <header className="dashboard-header">
                <div className="container">
                    <div className="header-content">
                        <div className="header-left">
                            <h1>AI Dispute Resolver</h1>
                        </div>
                        <div className="header-right">
                            <button className="icon-btn">
                                <Bell size={20} />
                            </button>
                            <div className="user-menu">
                                <div className="user-avatar">
                                    {user?.profile_picture ? (
                                        <img src={user.profile_picture} alt={user.full_name || user.username} />
                                    ) : (
                                        <User size={20} />
                                    )}
                                </div>
                                <div className="user-info">
                                    <div className="user-name">{user?.full_name || user?.username}</div>
                                    <div className="user-email">{user?.email}</div>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="container">
                    {/* Welcome Section */}
                    <div className="welcome-section fade-in">
                        <h2>Welcome back, {user?.full_name || user?.username}! 👋</h2>
                        <p>Here's an overview of your dispute resolution activity</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="stats-grid">
                        <div className="stat-card slide-in">
                            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, var(--primary-100), var(--primary-200))' }}>
                                <FileText size={24} style={{ color: 'var(--primary-700)' }} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{stats?.total_disputes || 0}</div>
                                <div className="stat-label">Total Disputes</div>
                            </div>
                        </div>

                        <div className="stat-card slide-in" style={{ animationDelay: '0.1s' }}>
                            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, var(--warning-light), hsl(38, 92%, 85%))' }}>
                                <Clock size={24} style={{ color: 'var(--warning)' }} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{stats?.pending_disputes || 0}</div>
                                <div className="stat-label">Pending</div>
                            </div>
                        </div>

                        <div className="stat-card slide-in" style={{ animationDelay: '0.2s' }}>
                            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, var(--success-light), hsl(142, 76%, 85%))' }}>
                                <CheckCircle size={24} style={{ color: 'var(--success)' }} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{stats?.resolved_disputes || 0}</div>
                                <div className="stat-label">Resolved</div>
                            </div>
                        </div>

                        <div className="stat-card slide-in" style={{ animationDelay: '0.3s' }}>
                            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, var(--accent-100), var(--accent-200))' }}>
                                <TrendingUp size={24} style={{ color: 'var(--accent-700)' }} />
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{stats?.disputes_filed || 0}</div>
                                <div className="stat-label">Filed by You</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="quick-actions fade-in">
                        <h3>Quick Actions</h3>
                        <div className="actions-grid">
                            <button className="action-card" onClick={() => navigate('/dispute/new')}>
                                <FileText size={32} />
                                <span>File New Dispute</span>
                            </button>
                            <button className="action-card" onClick={() => navigate('/dispute/filed')}>
                                <TrendingUp size={32} />
                                <span>View My Cases</span>
                            </button>
                            <button className="action-card" onClick={() => navigate('/dispute/against')}>
                                <Clock size={32} />
                                <span>Cases Against Me</span>
                            </button>
                        </div>
                    </div>

                    {/* Recent Disputes */}
                    {stats?.recent_disputes && stats.recent_disputes.length > 0 && (
                        <div className="recent-disputes fade-in">
                            <h3>Recent Disputes</h3>
                            <div className="disputes-list">
                                {stats.recent_disputes.map((dispute) => (
                                    <div
                                        key={dispute.id}
                                        className="dispute-item"
                                        onClick={() => navigate(`/dispute/${dispute.id}`)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="dispute-header">
                                            <h4>{dispute.title}</h4>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <span className={`status-badge status-${dispute.status}`}>
                                                    {dispute.status}
                                                </span>
                                                {/* Accept Button for Defendant in Dashboard */}
                                                {user && user.email === dispute.defendant_email && dispute.status === 'Open' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // prevent navigation
                                                            handleAccept(dispute.id);
                                                        }}
                                                        className="btn-primary-sm"
                                                        style={{
                                                            fontSize: '0.75rem',
                                                            padding: '0.25rem 0.5rem',
                                                            background: 'var(--primary-600)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Accept Case
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="dispute-category">{dispute.category}</p>
                                        <p className="dispute-date">
                                            Filed on {new Date(dispute.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
