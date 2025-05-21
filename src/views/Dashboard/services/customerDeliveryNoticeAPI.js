// services/customerDeliveryNoticeAPI.js
import axios from 'axios';

// Create axios instance with base URL
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token in all requests
API.interceptors.request.use((config) => {
  // Get user data from localStorage or sessionStorage
  const userDataStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  if (userDataStr) {
    const userData = JSON.parse(userDataStr);
    if (userData.token) {
      config.headers.Authorization = `Bearer ${userData.token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const customerDeliveryNoticeApi = {
  // Get all delivery notices with filtering by user
  getAll: async (params = {}) => {
    try {
      const response = await API.get('/delivery-notices', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch delivery notices');
    }
  },

  // Search delivery notices
  search: async (searchParams) => {
    try {
      const response = await API.get('/delivery-notices/search', { params: searchParams });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to search delivery notices');
    }
  },

  // Create a new delivery notice
  create: async (data) => {
    try {
      const response = await API.post('/delivery-notices', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create delivery notice');
    }
  },

  // Update an existing delivery notice
  update: async (id, data) => {
    try {
      const response = await API.put(`/delivery-notices/${id}`, data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update delivery notice');
    }
  },

  // Delete a delivery notice
  delete: async (id) => {
    try {
      const response = await API.delete(`/delivery-notices/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete delivery notice');
    }
  }
};