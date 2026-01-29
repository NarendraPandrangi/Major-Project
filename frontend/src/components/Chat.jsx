import React, { useState, useEffect, useRef } from 'react';
import { Send, User as UserIcon } from 'lucide-react';
import { disputeAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './Chat.css'; // We'll create this next

const Chat = ({ disputeId }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        try {
            const response = await disputeAPI.getMessages(disputeId);
            setMessages(response.data);
        } catch (error) {
            console.error("Failed to load messages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        // Poll every 5 seconds
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [disputeId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await disputeAPI.sendMessage(disputeId, newMessage);
            setNewMessage('');
            fetchMessages(); // refresh immediately
        } catch (error) {
            alert(error.response?.data?.detail || "Failed to send message");
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h3>Live Dispute Resolution Chat</h3>
                <span className="message-count">{messages.length} / 20 messages</span>
            </div>

            <div className="messages-list">
                {messages.length === 0 ? (
                    <div className="empty-chat">
                        <p>No messages yet. Start the conversation to resolve the dispute.</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.user_id === user.id;
                        return (
                            <div key={msg.id || Math.random()} className={`message-bubble ${isMe ? 'sent' : 'received'}`}>
                                <div className="message-info">
                                    <span className="sender-name">{isMe ? 'You' : msg.sender_name}</span>
                                    <span className="message-time">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className="message-content">{msg.content}</div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="chat-input-area">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    disabled={messages.length >= 20}
                    className="chat-input"
                />
                <button type="submit" disabled={!newMessage.trim() || messages.length >= 20} className="send-btn">
                    <Send size={20} />
                </button>
            </form>
            {messages.length >= 20 && (
                <div className="chat-limit-warning">
                    Trial chat limit reached. Please finalize the resolution.
                </div>
            )}
        </div>
    );
};

export default Chat;
