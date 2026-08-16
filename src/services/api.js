import axios from 'axios';

const API_BASE_URL = 'https://roamigo-backend.in/api/v1';
// const API_BASE_URL = 'http://localhost:5000/api/v1';
// const API_BASE_URL = 'https://test.roamigo-backend.in/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});


apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {

    const message = error.response?.data?.message || 'Something went wrong';
    const code = error.response?.data?.errorCode || 'API_ERROR';
    const status = error.response?.status || 500;

    return Promise.reject({ message, code, status, originalError: error });
  }
);

export const authAPI = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
};

export const adminAPI = {
  // Users
  getUsers: () => apiClient.get('/admin/users'),
  getUserById: (id) => apiClient.get(`/admin/users/${id}`),
  updateUserStatus: (id, status) => apiClient.patch(`/admin/users/${id}/status`, { status }),

  // Providers
  getProviders: () => apiClient.get('/admin/providers'),
  getProviderById: (id) => apiClient.get(`/admin/providers/${id}`),
  approveProvider: (id) => apiClient.patch(`/admin/providers/${id}/approve`),
  rejectProvider: (id) => apiClient.patch(`/admin/providers/${id}/reject`),
  suspendProvider: (id) => apiClient.patch(`/admin/providers/${id}/suspend`),

  // Properties
  getProperties: () => apiClient.get('/admin/properties'),
  getPropertyById: (id) => apiClient.get(`/admin/properties/${id}`),
  createProperty: (propertyData) => apiClient.post('/admin/properties', propertyData),
  updateProperty: (id, propertyData) => apiClient.patch(`/admin/properties/${id}`, propertyData),
  updatePropertyStatus: (id, status) => apiClient.patch(`/admin/properties/${id}/status`, { status }),
  approveProperty: (id) => apiClient.patch(`/admin/properties/${id}/approve`),
  rejectProperty: (id) => apiClient.patch(`/admin/properties/${id}/reject`),
  suspendProperty: (id) => apiClient.patch(`/admin/properties/${id}/suspend`),

  // Bookings
  getBookings: () => apiClient.get('/admin/bookings'),
  getBookingById: (id) => apiClient.get(`/admin/bookings/${id}`),

  // Payments, Refunds & Payouts
  getPayments: () => apiClient.get('/admin/payments'),
  getRefunds: () => apiClient.get('/admin/refunds'),
  getPayouts: () => apiClient.get('/admin/payouts'),
  processPayout: (id) => apiClient.patch(`/admin/payouts/${id}/process`),

  // Cities (Destinations) CRUD
  getCities: () => apiClient.get('/admin/cities'),
  createCity: (cityData) => apiClient.post('/admin/cities', cityData),
  updateCity: (id, cityData) => apiClient.patch(`/admin/cities/${id}`, cityData),
  deleteCity: (id) => apiClient.delete(`/admin/cities/${id}`),

  // Collections CRUD
  getCollections: () => apiClient.get('/admin/collections'),
  createCollection: (colData) => apiClient.post('/admin/collections', colData),
  updateCollection: (id, colData) => apiClient.patch(`/admin/collections/${id}`, colData),
  deleteCollection: (id) => apiClient.delete(`/admin/collections/${id}`),
};

export const getFullUploadUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const host = API_BASE_URL.replace('/api/v1', '');
  return `${host}${path.startsWith('/') ? '' : '/'}${path}`;
};

export const uploadAPI = {
  uploadPropertyImages: (files, propertyId) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }
    const url = propertyId ? `/upload/property-images?propertyId=${propertyId}` : '/upload/property-images';
    return apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadMealPdf: (file, propertyId) => {
    const formData = new FormData();
    formData.append('mealPdf', file);
    const url = propertyId ? `/upload/meal-pdf?propertyId=${propertyId}` : '/upload/meal-pdf';
    return apiClient.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default apiClient;

