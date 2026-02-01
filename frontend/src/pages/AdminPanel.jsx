import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../api/client';
import { Shield, CheckCircle, XCircle, Users, FileText, Clock, TrendingUp, AlertTriangle, LogOut } from 'lucide-react';

import './AdminPanel.css';

const AdminPanel = () => {
    const { user, logout } = useAuth();

    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [escalatedDisputes, setEscalatedDisputes] = useState([]);
    const [allDisputes, setAllDisputes] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');
    const [verdictText, setVerdictText] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        // Check if user is admin
        if (!user || user.role !== 'admin') {
            navigate('/dashboard');
            return;
        }

        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, pendingRes, escalatedRes, disputesRes, usersRes] = await Promise.all([
                adminAPI.getStats(),
                adminAPI.getPendingApprovals(),
                adminAPI.getEscalatedDisputes(),
                adminAPI.getAllDisputes(),
                adminAPI.getAllUsers()
            ]);

            setStats(statsRes.data);
            setPendingApprovals(pendingRes.data);
            setEscalatedDisputes(escalatedRes.data);
            setAllDisputes(disputesRes.data);
            setAllUsers(usersRes.data);
        } catch (err) {
            console.error('Failed to fetch admin data:', err);
            alert('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (disputeId) => {
        if (!window.confirm('Are you sure you want to approve this resolution?')) return;

        setProcessing(true);
        try {
            await adminAPI.approveResolution(disputeId, adminNotes);
            alert('Resolution approved successfully');
            setAdminNotes('');
            setSelectedDispute(null);
            await fetchData();
        } catch (err) {
            console.error('Failed to approve resolution:', err);
            alert('Failed to approve resolution: ' + (err.response?.data?.detail || err.message));
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (disputeId) => {
        if (!adminNotes.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }

        if (!window.confirm('Are you sure you want to reject this resolution?')) return;

        setProcessing(true);
        try {
            await adminAPI.rejectResolution(disputeId, adminNotes);
            alert('Resolution rejected. Parties have been notified.');
            setAdminNotes('');
            setSelectedDispute(null);
            await fetchData();
        } catch (err) {
            console.error('Failed to reject resolution:', err);
            alert('Failed to reject resolution: ' + (err.response?.data?.detail || err.message));
        } finally {
            setProcessing(false);
        }
    };

    const handleResolveEscalation = async (disputeId) => {
        if (!verdictText.trim()) {
            alert('Please provide a final verdict/resolution text');
            return;
        }

        if (!window.confirm('This action is binding and will mark the dispute as Resolved. Proceed?')) return;

        setProcessing(true);
        try {
            await adminAPI.resolveEscalation(disputeId, verdictText, adminNotes);
            alert('Verdict issued successfully. Case resolved.');
            setVerdictText('');
            setAdminNotes('');
            setSelectedDispute(null);
            await fetchData();
        } catch (err) {
            console.error('Failed to resolve escalation:', err);
            alert('Failed to issue verdict: ' + (err.response?.data?.detail || err.message));
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-panel-container">
                <div className="spinner" style={{ width: '3rem', height: '3rem' }}></div>
            </div>
        );
    }

    return (
        <div className="admin-panel-container">
            <div className="admin-panel-content">
                {/* Header */}
                <div className="admin-header">
                    <div>
                        <h1><Shield size={32} /> Admin Panel</h1>
                        <p>Manage disputes, approvals, and users</p>
                    </div>
                    <button
                        onClick={() => {
                            logout();
                            navigate('/login');
                        }}
                        className="btn-logout-admin"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: 'var(--surface)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            fontWeight: 600,
                            color: 'var(--text-secondary)'
                        }}
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>


                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card pending">
                        <div className="stat-icon"><Clock size={24} /></div>
                        <div className="stat-info">
                            <div className="stat-value">{stats?.pending_approval || 0}</div>
                            <div className="stat-label">Pending Approval</div>
                        </div>
                    </div>
                    <div className="stat-card resolved">
                        <div className="stat-icon"><CheckCircle size={24} /></div>
                        <div className="stat-info">
                            <div className="stat-value">{stats?.resolved || 0}</div>
                            <div className="stat-label">Resolved</div>
                        </div>
                    </div>
                    <div className="stat-card total">
                        <div className="stat-icon"><FileText size={24} /></div>
                        <div className="stat-info">
                            <div className="stat-value">{stats?.total_disputes || 0}</div>
                            <div className="stat-label">Total Disputes</div>
                        </div>
                    </div>
                    <div className="stat-card users">
                        <div className="stat-icon"><Users size={24} /></div>
                        <div className="stat-info">
                            <div className="stat-value">{stats?.total_users || 0}</div>
                            <div className="stat-label">Total Users</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="admin-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        <Clock size={18} /> Pending Approvals ({pendingApprovals.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'escalated' ? 'active' : ''}`}
                        onClick={() => setActiveTab('escalated')}
                        style={activeTab === 'escalated' ? { color: 'var(--error-600)', borderBottomColor: 'var(--error-600)' } : {}}
                    >
                        <Shield size={18} /> Escalations ({escalatedDisputes.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'disputes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('disputes')}
                    >
                        <FileText size={18} /> All Disputes ({allDisputes.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <Users size={18} /> All Users ({allUsers.length})
                    </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                    {/* Pending Approvals Tab */}
                    {activeTab === 'pending' && (
                        <div className="pending-approvals">
                            {pendingApprovals.length === 0 ? (
                                <div className="empty-state">
                                    <CheckCircle size={48} style={{ color: 'var(--success-500)' }} />
                                    <h3>No Pending Approvals</h3>
                                    <p>All resolutions have been reviewed</p>
                                </div>
                            ) : (
                                <div className="approvals-list">
                                    {pendingApprovals.map((dispute) => (
                                        <div key={dispute.id} className="approval-card">
                                            <div className="approval-header">
                                                <div>
                                                    <h3>{dispute.title}</h3>
                                                    <span className="dispute-id">Case ID: {dispute.id}</span>
                                                </div>
                                                <span className="status-badge status-PendingApproval">
                                                    Pending Approval
                                                </span>
                                            </div>

                                            <div className="approval-details">
                                                <div className="detail-row">
                                                    <span className="label">Category:</span>
                                                    <span className="value">{dispute.category}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="label">Plaintiff:</span>
                                                    <span className="value">{dispute.creator_email}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="label">Defendant:</span>
                                                    <span className="value">{dispute.defendant_email}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="label">Submitted:</span>
                                                    <span className="value">
                                                        {new Date(dispute.pending_approval_since).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="resolution-section">
                                                <h4>Agreed Resolution:</h4>
                                                <div className="resolution-text">
                                                    {dispute.resolution_text || 'No resolution text provided'}
                                                </div>
                                            </div>

                                            {selectedDispute === dispute.id ? (
                                                <div className="admin-action-panel">
                                                    <textarea
                                                        placeholder="Admin notes (optional for approval, required for rejection)..."
                                                        value={adminNotes}
                                                        onChange={(e) => setAdminNotes(e.target.value)}
                                                        rows={4}
                                                        className="admin-notes-input"
                                                    />
                                                    <div className="action-buttons">
                                                        <button
                                                            onClick={() => handleApprove(dispute.id)}
                                                            disabled={processing}
                                                            className="btn-approve"
                                                        >
                                                            <CheckCircle size={18} />
                                                            {processing ? 'Processing...' : 'Approve Resolution'}
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(dispute.id)}
                                                            disabled={processing || !adminNotes.trim()}
                                                            className="btn-reject"
                                                        >
                                                            <XCircle size={18} />
                                                            {processing ? 'Processing...' : 'Reject & Send Back'}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedDispute(null);
                                                                setAdminNotes('');
                                                            }}
                                                            className="btn-cancel"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setSelectedDispute(dispute.id)}
                                                    className="btn-review"
                                                >
                                                    Review & Decide
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Escalated Tab */}
                    {activeTab === 'escalated' && (
                        <div className="escalated-disputes">
                            {escalatedDisputes.length === 0 ? (
                                <div className="empty-state">
                                    <CheckCircle size={48} style={{ color: 'var(--success-500)' }} />
                                    <h3>No Escalated Disputes</h3>
                                    <p>No cases currently require manual intervention</p>
                                </div>
                            ) : (
                                <div className="approvals-list">
                                    {escalatedDisputes.map((dispute) => (
                                        <div key={dispute.id} className="approval-card" style={{ borderLeft: '4px solid var(--error-500)' }}>
                                            <div className="approval-header">
                                                <div>
                                                    <h3>{dispute.title}</h3>
                                                    <span className="dispute-id">Case ID: {dispute.id}</span>
                                                </div>
                                                <span className="status-badge status-Escalated">
                                                    Escalated
                                                </span>
                                            </div>

                                            <div className="approval-details">
                                                <div className="alert-box" style={{ background: 'var(--error-50)', padding: '1rem', border: '1px solid var(--error-200)', borderRadius: '6px', marginBottom: '1rem', color: 'var(--error-800)', display: 'flex', gap: '0.5rem' }}>
                                                    <AlertTriangle size={20} />
                                                    <div>
                                                        <strong>Action Required:</strong> Both parties have rejected automated options. Please review the case and issue a final verdict.
                                                    </div>
                                                </div>

                                                <div className="detail-row">
                                                    <span className="label">Category:</span>
                                                    <span className="value">{dispute.category}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="label">Plaintiff:</span>
                                                    <span className="value">{dispute.creator_email}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="label">Defendant:</span>
                                                    <span className="value">{dispute.defendant_email}</span>
                                                </div>
                                                <div className="detail-row">
                                                    <span className="label">Description:</span>
                                                    <p style={{ margin: '0.5rem 0', whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>{dispute.description}</p>
                                                </div>
                                            </div>

                                            {selectedDispute === dispute.id ? (
                                                <div className="admin-action-panel">
                                                    <h4>Issue Final Verdict</h4>
                                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>This text will become the official settlement agreement.</p>
                                                    <textarea
                                                        placeholder="Enter the final binding resolution terms..."
                                                        value={verdictText}
                                                        onChange={(e) => setVerdictText(e.target.value)}
                                                        rows={6}
                                                        className="admin-notes-input"
                                                        style={{ marginBottom: '1rem' }}
                                                    />
                                                    <textarea
                                                        placeholder="Internal admin notes (optional)..."
                                                        value={adminNotes}
                                                        onChange={(e) => setAdminNotes(e.target.value)}
                                                        rows={2}
                                                        className="admin-notes-input"
                                                    />
                                                    <div className="action-buttons">
                                                        <button
                                                            onClick={() => handleResolveEscalation(dispute.id)}
                                                            disabled={processing || !verdictText.trim()}
                                                            className="btn-approve"
                                                        >
                                                            <CheckCircle size={18} />
                                                            {processing ? 'Processing...' : 'Issue Binding Verdict'}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedDispute(null);
                                                                setVerdictText('');
                                                                setAdminNotes('');
                                                            }}
                                                            className="btn-cancel"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', gap: '1rem' }}>
                                                    <button
                                                        onClick={() => navigate(`/dispute/${dispute.id}`)}
                                                        className="btn-secondary"
                                                    >
                                                        View Full History
                                                    </button>
                                                    <button
                                                        onClick={() => setSelectedDispute(dispute.id)}
                                                        className="btn-review"
                                                        style={{ background: 'var(--error-600)', color: 'white' }}
                                                    >
                                                        Resolve Dispute
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* All Disputes Tab */}

                    {activeTab === 'disputes' && (
                        <div className="all-disputes">
                            <div className="disputes-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Case ID</th>
                                            <th>Title</th>
                                            <th>Category</th>
                                            <th>Status</th>
                                            <th>Plaintiff</th>
                                            <th>Defendant</th>
                                            <th>Created</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allDisputes.map((dispute) => (
                                            <tr key={dispute.id}>
                                                <td className="dispute-id-cell">{dispute.id.substring(0, 8)}...</td>
                                                <td>{dispute.title}</td>
                                                <td>{dispute.category}</td>
                                                <td>
                                                    <span className={`status-badge status-${dispute.status}`}>
                                                        {dispute.status}
                                                    </span>
                                                </td>
                                                <td>{dispute.creator_email}</td>
                                                <td>{dispute.defendant_email}</td>
                                                <td>{new Date(dispute.created_at).toLocaleDateString()}</td>
                                                <td>
                                                    <button
                                                        onClick={() => navigate(`/dispute/${dispute.id}`)}
                                                        className="btn-view-small"
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* All Users Tab */}
                    {activeTab === 'users' && (
                        <div className="all-users">
                            <div className="users-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Email</th>
                                            <th>Username</th>
                                            <th>Full Name</th>
                                            <th>Role</th>
                                            <th>Auth Provider</th>
                                            <th>Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allUsers.map((u) => (
                                            <tr key={u.id}>
                                                <td>{u.email}</td>
                                                <td>{u.username}</td>
                                                <td>{u.full_name || '-'}</td>
                                                <td>
                                                    <span className={`role-badge role-${u.role}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td>{u.auth_provider}</td>
                                                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
