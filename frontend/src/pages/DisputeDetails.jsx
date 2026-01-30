import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { disputeAPI, aiAPI } from '../api/client';
import Chat from '../components/Chat';
import { FileText, Calendar, User, ArrowLeft, Shield, AlertTriangle, Scale, CheckCircle, Sparkles } from 'lucide-react';
import { sendDisputeAcceptedEmail, sendDisputeRejectedEmail } from '../services/emailService';
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

    // AI State
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [activeTab, setActiveTab] = useState('resolution');

    useEffect(() => {
        fetchDispute();
    }, [id]);

    const fetchDispute = async () => {
        try {
            const response = await disputeAPI.getById(id);
            setDispute(response.data);
            if (response.data.ai_analysis) {
                setAiAnalysis(response.data.ai_analysis);
            }
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
                    category: dispute.category
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
                    category: dispute.category
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

    const handleGenerateSuggestions = async () => {
        setAnalyzing(true);
        try {
            const response = await aiAPI.getSuggestions(id);
            if (response.data.raw_response) {
                // setAiAnalysis is no longer strictly needed if we fetchDispute, but kept for immediate feedback if needed
                setAiAnalysis(response.data.raw_response);
                await fetchDispute(); // Refresh to ensure both parties see it if they reload or it's saved
            } else {
                setAiAnalysis("No suggestions could be generated at this time.");
            }
        } catch (err) {
            console.error('AI Error:', err);
            alert('Failed to generate suggestions.');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleAgree = async (resolutionContent) => {
        try {
            await disputeAPI.agree(id, resolutionContent);
            await fetchDispute();
        } catch (err) {
            console.error('Agreement Error:', err);
            alert('Failed to register agreement.');
        }
    };

    // ... [loading and error handling] ...

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

                {/* Action Banner for Defendant */}
                {canAccept && (
                    <div className="action-banner" style={{
                        background: 'var(--primary-50)',
                        border: '1px solid var(--primary-200)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--spacing-lg)',
                        marginBottom: 'var(--spacing-xl)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <Shield size={32} color="var(--primary-600)" />
                            <div>
                                <h3 style={{ margin: 0, color: 'var(--primary-900)' }}>Action Required</h3>
                                <p style={{ margin: 0, color: 'var(--primary-700)' }}>Accept this case to begin the resolution process and open live chat.</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={handleAccept}
                                disabled={accepting}
                                className="btn-primary"
                            >
                                {accepting ? 'Processing...' : 'Accept Case'}
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={accepting}
                                className="btn-danger"
                                style={{
                                    background: 'var(--error-600)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.5rem 1rem',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Reject Case
                            </button>
                        </div>
                    </div>
                )}

                <div className="details-grid">

                    {/* Left Column: Sidebar (Case Info + Details) */}
                    <div className="details-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', minWidth: '300px' }}>
                        {/* Action Banner for Defendant (Moved here for visibility) */}
                        {canAccept && (
                            <div className="action-banner" style={{
                                background: 'var(--primary-50)',
                                border: '1px solid var(--primary-200)',
                                borderRadius: 'var(--radius-lg)',
                                padding: 'var(--spacing-lg)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                alignItems: 'center',
                                textAlign: 'center'
                            }}>
                                <Shield size={32} color="var(--primary-600)" />
                                <div>
                                    <h3 style={{ margin: 0, color: 'var(--primary-900)' }}>Action Required</h3>
                                    <p style={{ margin: 0, color: 'var(--primary-700)', fontSize: '0.9rem' }}>Accept this case to begin resolution.</p>
                                </div>
                                <button
                                    onClick={handleAccept}
                                    disabled={accepting}
                                    className="btn-primary"
                                    style={{ width: '100%' }}
                                >
                                    {accepting ? 'Accepting...' : 'Accept Case'}
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={accepting}
                                    className="btn-danger"
                                    style={{
                                        background: 'var(--error-600)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '0.5rem 1rem',
                                        borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        width: '100%'
                                    }}
                                >
                                    Reject Case
                                </button>
                            </div>
                        )}

                        <div className="details-card">
                            <h3 className="card-title"><Shield size={24} /> Case Info</h3>
                            <div className="sidebar-info">
                                <div className="sidebar-row">
                                    <span className="row-label">Category</span>
                                    <span className="row-value">{dispute.category}</span>
                                </div>
                                <div className="sidebar-row">
                                    <span className="row-label">Amount</span>
                                    <span className="row-value">{dispute.amount_disputed ? `$${dispute.amount_disputed}` : 'N/A'}</span>
                                </div>
                                <div className="sidebar-row">
                                    <span className="row-label">Date</span>
                                    <span className="row-value">{new Date(dispute.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="details-card">
                            <h3 className="card-title"><FileText size={24} /> Details</h3>
                            <div className="info-group">
                                <label className="info-label">Description</label>
                                <p className="info-value description-text">{dispute.description}</p>
                            </div>
                            {/* Evidence Info */}
                            {dispute.evidence_file && (
                                <div className="info-group" style={{ marginTop: '1rem' }}>
                                    <label className="info-label">Evidence</label>
                                    <div className="evidence-display">
                                        <a
                                            href={dispute.evidence_file}
                                            download="evidence_doc"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-600)', textDecoration: 'none' }}
                                        >
                                            <FileText size={16} /> View Evidence
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="details-card">
                            <h3 className="card-title"><User size={24} /> Parties</h3>
                            <div className="info-group">
                                <label className="info-label">Plaintiff</label>
                                <div className="info-value">{dispute.creator_email}</div>
                            </div>
                            <div className="info-group">
                                <label className="info-label">Defendant</label>
                                <div className="info-value">{dispute.defendant_email}</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Tabs (Chat & Resolution) */}
                    <div className="details-main-col" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>

                        {/* Tab Navigation */}
                        {showChat && (
                            <div className="tabs-container" style={{ borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
                                <button
                                    className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('chat')}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        fontWeight: activeTab === 'chat' ? '600' : '400',
                                        color: activeTab === 'chat' ? 'var(--primary-600)' : 'var(--text-secondary)',
                                        background: 'none',
                                        border: 'none',
                                        borderBottom: activeTab === 'chat' ? '2px solid var(--primary-600)' : '2px solid transparent',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Live Chat
                                </button>
                                <button
                                    className={`tab-btn ${activeTab === 'resolution' ? 'active' : ''}`}
                                    onClick={() => setActiveTab('resolution')}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        fontWeight: activeTab === 'resolution' ? '600' : '400',
                                        color: activeTab === 'resolution' ? 'var(--primary-600)' : 'var(--text-secondary)',
                                        background: 'none',
                                        border: 'none',
                                        borderBottom: activeTab === 'resolution' ? '2px solid var(--primary-600)' : '2px solid transparent',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Resolution & AI
                                </button>
                            </div>
                        )}

                        {/* Tab Content: Chat */}
                        {showChat && activeTab === 'chat' && (
                            <div className="tab-content fade-in">
                                <Chat disputeId={id} />
                            </div>
                        )}

                        {/* Tab Content: Resolution */}
                        {(activeTab === 'resolution' || !showChat) && (
                            <div className="tab-content fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>


                                {/* AI Suggestions Section */}
                                <div className="details-card ai-suggestions-card">
                                    <h3 className="card-title" style={{ color: 'var(--accent-700)' }}>
                                        <Scale size={24} /> AI Resolution Analysis
                                    </h3>
                                    <p className="info-value">
                                        Our AI system analyzes the dispute details and chat history to provide fair and unbiased suggestions.
                                    </p>

                                    {aiAnalysis ? (
                                        <div className="ai-analysis-content fade-in" style={{ marginTop: '1rem' }}>
                                            <div style={{ whiteSpace: 'pre-wrap', marginBottom: '1.5rem', fontStyle: 'italic', color: 'var(--text-primary)' }}>{aiAnalysis}</div>

                                            {dispute.ai_suggestions && dispute.ai_suggestions.length > 0 && (
                                                <div className="suggestions-list" style={{ display: 'grid', gap: '1rem' }}>
                                                    {dispute.ai_suggestions.map((suggestion, idx) => (
                                                        <div key={idx} style={{
                                                            padding: '1rem',
                                                            border: '1px solid var(--border-color)',
                                                            borderRadius: '8px',
                                                            background: 'var(--surface)',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: '1rem'
                                                        }}>
                                                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Option {suggestion.id}</div>
                                                            <div style={{ color: 'var(--text-secondary)' }}>{suggestion.text}</div>
                                                            <button
                                                                className="btn-primary-sm"
                                                                style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                                onClick={() => handleAgree(suggestion.text)}
                                                            >
                                                                <CheckCircle size={16} /> Accept This Option
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <button
                                                onClick={handleGenerateSuggestions}
                                                disabled={analyzing}
                                                className="btn-secondary"
                                                style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center' }}
                                            >
                                                {analyzing ? 'Regenerating...' : 'Regenerate Analysis'}
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleGenerateSuggestions}
                                            disabled={analyzing}
                                            className="analyze-btn"
                                        >
                                            {analyzing ? (
                                                <>
                                                    <div className="spinner" style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent' }}></div>
                                                    Generating Analysis...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles size={20} />
                                                    Generate AI Suggestions
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {/* Resolution Acceptance Section */}
                                {showChat && dispute.status !== 'Resolved' && (
                                    <div className="details-card" style={{ border: '2px solid var(--primary-200)', background: 'var(--primary-50)' }}>
                                        <h3 className="card-title" style={{ color: 'var(--primary-800)' }}><CheckCircle size={24} /> Agreed Resolution</h3>

                                        {dispute.resolution_text ? (
                                            <div style={{ marginBottom: '1rem', padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid var(--primary-200)' }}>
                                                <strong>Proposed Resolution:</strong>
                                                <p style={{ marginTop: '0.5rem' }}>{dispute.resolution_text}</p>
                                            </div>
                                        ) : (
                                            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                                                Select an option from the AI suggestions above or agree in chat.
                                            </p>
                                        )}

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div className={`agreement-status ${dispute.plaintiff_agreed ? 'agreed' : ''}`} style={{ padding: '1rem', background: 'white', borderRadius: '8px', border: dispute.plaintiff_agreed ? '2px solid var(--success-500)' : '1px solid var(--border-color)' }}>
                                                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Plaintiff</div>
                                                {dispute.plaintiff_agreed ? (
                                                    <span style={{ color: 'var(--success-600)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16} /> Agreed</span>
                                                ) : (
                                                    <span style={{ color: 'var(--text-secondary)' }}>Pending...</span>
                                                )}
                                                {isPlaintiff && !dispute.plaintiff_agreed && dispute.resolution_text && (
                                                    <button onClick={() => handleAgree(null)} className="btn-primary-sm" style={{ marginTop: '0.5rem', width: '100%' }}>Confirm Agreement</button>
                                                )}
                                            </div>
                                            <div className={`agreement-status ${dispute.defendant_agreed ? 'agreed' : ''}`} style={{ padding: '1rem', background: 'white', borderRadius: '8px', border: dispute.defendant_agreed ? '2px solid var(--success-500)' : '1px solid var(--border-color)' }}>
                                                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Defendant</div>
                                                {dispute.defendant_agreed ? (
                                                    <span style={{ color: 'var(--success-600)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16} /> Agreed</span>
                                                ) : (
                                                    <span style={{ color: 'var(--text-secondary)' }}>Pending...</span>
                                                )}
                                                {isDefendant && !dispute.defendant_agreed && dispute.resolution_text && (
                                                    <button onClick={() => handleAgree(null)} className="btn-primary-sm" style={{ marginTop: '0.5rem', width: '100%' }}>Confirm Agreement</button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Official Agreement Document */}
                                {dispute.status === 'Resolved' && (
                                    <div className="details-card" style={{ border: '2px solid var(--success-300)', background: 'var(--success-50)' }}>
                                        <h3 className="card-title" style={{ color: 'var(--success-800)' }}><FileText size={24} /> Official Settlement Agreement</h3>
                                        <div className="agreement-doc" style={{ padding: '2rem', background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                                            <h2 style={{ textAlign: 'center', marginBottom: '2rem', textDecoration: 'underline' }}>SETTLEMENT AGREEMENT</h2>

                                            <div style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                <div>
                                                    <p><strong>Case ID:</strong> {dispute.id}</p>
                                                    <p><strong>Date Resolved:</strong> {new Date(dispute.updated_at).toLocaleDateString()}</p>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p><strong>Status:</strong> Resolved</p>
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '0.5rem', color: '#333' }}>Parties Involved</h4>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                    <div>
                                                        <p style={{ color: '#666', fontSize: '0.875rem' }}>Plaintiff</p>
                                                        <p><strong>{dispute.creator_email}</strong></p>
                                                    </div>
                                                    <div>
                                                        <p style={{ color: '#666', fontSize: '0.875rem' }}>Defendant</p>
                                                        <p><strong>{dispute.defendant_email}</strong></p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '0.5rem', color: '#333' }}>Dispute Details</h4>
                                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                                    <tbody>
                                                        <tr>
                                                            <td style={{ padding: '4px 0', width: '100px', color: '#666' }}>Title:</td>
                                                            <td style={{ padding: '4px 0', fontWeight: '500' }}>{dispute.title}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ padding: '4px 0', color: '#666' }}>Category:</td>
                                                            <td style={{ padding: '4px 0' }}>{dispute.category}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ padding: '4px 0', color: '#666', verticalAlign: 'top' }}>Description:</td>
                                                            <td style={{ padding: '4px 0', whiteSpace: 'pre-wrap' }}>{dispute.description}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={{ padding: '4px 0', color: '#666' }}>Amount:</td>
                                                            <td style={{ padding: '4px 0' }}>{dispute.amount_disputed ? `$${dispute.amount_disputed}` : 'N/A'}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div style={{ marginBottom: '2rem' }}>
                                                <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '0.5rem', color: '#333' }}>Agreed Resolution</h4>
                                                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '4px', borderLeft: '4px solid var(--success-500)' }}>
                                                    <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--success-700)' }}>Opted Suggestion / Terms:</strong>
                                                    {dispute.resolution_text || "No specific resolution text recorded."}
                                                </div>
                                            </div>

                                            <p style={{ fontStyle: 'italic', fontSize: '0.9rem', color: '#666', lineHeight: '1.5' }}>
                                                By signing below (digitally), both parties acknowledge and accept the terms of this resolution as being full and final settlement of this dispute.
                                            </p>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3rem' }}>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ borderBottom: '1px solid black', width: '200px', marginBottom: '0.5rem', fontFamily: 'cursive', fontSize: '1.2rem' }}>{dispute.creator_email.split('@')[0]}</div>
                                                    <p style={{ fontSize: '0.875rem', color: '#666' }}>Plaintiff Signature (Digital)</p>
                                                </div>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{ borderBottom: '1px solid black', width: '200px', marginBottom: '0.5rem', fontFamily: 'cursive', fontSize: '1.2rem' }}>{dispute.defendant_email.split('@')[0]}</div>
                                                    <p style={{ fontSize: '0.875rem', color: '#666' }}>Defendant Signature (Digital)</p>
                                                </div>
                                            </div>

                                            <div style={{ marginTop: '3rem', textAlign: 'center', color: '#999', fontSize: '0.75rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                                                <p>Generated by AI Dispute Resolution Platform • {new Date().toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <button className="btn-primary" style={{ marginTop: '1rem', width: '100%' }} onClick={() => window.print()}>
                                            Print / Download Agreement
                                        </button>
                                    </div>
                                )}
                            </div>

                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default DisputeDetails;


