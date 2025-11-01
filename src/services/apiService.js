import axios from "axios";

const api = axios.create({
  baseURL: "https://seatify-backend.azurewebsites.net/api/v1",
  withCredentials: true,
});

// Attach bearer token from localStorage if present
api.interceptors.request.use(
  (config) => {
    // Try to get token from the 'auth' key (stored by Redux)
    const authData = localStorage.getItem("auth");
    let token = null;
    
    if (authData) {
      try {
        const parsedAuth = JSON.parse(authData);
        token = parsedAuth.token;
      } catch (error) {
        console.error('Error parsing auth data:', error);
        // Fallback to direct token key
        token = localStorage.getItem("token");
      }
    } else {
      // Fallback to direct token key for backward compatibility
      token = localStorage.getItem("token");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// If data is FormData, let browser set correct multipart header
api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
  return config;
});

// Response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401/403 errors globally
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear invalid auth data
      localStorage.removeItem('auth');
      localStorage.removeItem('token');
      
      // Only redirect if not already on auth pages
      const currentPath = window.location.pathname;
      const isAuthPage = ['/login', '/register', '/forgot-password'].includes(currentPath);
      
      if (!isAuthPage) {
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
