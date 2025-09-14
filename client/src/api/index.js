import axios from 'axios';

// Create axios instance with base URL
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 30000, // Increased to 30 seconds to handle DB connection delays
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include Firebase auth token
API.interceptors.request.use(
  async (config) => {
    try {
      // Get Firebase Auth token if user is authenticated
      const auth = await import('firebase/auth');
      const { getAuth } = auth;
      const firebaseAuth = getAuth();
      
      if (firebaseAuth.currentUser) {
        const token = await firebaseAuth.currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Could not get Firebase auth token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Event API endpoints
export const eventAPI = {
  // Get all approved events
  getEvents: (params = {}) => API.get('/events', { params }),
  
  // Get single event by ID
  getEvent: (id) => API.get(`/events/${id}`),
  
  // Create new event (requires authentication)
  createEvent: (eventData) => API.post('/events', eventData),
  
  // Update event (requires authentication)
  updateEvent: (id, eventData) => API.patch(`/events/${id}`, eventData),
  
  // Delete event (requires authentication)
  deleteEvent: (id) => API.delete(`/events/${id}`),
  
  // Get user's events (requires authentication)
  getUserEvents: () => API.get('/events/my-events'),
};

// Admin API endpoints
export const adminAPI = {
  // Get pending events (requires admin)
  getPendingEvents: () => API.get('/admin/events/pending'),
  
  // Approve event (requires admin)
  approveEvent: (id) => API.patch(`/admin/events/${id}/approve`),
  
  // Reject event (requires admin)
  rejectEvent: (id) => API.patch(`/admin/events/${id}/reject`),
  
  // Get all users (requires admin)
  getUsers: () => API.get('/users'),
  
  // Update user role (requires admin)
  updateUserRole: (id, role) => API.patch(`/users/${id}/role`, { role }),
};

// Utility function to handle API errors
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error status
    return error.response.data.message || 'Server error occurred';
  } else if (error.request) {
    // Request was made but no response received
    return 'Unable to connect to server. Please check your internet connection.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
};

export default API;
