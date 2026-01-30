import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { disputeAPI } from '../api/client';
import { FileText, User, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { sendDisputeFiledEmail, sendDisputeConfirmationEmail } from '../services/emailService';
import './DisputeForm.css';

const DisputeForm = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        defendant_email: '',
        evidence_file: null // Base64 string
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const categories = [
        'Contract Dispute',
        'Property Dispute',
        'Employment Dispute',
        'Consumer Dispute',
        'Business Dispute',
        'Family Dispute',
        'Debt Collection',
        'Service Dispute',
        'Other'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                setError('File size too large (max 10MB)');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    evidence_file: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate form
            if (!formData.title || !formData.category || !formData.description || !formData.defendant_email) {
                throw new Error('Please fill in all required fields');
            }

            if (formData.defendant_email.toLowerCase() === user.email.toLowerCase()) {
                throw new Error('You cannot file a dispute against yourself');
            }

            // Submit dispute
            const response = await disputeAPI.create(formData);
            const disputeId = response.id;

            // Send email notifications via EmailJS (using separate dispute service)
            const emailParams = {
                to_email: formData.defendant_email,
                to_name: formData.defendant_email.split('@')[0],
                dispute_id: disputeId,
                dispute_title: formData.title,
                category: formData.category
            };

            // Send notification to defendant
            sendDisputeFiledEmail(emailParams)
                .then(result => {
                    if (result.success) {
                        console.log('Defendant notification email sent successfully');
                    }
                })
                .catch(err => console.error('Failed to send defendant email:', err));

            // Send confirmation to plaintiff
            const confirmationParams = {
                to_email: user.email,
                to_name: user.full_name || user.email.split('@')[0],
                dispute_id: disputeId,
                dispute_title: formData.title,
                category: formData.category
            };

            sendDisputeConfirmationEmail(confirmationParams)
                .then(result => {
                    if (result.success) {
                        console.log('Plaintiff confirmation email sent successfully');
                    }
                })
                .catch(err => console.error('Failed to send confirmation email:', err));

            setSuccess(true);

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.detail || err.message || 'Failed to file dispute');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="dispute-form-container">
                <div className="success-card">
                    <div className="success-icon">
                        <CheckCircle size={64} />
                    </div>
                    <h2>Dispute Filed Successfully!</h2>
                    <p>Your dispute has been submitted and is being processed.</p>
                    <p className="redirect-text">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dispute-form-container">
            <div className="dispute-form-card">
                <div className="form-header">
                    <FileText size={40} className="header-icon" />
                    <h1>File a New Dispute</h1>
                    <p>Provide details about your dispute for AI-powered resolution suggestions</p>
                </div>

                {error && (
                    <div className="error-banner">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="dispute-form">
                    {/* Title */}
                    <div className="form-group">
                        <label htmlFor="title" className="form-label">
                            <FileText size={18} />
                            Dispute Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Brief summary of your dispute"
                            className="form-input"
                            required
                        />
                    </div>

                    {/* Category */}
                    <div className="form-group">
                        <label htmlFor="category" className="form-label">
                            <FileText size={18} />
                            Category *
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="form-select"
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Defendant Email */}
                    <div className="form-group">
                        <label htmlFor="defendant_email" className="form-label">
                            <User size={18} />
                            Defendant Email *
                        </label>
                        <input
                            type="email"
                            id="defendant_email"
                            name="defendant_email"
                            value={formData.defendant_email}
                            onChange={handleChange}
                            placeholder="Email of the other party"
                            className="form-input"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label htmlFor="description" className="form-label">
                            <FileText size={18} />
                            Detailed Description *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Provide a detailed description of your dispute, including relevant dates, agreements, and circumstances..."
                            className="form-textarea"
                            rows="6"
                            required
                        />
                        <div className="char-count">
                            {formData.description.length} characters
                        </div>
                    </div>

                    {/* Evidence File Upload */}
                    <div className="form-group">
                        <label htmlFor="evidence_file" className="form-label">
                            <FileText size={18} />
                            Proof Document (Optional)
                        </label>
                        <div className="file-upload-wrapper">
                            <input
                                type="file"
                                id="evidence_file"
                                name="evidence_file"
                                onChange={handleFileChange}
                                accept="image/*,.pdf,.doc,.docx"
                                className="file-input"
                            />
                            <div className="file-upload-display">
                                {formData.evidence_file ? (
                                    <div className="file-selected">
                                        <CheckCircle size={20} color="var(--success)" />
                                        <span>File attached</span>
                                        <button
                                            type="button"
                                            className="remove-file-btn"
                                            onClick={() => setFormData(prev => ({ ...prev, evidence_file: null }))}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <div className="file-placeholder">
                                        <span>Click to upload evidence (Max 10MB)</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="btn-secondary"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader className="spinner" size={20} />
                                    Filing Dispute...
                                </>
                            ) : (
                                <>
                                    <FileText size={20} />
                                    File Dispute
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="form-footer">
                    <p>
                        <strong>Note:</strong> All disputes are reviewed by our AI system to provide fair and unbiased resolution suggestions.
                        Both parties will be notified and can participate in the resolution process.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DisputeForm;
