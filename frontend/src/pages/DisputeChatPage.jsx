import React from 'react';
import Chat from '../components/Chat';

const DisputeChatPage = ({ disputeId }) => {
    return (
        <div className="tab-content fade-in">
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary-800)' }}>Live Resolution Chat</h2>
            <Chat disputeId={disputeId} />
        </div>
    );
};

export default DisputeChatPage;
