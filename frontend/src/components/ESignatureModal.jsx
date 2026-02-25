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
            const canvas = canvasRef.current;
            if (!canvas) {
                alert('Signature area not available.');
                return;
            }

            // Basic validation to check if canvas is empty
            const ctx = canvas.getContext('2d');
            const pixelBuffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
            // In a blank canvas, all pixels are 0 (transparent)
            if (!pixelBuffer.some(color => color !== 0)) {
                alert('Please draw your signature before submitting.');
                setSubmitting(false);
                return;
            }

            const dataUrl = canvas.toDataURL('image/png');
            await onSubmit({
                signature_type: 'DRAWN',
                typed_name: null,
                signature_image_data: dataUrl,
            });
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
                        By drawing your electronic signature below, you confirm that you have read and agree to the
                        terms of this resolution. This e-signature has the same legal effect as a handwritten signature.
                    </p>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                        Draw your signature below:
                    </label>
                    <div
                        style={{
                            border: '1px solid #9ca3af',
                            borderRadius: '6px',
                            padding: '0.5rem',
                            marginBottom: '0.5rem',
                            background: '#f9fafb',
                        }}
                    >
                        <canvas
                            ref={canvasRef}
                            width={600}
                            height={200}
                            style={{
                                width: '100%',
                                height: '200px',
                                cursor: 'crosshair',
                                touchAction: 'none' // Prevents scrolling while signing on mobile
                            }}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={endDrawing}
                            onMouseLeave={endDrawing}

                            // Touch support
                            onTouchStart={(e) => {
                                e.preventDefault();
                                const touch = e.touches[0];
                                const mouseEvent = new MouseEvent("mousedown", {
                                    clientX: touch.clientX,
                                    clientY: touch.clientY
                                });
                                canvasRef.current.dispatchEvent(mouseEvent);
                            }}
                            onTouchMove={(e) => {
                                e.preventDefault();
                                const touch = e.touches[0];
                                const mouseEvent = new MouseEvent("mousemove", {
                                    clientX: touch.clientX,
                                    clientY: touch.clientY
                                });
                                canvasRef.current.dispatchEvent(mouseEvent);
                            }}
                            onTouchEnd={(e) => {
                                e.preventDefault();
                                const mouseEvent = new MouseEvent("mouseup");
                                canvasRef.current.dispatchEvent(mouseEvent);
                            }}
                        />
                    </div>
                    <button type="button" className="btn-secondary" onClick={clearCanvas} style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}>
                        Clear Signature
                    </button>
                </div>

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
