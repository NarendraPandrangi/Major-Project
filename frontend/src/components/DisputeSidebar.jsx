import React from 'react';
import { Shield, FileText, User, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DisputeSidebar = ({
    dispute,
    isDefendant,
    canAccept,
    accepting,
    handleAccept,
    handleReject
}) => {
    return (
        <div className="details-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', minWidth: '300px' }}>
            {/* Action Banner for Defendant */}
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
    );
};

export default DisputeSidebar;
