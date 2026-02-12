import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear token and redirect to login
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => api.post('/api/auth/register', data),
    login: (data) => {
        const formData = new FormData();
        formData.append('username', data.email);
        formData.append('password', data.password);
        return api.post('/api/auth/login', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    loginWithEmail: (data) => api.post('/api/auth/login/email', data),
    googleAuth: (token) => api.post('/api/auth/google', { token }),
    getCurrentUser: () => api.get('/api/auth/me'),
    updateProfile: (data) => api.put('/api/auth/me', data),
};

// Disputes API
export const disputesAPI = {
    create: (data) => api.post('/api/disputes/', data),
    getAll: () => api.get('/api/disputes/'),
    getFiled: () => api.get('/api/disputes/filed'),
    getAgainst: () => api.get('/api/disputes/against'),
    getById: (id) => api.get(`/api/disputes/${id}`),
    updateStatus: (id, status) => api.put(`/api/disputes/${id}/status`, { status }),
    delete: (id) => api.delete(`/api/disputes/${id}`),
    accept: (id) => api.post(`/api/disputes/${id}/accept`),
    reject: (id) => api.post(`/api/disputes/${id}/reject`),
    agree: (id, resolution_text) => api.post(`/api/disputes/${id}/agree`, { resolution_text }),
    escalate: (id, reason) => api.post(`/api/disputes/${id}/escalate`, { reason }),
    sendMessage: (id, content) => api.post(`/api/disputes/${id}/messages`, { content }),
    getMessages: (id) => api.get(`/api/disputes/${id}/messages`),
};

// Alias for consistency
export const disputeAPI = disputesAPI;

// Dashboard API
export const dashboardAPI = {
    getStats: () => api.get('/api/dashboard/stats'),
};

// Notifications API
export const notificationsAPI = {
    getAll: () => api.get('/api/notifications/'),
    getUnread: () => api.get('/api/notifications/unread'),
    markAsRead: (id) => api.put(`/api/notifications/${id}/read`),
    markAllAsRead: () => api.put('/api/notifications/read-all'),
};

export const aiAPI = {
    getSuggestions: (disputeId, force = false) => api.post('/api/ai/suggestions', { dispute_id: disputeId, force }),
};

// Admin API
export const adminAPI = {
    getPendingApprovals: () => api.get('/api/admin/pending-approvals'),
    approveResolution: (disputeId, adminNotes) => api.post(`/api/admin/${disputeId}/approve-resolution`, {
        decision: 'approve',
        admin_notes: adminNotes
    }),
    rejectResolution: (disputeId, adminNotes) => api.post(`/api/admin/${disputeId}/approve-resolution`, {
        decision: 'reject',
        admin_notes: adminNotes
    }),
    getStats: () => api.get('/api/admin/stats'),
    getAllDisputes: () => api.get('/api/admin/all-disputes'),
    getAllUsers: () => api.get('/api/admin/all-users'),
    getEscalatedDisputes: () => api.get('/api/admin/escalated-disputes'),
    resolveEscalation: (disputeId, resolutionText, adminNotes) => api.post(`/api/admin/${disputeId}/resolve-escalation`, {
        resolution_text: resolutionText,
        admin_notes: adminNotes
    }),
};

export default api;

