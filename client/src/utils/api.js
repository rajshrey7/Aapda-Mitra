import axios from 'axios';
import toast from 'react-hot-toast';

// ✅ Use import.meta.env for Vite
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action');
    } else if (error.response?.status === 404) {
      toast.error('Resource not found');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

// --- Auth endpoints ---
export const auth = {
  login: (data) => api.post('/users/login', data),
  register: (data) => api.post('/users/register', data),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  }
};

// --- Quiz endpoints ---
export const quiz = {
  getAll: (params) => api.get('/quiz', { params }),
  getById: (id) => api.get(`/quiz/${id}`),
  submit: (id, answers) => api.post(`/quiz/${id}/submit`, answers),
  generate: (data) => api.post('/quiz/generate', data),
};

// --- User endpoints ---
export const user = {
  getLeaderboard: (params) => api.get('/users/leaderboard', { params }),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
};

// --- Admin endpoints ---
export const admin = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
  createQuiz: (data) => api.post('/admin/quiz', data),
  updateQuiz: (id, data) => api.put(`/admin/quiz/${id}`, data),
  deleteQuiz: (id) => api.delete(`/admin/quiz/${id}`),
  getReports: (params) => api.get('/admin/reports', { params }),
  sendAnnouncement: (data) => api.post('/admin/announcement', data),
};

// --- Chatbot endpoints ---
export const chatbot = {
  chat: (message, context) => api.post('/chatbot/chat', { message, context }),
  getTips: (params) => api.get('/chatbot/tips', { params }),
  getEmergencyContacts: () => api.get('/chatbot/emergency-contacts'),
};

export default api;
