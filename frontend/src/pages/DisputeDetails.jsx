import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { disputeAPI } from '../api/client';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { sendDisputeAcceptedEmail, sendDisputeRejectedEmail } from '../services/emailService';
import DisputeSidebar from '../components/DisputeSidebar';
import DisputeAISolutions from './DisputeAISolutions';
import DisputeChatPage from './DisputeChatPage';
import './DisputeDetails.css';

const DisputeDetails = () => {
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const [dispute, setDispute] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [accepting, setAccepting] = useState(false);

    useEffect(() => {
        fetchDispute();
    }, [id]);

    const fetchDispute = async () => {
        try {
            const response = await disputeAPI.getById(id);
            const disputeData = response.data;

            // Parse ai_suggestions if it's a string
            if (disputeData.ai_suggestions && typeof disputeData.ai_suggestions === 'string') {
                try {
                    disputeData.ai_suggestions = JSON.parse(disputeData.ai_suggestions);
                } catch (e) {
                    console.error('Failed to parse ai_suggestions:', e);
                    disputeData.ai_suggestions = [];
                }
            }

            setDispute(disputeData);
        } catch (err) {
            console.error('Failed to fetch dispute:', err);
            setError('Failed to load dispute details. It may not exist or if you do not have permission.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this case? This action cannot be undone.')) {
            return;
        }

        setDeleting(true);
        try {
            await disputeAPI.delete(id);
            navigate('/dashboard');
        } catch (err) {
            console.error('Failed to delete dispute:', err);
            alert('Failed to delete dispute. ' + (err.response?.data?.detail || err.message));
            setDeleting(false);
        }
    };

    const handleAccept = async () => {
        setAccepting(true);
        try {
            await disputeAPI.accept(id);

            // Send email notification to plaintiff (using separate dispute service)
            if (dispute) {
                const emailParams = {
                    to_email: dispute.creator_email,
                    to_name: dispute.creator_email.split('@')[0],
                    dispute_id: dispute.id,
                    dispute_title: dispute.title,
                    category: dispute.category,
                    message: "The defendant has accepted your dispute. You can now proceed to negotiate a resolution.",
                    action: "Start Negotiation"
                };

                sendDisputeAcceptedEmail(emailParams)
                    .then(result => {
                        if (result.success) {
                            console.log('Acceptance notification email sent to plaintiff');
                        }
                    })
                    .catch(err => console.error('Failed to send acceptance email:', err));
            }

            await fetchDispute(); // Refresh to update status
        } catch (err) {
            console.error('Failed to accept dispute:', err);
            alert('Failed to accept dispute. ' + (err.response?.data?.detail || err.message));
        } finally {
            setAccepting(false);
        }
    };

    const handleReject = async () => {
        if (!window.confirm("Are you sure you want to reject this case?")) return;
        setAccepting(true);
        try {
            await disputeAPI.reject(id);

            // Send email notification to plaintiff (using separate dispute service)
            if (dispute) {
                const emailParams = {
                    to_email: dispute.creator_email,
                    to_name: dispute.creator_email.split('@')[0],
                    dispute_id: dispute.id,
                    dispute_title: dispute.title,
                    category: dispute.category,
                    message: "The defendant has rejected your dispute. Please review the case status.",
                    action: "View Dispute Details"
                };

                sendDisputeRejectedEmail(emailParams)
                    .then(result => {
                        if (result.success) {
                            console.log('Rejection notification email sent to plaintiff');
                        }
                    })
                    .catch(err => console.error('Failed to send rejection email:', err));
            }

            await fetchDispute();
        } catch (err) {
            console.error('Failed to reject dispute:', err);
            alert('Failed to reject dispute.');
        } finally {
            setAccepting(false);
        }
    };

    if (loading) return (
        <div className="dispute-details-container">
            <div className="spinner" style={{ width: '3rem', height: '3rem' }}></div>
        </div>
    );

    if (error) return (
        <div className="dispute-details-container">
            <div className="details-error">
                <AlertTriangle size={48} style={{ margin: '0 auto', marginBottom: '1rem' }} />
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{ marginTop: '2rem' }}>Back to Dashboard</button>
            </div>
        </div>
    );
    if (!dispute) return null;

    const isPlaintiff = user && (user.email === dispute.creator_email || user.id === dispute.user_id);
    const isDefendant = user && (user.email === dispute.defendant_email);
    const showChat = dispute.status === 'InProgress' || dispute.status === 'Resolved';
    const canAccept = isDefendant && dispute.status === 'Open';

    return (
        <div className="dispute-details-container">
            <div className="dispute-details-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button onClick={() => navigate('/dashboard')} className="btn-back">
                        <ArrowLeft size={18} /> Back to Dashboard
                    </button>

                    {isPlaintiff && (
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="btn-danger"
                            style={{
                                background: 'var(--error-50)',
                                color: 'var(--error-700)',
                                border: '1px solid var(--error-200)',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.375rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontWeight: '600'
                            }}
                        >
                            {deleting ? 'Deleting...' : (
                                <>
                                    <AlertTriangle size={16} />
                                    Delete Case
                                </>
                            )}
                        </button>
                    )}
                </div>

                <div className="details-header">
                    <div className="header-left">
                        <h1>{dispute.title}</h1>
                        <span className="dispute-id">Case ID: {dispute.id}</span>
                    </div>
                    <div className={`status-badge-lg status-${dispute.status}`}>
                        {dispute.status}
                    </div>
                </div>

                <div className="details-grid">
                    {/* Left Column: Sidebar (Case Info + Details) */}
                    <DisputeSidebar
                        dispute={dispute}
                        isDefendant={isDefendant}
                        canAccept={canAccept}
                        accepting={accepting}
                        handleAccept={handleAccept}
                        handleReject={handleReject}
                    />

                    {/* Right Column: Routes (Chat & Resolution) */}
                    <div className="details-main-col" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>

                        {/* Tab Navigation */}
                        {showChat && (
                            <div className="tabs-container" style={{ borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
                                <NavLink
                                    to="chat"
                                    className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
                                    style={({ isActive }) => ({
                                        padding: '0.5rem 1rem',
                                        fontWeight: isActive ? '600' : '400',
                                        color: isActive ? 'var(--primary-600)' : 'var(--text-secondary)',
                                        background: 'none',
                                        border: 'none',
                                        borderBottom: isActive ? '2px solid var(--primary-600)' : '2px solid transparent',
                                        cursor: 'pointer',
                                        textDecoration: 'none'
                                    })}
                                >
                                    Live Chat
                                </NavLink>
                                <NavLink
                                    to="ai"
                                    className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
                                    style={({ isActive }) => ({
                                        padding: '0.5rem 1rem',
                                        fontWeight: isActive ? '600' : '400',
                                        color: isActive ? 'var(--primary-600)' : 'var(--text-secondary)',
                                        background: 'none',
                                        border: 'none',
                                        borderBottom: isActive ? '2px solid var(--primary-600)' : '2px solid transparent',
                                        cursor: 'pointer',
                                        textDecoration: 'none'
                                    })}
                                >
                                    Resolution & AI
                                </NavLink>
                            </div>
                        )}

                        <Routes>
                            {/* Default route redirects to AI or Chat depending on preference. AI is usually the 'main' resolution tool if chat hasn't started or parallel. */}
                            <Route index element={<Navigate to="ai" replace />} />

                            <Route
                                path="chat"
                                element={
                                    showChat ?
                                        <DisputeChatPage disputeId={id} /> :
                                        <Navigate to="../ai" replace />
                                }
                            />

                            <Route
                                path="ai"
                                element={
                                    <DisputeAISolutions
                                        dispute={dispute}
                                        isPlaintiff={isPlaintiff}
                                        isDefendant={isDefendant}
                                        onRefresh={fetchDispute}
                                    />
                                }
                            />
                        </Routes>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DisputeDetails;
