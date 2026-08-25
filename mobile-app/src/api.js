/**
 * Centralized API client — wraps Axios with JWT auth, base URL,
 * and automatic 401 handling.
 */

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './config';

const TOKEN_KEY = '@lsm_jwt';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — global 401 handling
let onUnauthorized = null;

export function setOnUnauthorized(callback) {
  onUnauthorized = callback;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem(TOKEN_KEY);
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

// Token helpers
export async function storeToken(token) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

// Error Formatter Helper
export function getErrorMessage(err, defaultMsg = 'An error occurred') {
  if (!err) return defaultMsg;
  const detail = err.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || JSON.stringify(d)).join('\n');
  }
  if (typeof detail === 'object' && detail !== null) {
    return detail.msg || JSON.stringify(detail);
  }
  return err.message || defaultMsg;
}

// Auth
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateMe: (data) => api.put('/auth/me', data),
};

// Categories
export const categoriesApi = {
  list: () => api.get('/categories'),
};

// Service Requests
export const requestsApi = {
  create: (data) => api.post('/requests/', data),
  get: (id) => api.get(`/requests/${id}`),
  listMine: (customerId) => api.get('/requests/', { params: customerId ? { customer_id: customerId } : {} }),
  updateStatus: (id, status) => api.patch(`/requests/${id}/status`, { status }),
  sendQuote: (id, quoteAmount, quoteMessage) => api.post(`/requests/${id}/quote`, { quote_amount: quoteAmount, quote_message: quoteMessage }),
};

// Messages (Chat)
export const messagesApi = {
  list: (requestId) => api.get(`/requests/${requestId}/messages`),
  send: (requestId, content) => api.post(`/requests/${requestId}/messages`, { content }),
};

// Reviews
export const reviewsApi = {
  create: (data) => api.post('/reviews/', data),
};

// Support Chatbot
export const supportApi = {
  chat: (message, sessionId) => api.post('/support/chat', { message, session_id: sessionId }),
};

export default api;
