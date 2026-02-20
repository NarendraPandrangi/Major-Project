import React, { useState } from 'react';
import { Scale, CheckCircle, Sparkles, Clock, FileText, ShieldAlert } from 'lucide-react';
import { aiAPI, disputeAPI } from '../api/client';
import ESignatureModal from '../components/ESignatureModal';

const DisputeAISolutions = ({ dispute, isPlaintiff, isDefendant, onRefresh }) => {
    const [analyzing, setAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState(dispute.ai_analysis || null);
    const [showSignModal, setShowSignModal] = useState(false);
    const [selectedResolution, setSelectedResolution] = useState(null);
    const [signingInfo, setSigningInfo] = useState(null);

    // Sync local state with prop when it changes
    React.useEffect(() => {
        setAiAnalysis(dispute.ai_analysis);
    }, [dispute.ai_analysis]);

    const handleGenerateSuggestions = async (force = false) => {
        setAnalyzing(true);
        try {
            const response = await aiAPI.getSuggestions(dispute.id, force);
            if (response.data.raw_response) {
                setAiAnalysis(response.data.raw_response);
                if (onRefresh) await onRefresh();
            } else {
                setAiAnalysis("No suggestions could be generated at this time.");
            }
        } catch (err) {
            console.error('AI Error:', err);
            const msg = err.response?.data?.detail || err.response?.data?.raw_response || err.message || 'Failed to generate suggestions.';
            alert(`Error: ${msg}`);
        } finally {
            setAnalyzing(false);
        }
    };

    const openSignModalForResolution = async (resolutionContent) => {
        if (!resolutionContent) return;
        try {
            const { data } = await disputeAPI.getSigningInfo(dispute.id);
            setSigningInfo(data);
            setSelectedResolution(resolutionContent);
            setShowSignModal(true);
        } catch (err) {
            console.error('Signing info error', err);
            const msg = err.response?.data?.detail || 'Failed to prepare agreement for signing.';
            alert(msg);
        }
    };

    const handleSignatureSubmit = async ({ signature_type, typed_name, signature_image_data }) => {
        if (!signingInfo) {
            throw new Error('Missing signing metadata');
        }

        const party_role = signingInfo.is_plaintiff ? 'plaintiff' : (signingInfo.is_defendant ? 'defendant' : null);
        if (!party_role) {
            throw new Error('You are not authorized to sign this agreement');
        }

        const payload = {
            party_role,
            signature_type,
            typed_name,
            signature_image_data,
            document_version: signingInfo.agreement_document_version,
            document_hash: signingInfo.agreement_document_hash,
            resolution_text: selectedResolution,
        };

        await disputeAPI.sign(dispute.id, payload);
        if (onRefresh) await onRefresh();
    };

    const hasSuggestions = dispute.ai_suggestions && Array.isArray(dispute.ai_suggestions) && dispute.ai_suggestions.length > 0;

    return (
        <div className="tab-content fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* AI Suggestions Section */}
            <div className="details-card ai-suggestions-card" style={{
                background: 'linear-gradient(135deg, #f8f4ff 0%, #fff5f8 100%)',
                border: '3px solid var(--accent-400)',
                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.15)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* AI Badge */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    background: 'linear-gradient(135deg, var(--accent-500), var(--accent-600))',
                    color: 'white',
                    padding: '0.5rem 1.5rem',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    letterSpacing: '0.05em',
                    borderBottomLeftRadius: '12px',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                }}>
                    🤖 AI POWERED
                </div>

                <h3 className="card-title" style={{
                    color: 'var(--accent-700)',
                    fontSize: '1.75rem',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <Scale size={28} /> AI Resolution Suggestions
                </h3>
                <p className="info-value" style={{
                    color: 'var(--text-secondary)',
                    marginBottom: '1.5rem',
                    fontSize: '0.95rem'
                }}>
                    Our AI analyzes your dispute and provides fair, unbiased resolution options based on similar cases.
                </p>

                {aiAnalysis ? (
                    <div className="ai-analysis-content fade-in" style={{ marginTop: '1rem' }}>
                        {/* Analysis Text */}
                        <div style={{
                            whiteSpace: 'pre-wrap',
                            marginBottom: '2rem',
                            padding: '1.25rem',
                            background: 'rgba(255, 255, 255, 0.7)',
                            borderLeft: '4px solid var(--accent-500)',
                            borderRadius: '8px',
                            fontStyle: 'italic',
                            color: 'var(--text-primary)',
                            fontSize: '0.95rem',
                            lineHeight: '1.7'
                        }}>
                            {typeof aiAnalysis === 'string' && aiAnalysis.startsWith('{') ?
                                'Analysis generated. See resolution options below.' :
                                aiAnalysis
                            }
                        </div>

                        {hasSuggestions && (
                            <>
                                {/* Section Header */}
                                <div style={{
                                    background: 'linear-gradient(90deg, var(--accent-600), var(--accent-500))',
                                    color: 'white',
                                    padding: '1rem 1.5rem',
                                    borderRadius: '12px',
                                    marginBottom: '1.5rem',
                                    fontWeight: '700',
                                    fontSize: '1.1rem',
                                    textAlign: 'center',
                                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)'
                                }}>
                                    ⚖️ Choose Your Preferred Resolution Option
                                </div>

                                <div className="suggestions-list" style={{ display: 'grid', gap: '1.5rem', marginBottom: '1.5rem' }}>

                                    {dispute.ai_suggestions.map((suggestion, idx) => {
                                        // Handle both object and string formats
                                        const suggestionId = suggestion.id || idx + 1;
                                        const suggestionText = suggestion.text || suggestion;

                                        // Determine if this user has already agreed
                                        const userAgreed = isPlaintiff ? dispute.plaintiff_agreed : (isDefendant ? dispute.defendant_agreed : false);

                                        // Check if this specific option is the one agreed to
                                        // Note: This relies on exact text match. If resolution_text is modified, this might not match.
                                        const isSelected = dispute.resolution_text === suggestionText;

                                        return (
                                            <div key={idx} style={{
                                                padding: '1rem',
                                                border: isSelected ? '2px solid var(--success-500)' : '1px solid var(--border-color)',
                                                borderRadius: '8px',
                                                background: isSelected ? 'var(--success-50)' : 'var(--surface)',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '1rem',
                                                opacity: (userAgreed && !isSelected) ? 0.6 : 1
                                            }}>
                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Option {suggestionId}</div>
                                                <div style={{ color: 'var(--text-secondary)' }}>{suggestionText}</div>
                                                <button
                                                    className={`btn-${isSelected ? 'success' : 'primary'}-sm`}
                                                    style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                    onClick={() => openSignModalForResolution(suggestionText)}
                                                    disabled={userAgreed}
                                                >
                                                    {isSelected ? (
                                                        <><CheckCircle size={16} /> Selected</>
                                                    ) : (
                                                        <><CheckCircle size={16} /> Accept This Option</>
                                                    )}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        <button
                            onClick={() => handleGenerateSuggestions(true)}
                            disabled={analyzing}
                            className="btn-secondary"
                            style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center' }}
                        >
                            {analyzing ? 'Regenerating...' : 'Regenerate Analysis'}
                        </button>

                        {/* Escalation Section */}
                        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                            <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Not satisfied with these options?</h4>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                If you cannot agree on a resolution based on the AI suggestions, you can request to escalate this dispute to a human mediator.
                            </p>

                            {(isPlaintiff ? dispute.plaintiff_escalated : dispute.defendant_escalated) ? (
                                <div style={{ padding: '1rem', background: '#fff0f0', border: '1px solid #ffcaca', color: '#d32f2f', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ShieldAlert size={20} />
                                    <span>You have requested escalation. Waiting for the other party's response.</span>
                                </div>
                            ) : (
                                <button
                                    onClick={async () => {
                                        if (!window.confirm("Are you sure you want to reject all options and request escalation? If the other party also rejects, this will be sent to an admin.")) return;
                                        try {
                                            await disputeAPI.escalate(dispute.id);
                                            if (onRefresh) await onRefresh();
                                        } catch (err) {
                                            console.error('Escalation Error:', err);
                                            alert('Failed to request escalation.');
                                        }
                                    }}
                                    className="btn-danger"
                                    style={{
                                        background: 'transparent',
                                        color: '#d32f2f',
                                        border: '1px solid #d32f2f',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <ShieldAlert size={18} />
                                    Reject Options & Request Escalation
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => handleGenerateSuggestions()}
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

            {/* Pending Approval Banner */}
            {
                dispute.status === 'PendingApproval' && (
                    <div className="details-card" style={{ border: '2px solid var(--warning-300)', background: 'var(--warning-50)' }}>
                        <h3 className="card-title" style={{ color: 'var(--warning-800)' }}><Clock size={24} /> Pending Admin Approval</h3>
                        <p style={{ margin: 0, color: 'var(--text-primary)' }}>
                            Both parties have agreed to a resolution. This case is now pending approval from our admin team.
                            You will be notified once the resolution has been reviewed.
                        </p>
                        {dispute.resolution_text && (
                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid var(--warning-200)' }}>
                                <strong>Agreed Resolution:</strong>
                                <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>{dispute.resolution_text}</p>
                            </div>
                        )}
                    </div>
                )
            }

            {/* Official Agreement Document */}
            {
                dispute.status === 'Resolved' && (
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
                                    <div style={{ borderBottom: '1px solid black', width: '200px', marginBottom: '0.5rem', fontFamily: 'cursive', fontSize: '1.2rem' }}>
                                        {(dispute.signatures || []).find(s => s.party_role === 'plaintiff')?.typed_name ||
                                            dispute.creator_email.split('@')[0]}
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: '#666' }}>Plaintiff Signature (Digital)</p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ borderBottom: '1px solid black', width: '200px', marginBottom: '0.5rem', fontFamily: 'cursive', fontSize: '1.2rem' }}>
                                        {(dispute.signatures || []).find(s => s.party_role === 'defendant')?.typed_name ||
                                            dispute.defendant_email.split('@')[0]}
                                    </div>
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
                )
            }
            {/* E-Signature Modal */}
            <ESignatureModal
                isOpen={showSignModal}
                onClose={() => setShowSignModal(false)}
                onSubmit={handleSignatureSubmit}
                resolutionText={selectedResolution}
            />
        </div >
    );
};

export default DisputeAISolutions;
