import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token') || localStorage.getItem('auth_token');
    console.log('🔑 Token from storage:', token ? '✓ Found' : '✗ Not found');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('📤 Sending request with Authorization header:', config.url);
    } else {
      console.warn('⚠️ No token found in cookies or localStorage for request to:', config.url);
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
      Cookies.remove('auth_token');
      localStorage.removeItem('auth_token');

      // Redirect to login if not already there
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const memberApi = {
  getMembers: (params) => api.get('/members', { params }),
  getMember: (id) => api.get(`/members/${id}`),
  createMember: (data) => api.post('/members', data),
  updateMember: (id, data) => api.put(`/members/${id}`, data),
  deleteMember: (id) => api.delete(`/members/${id}`),
};

export const attendanceApi = {
  getRecords: (params) => api.get('/attendance/records', { params }),
  getRecord: (id) => api.get(`/attendance/records/${id}`),
  recordAttendance: (data) => api.post('/attendance/records', data),
  updateRecord: (id, data) => api.put(`/attendance/records/${id}`, data),
  deleteRecord: (id) => api.delete(`/attendance/records/${id}`),
  getServiceReport: (serviceId) => api.get(`/attendance/services/${serviceId}/report`),
};

export const financialApi = {
  getTransactions: (params) => api.get('/financial/transactions', { params }),
  getTransaction: (id) => api.get(`/financial/transactions/${id}`),
  createTransaction: (data) => api.post('/financial/transactions', data),
  updateTransaction: (id, data) => api.put(`/financial/transactions/${id}`, data),
  deleteTransaction: (id) => api.delete(`/financial/transactions/${id}`),
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
  getMessage: (id) => api.get(`/communication/messages/${id}`),
  updateMessage: (id, data) => api.put(`/communication/messages/${id}`, data),
  deleteMessage: (id) => api.delete(`/communication/messages/${id}`),
  getMessages: (params) => api.get('/communication/messages', { params }),
  sendBulkNotification: (data) => api.post('/communication/notifications/bulk', data),
  markAsRead: (id) => api.put(`/communication/messages/${id}/read`),
};

export const logsApi = {
  getLogs: (params) => api.get('/logs/all', { params }),
  getLog: (id) => api.get(`/logs/${id}`),
  updateLog: (id, data) => api.put(`/logs/${id}`, data),
  deleteLog: (id) => api.delete(`/logs/${id}`),
  logAction: (data) => api.post('/logs/action', data),
  getLogsByUser: (user, params) => api.get(`/logs/user/${user}`, { params }),
  clearOldLogs: (days) => api.delete(`/logs/clear-old`, { params: { days } }),
};

export const reportingApi = {
  generateReport: (data) => api.post('/reporting/reports/generate', data),
  getReports: (params) => api.get('/reporting/reports', { params }),
  getReport: (id) => api.get(`/reporting/reports/${id}`),
  exportReport: (id, format = 'json') => api.post(`/reporting/reports/${id}/export`, null, {
    params: { format },
  }),
  deleteReport: (id) => api.post(`/reporting/reports/${id}/delete`),
};

export const userApi = {
  getUsers: (params) => api.get('/users', { params }),
  getStatistics: () => api.get('/users/stats'),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  toggleUserStatus: (id, status) => api.patch(`/users/${id}/status`, { status }),
  changePassword: (id, data) => api.post(`/users/${id}/change-password`, data),
};

export default api;

