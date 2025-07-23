import axios from 'axios';

const API_URL = 'http://localhost:8081/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, logout the user
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  debugRegister: (userData) => api.post('/auth/debug', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

// Doctor services
export const doctorService = {
  getAllDoctors: () => api.get('/doctors/public/all'),
  getDoctorsBySpecialization: (specialization) => api.get(`/doctors/public/specialization/${specialization}`),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
  registerDoctor: (doctorData) => api.post('/doctors', doctorData),
  updateDoctor: (id, doctorData) => api.put(`/doctors/${id}`, doctorData),
  deleteDoctor: (id) => api.delete(`/doctors/${id}`),
};

// Appointment services
export const appointmentService = {
  getAppointments: () => api.get('/appointments'),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  bookAppointment: (appointmentData) => api.post('/appointments', appointmentData),
  cancelAppointment: (id) => api.put(`/appointments/${id}/cancel`),
  doctorCancelAppointment: (id) => api.put(`/appointments/${id}/doctor-cancel`),
  completeAppointment: (id) => api.put(`/appointments/${id}/complete`),
};

// Prescription services
export const prescriptionService = {
  getPrescriptions: () => api.get('/prescriptions'),
  getPrescriptionById: (id) => api.get(`/prescriptions/${id}`),
  createPrescription: (prescriptionData) => api.post('/prescriptions', prescriptionData),
  markAsPaid: (id) => api.put(`/prescriptions/${id}/pay`),
  generatePdf: (id) => api.get(`/prescriptions/${id}/pdf`, { responseType: 'blob' }),
};

export default api;