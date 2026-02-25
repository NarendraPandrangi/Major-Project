import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { FileText, Printer, Download } from 'lucide-react';

const SettlementAgreement = ({ dispute, onClose }) => {
    const componentRef = useRef();

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Settlement_Agreement_${dispute.id}`,
    });

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }}>
            <div className="settlement-modal" style={{
                background: 'white',
                width: '90%',
                maxWidth: '850px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                {/* Header Actions */}
                <div style={{
                    padding: '1rem',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#f9fafb'
                }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={20} /> Settlement Agreement
                    </h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={handlePrint} className="btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <Printer size={18} /> Print / Save as PDF
                        </button>
                        <button onClick={onClose} className="btn-secondary">Close</button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div style={{ overflowY: 'auto', padding: '2rem', flex: 1, background: '#525659' }}>
                    <div ref={componentRef} style={{
                        background: 'white',
                        padding: '3rem',
                        margin: '0 auto',
                        maxWidth: '210mm', // A4 width
                        minHeight: '297mm', // A4 height
                        boxShadow: '0 0 10px rgba(0,0,0,0.1)'
                    }}>
                        {/* Document Content */}
                        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                            <h1 style={{ fontSize: '24px', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '2px' }}>Settlement Agreement</h1>
                            <p style={{ color: '#666' }}>Case ID: {dispute.id}</p>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <p>This Settlement Agreement ("Agreement") is entered into on <strong>{new Date(dispute.updated_at).toLocaleDateString()}</strong> by and between:</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                            <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ margin: '0 0 1rem 0', fontSize: '16px', color: '#475569', textTransform: 'uppercase' }}>Plaintiff</h3>
                                <p style={{ margin: 0, fontWeight: 'bold' }}>{dispute.creator_email}</p>
                            </div>
                            <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ margin: '0 0 1rem 0', fontSize: '16px', color: '#475569', textTransform: 'uppercase' }}>Defendant</h3>
                                <p style={{ margin: 0, fontWeight: 'bold' }}>{dispute.defendant_email}</p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <h3 style={{ fontSize: '18px', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>1. Dispute Details</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '8px 0', width: '150px', color: '#64748b' }}>Dispute Title:</td>
                                        <td style={{ padding: '8px 0', fontWeight: '500' }}>{dispute.title}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '8px 0', color: '#64748b' }}>Category:</td>
                                        <td style={{ padding: '8px 0' }}>{dispute.category}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '8px 0', color: '#64748b', verticalAlign: 'top' }}>Description:</td>
                                        <td style={{ padding: '8px 0', lineHeight: '1.6' }}>{dispute.description}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div style={{ marginBottom: '3rem' }}>
                            <h3 style={{ fontSize: '18px', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>2. Terms of Resolution</h3>
                            <p style={{ marginBottom: '1rem' }}>Both parties agree to resolve the dispute under the following terms:</p>
                            <div style={{ padding: '1.5rem', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', color: '#166534', lineHeight: '1.7' }}>
                                {dispute.resolution_text}
                            </div>
                        </div>

                        <div style={{ marginBottom: '4rem' }}>
                            <h3 style={{ fontSize: '18px', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>3. Agreement & Signatures</h3>
                            <p style={{ marginBottom: '2rem', lineHeight: '1.6', color: '#4b5563' }}>
                                By digitally signing this document, the parties acknowledge that they have read, understood, and voluntarily agreed to the terms of this specific resolution. This agreement serves as a full and final settlement of the dispute.
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', marginTop: '2rem' }}>
                                <div>
                                    <div style={{ borderBottom: '1px solid #000', height: '40px', marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-end' }}>
                                        <span style={{ fontFamily: 'Dancing Script, cursive', fontSize: '24px' }}>
                                            {(dispute.signatures || []).find(s => s.party_role === 'plaintiff')?.typed_name ||
                                                dispute.creator_email.split('@')[0]}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Signature of Plaintiff</p>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>Date: {new Date(dispute.updated_at).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <div style={{ borderBottom: '1px solid #000', height: '40px', marginBottom: '0.5rem', display: 'flex', alignItems: 'flex-end' }}>
                                        <span style={{ fontFamily: 'Dancing Script, cursive', fontSize: '24px' }}>
                                            {(dispute.signatures || []).find(s => s.party_role === 'defendant')?.typed_name ||
                                                dispute.defendant_email.split('@')[0]}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Signature of Defendant</p>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>Date: {new Date(dispute.updated_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid #e2e8f0', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                            <p>Generated by AI Dispute Resolution Platform &bull; {new Date().toLocaleDateString()}</p>
                            <p>This is a digitally generated document and is valid without physical seal.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettlementAgreement;
