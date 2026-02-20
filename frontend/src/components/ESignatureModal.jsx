import React, { useRef, useState } from 'react';

/**
 * Generic e-signature capture modal supporting typed and drawn signatures.
 *
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - onSubmit: ({ signature_type, typed_name, signature_image_data }) => Promise<void> | void
 * - resolutionText: string (read-only agreement text preview)
 */
const ESignatureModal = ({ isOpen, onClose, onSubmit, resolutionText }) => {
    const [mode, setMode] = useState('typed');
    const [typedName, setTypedName] = useState('');
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
    };

    const endDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);
        try {
            if (mode === 'typed') {
                if (!typedName.trim()) {
                    alert('Please enter your full name to sign.');
                    return;
                }
                await onSubmit({
                    signature_type: 'TYPED',
                    typed_name: typedName.trim(),
                    signature_image_data: null,
                });
            } else {
                const canvas = canvasRef.current;
                if (!canvas) {
                    alert('Signature area not available.');
                    return;
                }
                const dataUrl = canvas.toDataURL('image/png');
                await onSubmit({
                    signature_type: 'DRAWN',
                    typed_name: null,
                    signature_image_data: dataUrl,
                });
            }
            onClose();
        } catch (err) {
            console.error('Signature submit error', err);
            alert('Failed to record your signature. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    background: 'white',
                    maxWidth: '700px',
                    width: '90%',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    padding: '1.5rem 2rem',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Review & Sign Agreement</h2>
                    <button onClick={onClose} className="btn-secondary">Close</button>
                </div>

                {resolutionText && (
                    <div
                        style={{
                            marginBottom: '1.25rem',
                            padding: '0.75rem 1rem',
                            background: '#f9fafb',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            fontSize: '0.9rem',
                            maxHeight: '150px',
                            overflowY: 'auto',
                        }}
                    >
                        <strong>Resolution Terms:</strong>
                        <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{resolutionText}</p>
                    </div>
                )}

                <div style={{ marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.9rem', color: '#4b5563' }}>
                        By providing your electronic signature below, you confirm that you have read and agree to the
                        terms of this resolution. This e-signature has the same legal effect as a handwritten signature.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <button
                        type="button"
                        className={mode === 'typed' ? 'btn-primary' : 'btn-secondary'}
                        onClick={() => setMode('typed')}
                    >
                        Type Signature
                    </button>
                    <button
                        type="button"
                        className={mode === 'drawn' ? 'btn-primary' : 'btn-secondary'}
                        onClick={() => setMode('drawn')}
                    >
                        Draw Signature
                    </button>
                </div>

                {mode === 'typed' ? (
                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                            Full Legal Name
                        </label>
                        <input
                            type="text"
                            value={typedName}
                            onChange={(e) => setTypedName(e.target.value)}
                            placeholder="Enter your full name"
                            style={{
                                width: '100%',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '6px',
                                border: '1px solid #d1d5db',
                                marginBottom: '0.75rem',
                            }}
                        />
                        <div
                            style={{
                                border: '1px solid #9ca3af',
                                borderRadius: '6px',
                                padding: '0.75rem 1rem',
                                fontFamily: 'Dancing Script, cursive',
                                fontSize: '1.5rem',
                                minHeight: '60px',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            {typedName || 'Your signature preview'}
                        </div>
                    </div>
                ) : (
                    <div>
                        <div
                            style={{
                                border: '1px solid #9ca3af',
                                borderRadius: '6px',
                                padding: '0.5rem',
                                marginBottom: '0.5rem',
                            }}
                        >
                            <canvas
                                ref={canvasRef}
                                width={600}
                                height={200}
                                style={{ width: '100%', height: '200px', cursor: 'crosshair' }}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={endDrawing}
                                onMouseLeave={endDrawing}
                            />
                        </div>
                        <button type="button" className="btn-secondary" onClick={clearCanvas}>
                            Clear Signature
                        </button>
                    </div>
                )}

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
                        Cancel
                    </button>
                    <button type="button" className="btn-primary" onClick={handleSubmit} disabled={submitting}>
                        {submitting ? 'Saving Signature...' : 'Sign & Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ESignatureModal;
