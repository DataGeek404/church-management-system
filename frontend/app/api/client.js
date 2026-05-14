import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 - token expired or invalid
    if (error.response?.status === 401) {
      // Clear auth tokens
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
      // Redirect to login if not already there
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const userApi = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  toggleUserStatus: (id, status) => api.patch(`/users/${id}/status`, { status }),
  getStatistics: () => api.get('/users/stats'),
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  changePassword: (data) => api.post('/profile/change-password', data),
};

export const memberApi = {
  getMembers: (params) => api.get('/members', { params }),
  getMember: (id) => api.get(`/members/${id}`),
  createMember: (data) => api.post('/members', data),
  updateMember: (id, data) => api.put(`/members/${id}`, data),
  deleteMember: (id) => api.delete(`/members/${id}`),
};

export const attendanceApi = {
  getRecords: (params) => api.get('/attendance/records', { params }),
  recordAttendance: (data) => api.post('/attendance/records', data),
  getServiceReport: (serviceId) => api.get(`/attendance/services/${serviceId}/report`),
};

export const financialApi = {
  getTransactions: (params) => api.get('/financial/transactions', { params }),
  createTransaction: (data) => api.post('/financial/transactions', data),
  getBalance: (accountId) => api.get(`/financial/accounts/${accountId}/balance`),
  getReport: (accountId) => api.get(`/financial/accounts/${accountId}/report`),
};

export const eventApi = {
  getEvents: (params) => api.get('/events', { params }),
  getEvent: (id) => api.get(`/events/${id}`),
  createEvent: (data) => api.post('/events', data),
  updateEvent: (id, data) => api.put(`/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  addAttendee: (id, data) => api.post(`/events/${id}/attendees`, data),
};

export const communicationApi = {
  sendMessages: (data) => api.post('/communication/messages', data),
  sendBulkNotification: (data) => api.post('/communication/notifications/bulk', data),
  getMessages: (params) => api.get('/communication/messages', { params }),
  markAsRead: (id) => api.put(`/communication/messages/${id}/read`),
};

export const reportingApi = {
  generateReport: (data) => api.post('/reporting/reports/generate', data),
  getReports: (params) => api.get('/reporting/reports', { params }),
  getReport: (id) => api.get(`/reporting/reports/${id}`),
  exportReport: (id) => api.post(`/reporting/reports/${id}/export`),
};


export default api;

