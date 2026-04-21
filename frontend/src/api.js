import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to append the JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => api.post('/auth/signin', { email, password }),
  register: (userData) => api.post('/auth/signup', userData),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  }
};

export const bookingService = {
  requestBooking: (data) => api.post('/bookings/request', data),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  updateStatus: (id, status) => api.put(`/bookings/${id}/status?status=${status}`)
};

export const providerService = {
  getProfile: (id) => api.get(`/provider/profile/${id}`),
  addAvailability: (data) => api.post('/provider/availability', data),
  getMyAvailability: () => api.get('/provider/availability')
};

export const platformService = {
  getCategories: () => api.get('/services/categories'),
  getServices: () => api.get('/services'),
  getServicesByCategory: (id) => api.get(`/services/category/${id}`),
  createService: (data) => api.post('/services', data),
  offerService: (serviceId) => api.post(`/services/${serviceId}/offer`),
  myOfferings: () => api.get('/services/my-offerings'),
  getProvidersForService: (serviceId) => api.get(`/services/${serviceId}/providers`),
};

export default api;

export const notificationService = {
  list: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
};

export const reviewService = {
  create: (data) => api.post('/reviews', data),
  myProviderReviews: () => api.get('/reviews/me'),
};

export const adminService = {
  providers: () => api.get('/admin/providers'),
  verifyProvider: (userId, verified) => api.put(`/admin/providers/${userId}/verify?verified=${verified}`),
  createCategory: (data) => api.post('/admin/categories', data),
  createService: (data) => api.post('/services', data), // admin-only endpoint
};
