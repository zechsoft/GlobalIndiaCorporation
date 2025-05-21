import axios from 'axios';

// Configure axios defaults for the entire application
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000', // Use environment variable if available
  withCredentials: true, // For cookie/session support
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Request interceptor for API calls
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method.toUpperCase()} request to: ${config.url}`);
    
    // Get token from localStorage if available
    const token = localStorage.getItem('authToken');
    
    // Add Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error("Request error:", error.message);
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`Received ${response.status} response from: ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log error details for debugging
    console.error(`API error: ${error.message}`, {
      status: error.response?.status,
      url: originalRequest?.url,
      method: originalRequest?.method
    });
    
    // Handle 401 errors (unauthorized) - could be used for token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("Attempting to refresh authentication...");
      
      originalRequest._retry = true;
      
      // Try to refresh the token if you have a refresh endpoint
      try {
        // Implement your token refresh logic here
        // Example:
        // const refreshToken = localStorage.getItem('refreshToken');
        // const response = await axios.post('http://localhost:8000/api/refresh-token', { refreshToken });
        // const newToken = response.data.token;
        // localStorage.setItem('authToken', newToken);
        // originalRequest.headers.Authorization = `Bearer ${newToken}`;
        // return axiosInstance(originalRequest);
        
        // For now, we'll just redirect to login
        window.location = '/login';
        return Promise.reject(error);
      } catch (refreshError) {
        console.error("Token refresh failed", refreshError);
        
        // Clear authentication data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
        // Redirect to login
        window.location = '/login';
        return Promise.reject(error);
      }
    }
    
    // Handle connection errors
    if (!error.response) {
      console.error("Network error - Check if the server is running");
    }
    
    return Promise.reject(error);
  }
);

// Add a method to handle common api calls
axiosInstance.apiCall = async (method, url, data = null, options = {}) => {
  try {
    const config = {
      method,
      url,
      ...options
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axiosInstance(config);
    return response.data;
  } catch (error) {
    console.error(`API call failed: ${method} ${url}`, error);
    throw error;
  }
};

export default axiosInstance;