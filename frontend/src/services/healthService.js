import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const dashboardService = {
  getDashboard: () => api.get('/dashboard'),
};

export const vitalsService = {
  getAll: (params) => api.get('/vitals', { params }),
  getLatest: () => api.get('/vitals/latest'),
  create: (data) => api.post('/vitals', data),
  update: (id, data) => api.put(`/vitals/${id}`, data),
  delete: (id) => api.delete(`/vitals/${id}`),
};

export const medicinesService = {
  getAll: () => api.get('/medicines'),
  getToday: () => api.get('/medicines/today'),
  create: (data) => api.post('/medicines', data),
  update: (id, data) => api.put(`/medicines/${id}`, data),
  delete: (id) => api.delete(`/medicines/${id}`),
};

export const symptomsService = {
  getAll: (params) => api.get('/symptoms', { params }),
  create: (data) => api.post('/symptoms', data),
  update: (id, data) => api.put(`/symptoms/${id}`, data),
  delete: (id) => api.delete(`/symptoms/${id}`),
};

export const doctorVisitsService = {
  getAll: (params) => api.get('/doctor-visits', { params }),
  create: (data) => api.post('/doctor-visits', data),
  update: (id, data) => api.put(`/doctor-visits/${id}`, data),
  delete: (id) => api.delete(`/doctor-visits/${id}`),
};

export const prescriptionsService = {
  getAll: () => api.get('/prescriptions'),
  upload: (formData) =>
    api.post('/prescriptions/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/prescriptions/${id}`),
};

export const reportsService = {
  downloadPDF: () =>
    api.get('/reports/pdf', { responseType: 'blob' }),
  exportCSV: () =>
    api.get('/reports/csv', { responseType: 'blob' }),
};

export const emergencyService = {
  getAll: () => api.get('/emergency'),
  getSummary: () => api.get('/emergency/summary'),
  create: (data) => api.post('/emergency', data),
  update: (id, data) => api.put(`/emergency/${id}`, data),
  delete: (id) => api.delete(`/emergency/${id}`),
};
