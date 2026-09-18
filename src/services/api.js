import axios from 'axios';

const getApiBaseUrl = () => {
  const hostname = window.location.hostname;

  if (hostname === 'roamigo.in' || hostname === 'admin.roamigo.in') {
    return 'https://roamigo-backend.in/api/v1';
  }

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000/api/v1';
  }

  return 'https://test.roamigo-backend.in/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});


apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('roamigo_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = !!localStorage.getItem('roamigo_admin_token');
      localStorage.removeItem('roamigo_admin_token');

      // Notify application of session/token expiration
      if (hadToken && typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('session_expired', {
            detail: { message: 'Your token has expired. Please log in again to continue.' }
          })
        );
      }
    }

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
  checkHealth: () => apiClient.get('/health'),
};

export const adminAPI = {
  // Users
  getUsers: () => apiClient.get('/admin/users'),
  getUserById: (id) => apiClient.get(`/admin/users/${id}`),
  updateUserStatus: (id, status) => apiClient.patch(`/admin/users/${id}/status`, { status }),

  // Providers
  getProviders: () => apiClient.get('/admin/providers'),
  getProviderById: (id) => apiClient.get(`/admin/providers/${id}`),
  getProviderProperties: (id) => apiClient.get(`/admin/providers/${id}/properties`),
  getProviderBookings: (id) => apiClient.get(`/admin/providers/${id}/bookings`),
  approveProvider: (id) => apiClient.patch(`/admin/providers/${id}/approve`),
  rejectProvider: (id) => apiClient.patch(`/admin/providers/${id}/reject`),
  suspendProvider: (id) => apiClient.patch(`/admin/providers/${id}/suspend`),

  // Properties
  getProperties: () => apiClient.get('/admin/properties'),
  getPropertyById: (id) => apiClient.get(`/admin/properties/${id}`),
  getPropertyAvailability: (propertyId) => apiClient.get(`/admin/properties/${propertyId}/availability`),
  releasePropertyDates: (propertyId, payload) => apiClient.post(`/admin/properties/${propertyId}/release-dates`, payload),
  blockPropertyDates: (propertyId, payload) => apiClient.post(`/admin/properties/${propertyId}/block-dates`, payload),
  updateCustomRates: (propertyId, payload) => apiClient.post(`/admin/properties/${propertyId}/custom-rates`, payload),
  addICalFeed: (propertyId, payload) => apiClient.post(`/admin/properties/${propertyId}/ical-feeds`, payload),
  deleteICalFeed: (propertyId, feedId) => apiClient.delete(`/admin/properties/${propertyId}/ical-feeds/${feedId}`),
  syncICalFeeds: (propertyId) => apiClient.post(`/admin/properties/${propertyId}/sync-ical`),
  createProperty: (propertyData) => apiClient.post('/admin/properties', propertyData),
  updateProperty: (id, propertyData) => apiClient.patch(`/admin/properties/${id}`, propertyData),
  updatePropertyStatus: (id, status) => apiClient.patch(`/admin/properties/${id}/status`, { status }),
  approveProperty: (id) => apiClient.patch(`/admin/properties/${id}/approve`),
  rejectProperty: (id) => apiClient.patch(`/admin/properties/${id}/reject`),
  suspendProperty: (id) => apiClient.patch(`/admin/properties/${id}/suspend`),

  // Bookings
  getBookings: () => apiClient.get('/admin/bookings'),
  getBookingById: (id) => apiClient.get(`/admin/bookings/${id}`),
  updateBookingLeadStatus: (id, leadStatus) => apiClient.patch(`/admin/bookings/${id}/lead-status`, { leadStatus }),
  confirmEnquiry: (id, payload) => apiClient.patch(`/admin/bookings/${id}/confirm`, payload),
  releaseBookingDates: (bookingId) => apiClient.post(`/admin/bookings/${bookingId}/release`),

  // Payments, Refunds & Payouts
  getPayments: () => apiClient.get('/admin/payments'),
  getRefunds: () => apiClient.get('/admin/refunds'),
  getPayouts: () => apiClient.get('/admin/payouts'),
  processPayout: (id) => apiClient.patch(`/admin/payouts/${id}/process`),

  // Cities (Destinations) CRUD
  getCities: () => apiClient.get('/admin/cities'),
  createCity: (cityData) => apiClient.post('/admin/cities', cityData),
  updateCity: (id, cityData) => apiClient.patch(`/admin/cities/${id}`, cityData),
  reorderCities: (citiesOrder) => apiClient.patch('/admin/cities/reorder', { cities: citiesOrder }),
  deleteCity: (id) => apiClient.delete(`/admin/cities/${id}`),

  // Collections CRUD
  getCollections: () => apiClient.get('/admin/collections'),
  createCollection: (colData) => apiClient.post('/admin/collections', colData),
  updateCollection: (id, colData) => apiClient.patch(`/admin/collections/${id}`, colData),
  deleteCollection: (id) => apiClient.delete(`/admin/collections/${id}`),

  // Partner Enquiries
  getPartnerEnquiries: () => apiClient.get('/admin/partner-enquiries'),
  updatePartnerEnquiryStatus: (id, status) => apiClient.patch(`/admin/partner-enquiries/${id}/status`, { status }),
  deletePartnerEnquiry: (id) => apiClient.delete(`/admin/partner-enquiries/${id}`),
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

