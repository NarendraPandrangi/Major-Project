import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { disputeAPI } from '../api/client';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import './Dashboard.css'; // Reusing dashboard styles for consistency throughout the app

const DisputeList = ({ type = 'all' }) => {
    const navigate = useNavigate();
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchDisputes();
    }, [type]);

    const fetchDisputes = async () => {
        setLoading(true);
        try {
            let response;
            switch (type) {
                case 'filed':
                    response = await disputeAPI.getFiled();
                    break;
                case 'against':
                    response = await disputeAPI.getAgainst();
                    break;
                default:
                    response = await disputeAPI.getAll(); // Or a specific getAll if available for users
                    break;
            }
            setDisputes(response.data);
            setError('');
        } catch (err) {
            console.error('Failed to fetch disputes:', err);
            setError('Failed to load disputes. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const getTitle = () => {
        switch (type) {
            case 'filed': return 'My Filed Disputes';
            case 'against': return 'Disputes Against Me';
            default: return 'All Disputes';
        }
    };

    const filteredDisputes = disputes.filter(dispute => {
        const matchesSearch = dispute.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dispute.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || dispute.status.toLowerCase() === filterStatus.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <div className="container">
                    <div className="header-content">
                        <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <button onClick={() => navigate('/dashboard')} className="icon-btn" style={{ border: 'none', background: 'transparent', width: 'auto' }}>
                                <ArrowLeft size={24} />
                            </button>
                            <h1>{getTitle()}</h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="dashboard-main">
                <div className="container">
                    {/* Filters and Search */}
                    <div className="actions-grid" style={{ marginBottom: '2rem', gridTemplateColumns: '1fr auto' }}>
                        <div className="search-box" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Search size={20} style={{ position: 'absolute', left: '1rem', color: 'var(--text-tertiary)' }} />
                            <input
                                type="text"
                                placeholder="Search disputes by title or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem 0.75rem 3rem',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--border)',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                        <div className="filter-box" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Filter size={20} color="var(--text-secondary)" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--border)',
                                    background: 'var(--surface)',
                                    minWidth: '150px'
                                }}
                            >
                                <option value="all">All Statuses</option>
                                <option value="open">Open</option>
                                <option value="inprogress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="rejected">Rejected</option>
                                <option value="escalated">Escalated</option>
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="details-error" style={{ marginBottom: '2rem' }}>
                            <p>{error}</p>
                        </div>
                    )}

                    {filteredDisputes.length === 0 ? (
                        <div className="empty-state" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                            <h3>No disputes found</h3>
                            <p>Try adjusting your search or filters.</p>
                        </div>
                    ) : (
                        <div className="disputes-list">
                            {filteredDisputes.map((dispute) => (
                                <div
                                    key={dispute.id}
                                    className="dispute-item"
                                    onClick={() => navigate(`/dispute/${dispute.id}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div className="dispute-header">
                                        <h4>{dispute.title}</h4>
                                        <span className={`status-badge status-${dispute.status}`}>
                                            {dispute.status}
                                        </span>
                                    </div>
                                    <p className="dispute-category">{dispute.category}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                                        <p className="dispute-date">
                                            Filed on {new Date(dispute.created_at).toLocaleDateString()}
                                        </p>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>ID: {dispute.id}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DisputeList;
