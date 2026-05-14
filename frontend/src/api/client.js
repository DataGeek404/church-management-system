import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
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

