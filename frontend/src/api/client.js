import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(
          `${API_URL}/auth/refresh-token`,
          { refreshToken },
          { withCredentials: true }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/current-user'),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendEmailVerification: () => api.post('/auth/resend-email-verification'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post(`/auth/reset-password/${token}`, { newPassword }),
  changePassword: (oldPassword, newPassword) => api.post('/auth/change-password', { oldPassword, newPassword }),
};

export const projectApi = {
  list: () => api.get('/projects'),
  create: (data) => api.post('/projects', data),
  get: (projectId) => api.get(`/projects/${projectId}`),
  update: (projectId, data) => api.put(`/projects/${projectId}`, data),
  delete: (projectId) => api.delete(`/projects/${projectId}`),
  listMembers: (projectId) => api.get(`/projects/${projectId}/members`),
  addMember: (projectId, data) => api.post(`/projects/${projectId}/members`, data),
  updateMemberRole: (projectId, userId, newRole) => api.put(`/projects/${projectId}/members/${userId}`, { newRole }),
  removeMember: (projectId, userId) => api.delete(`/projects/${projectId}/members/${userId}`),
};

export const taskApi = {
  list: (projectId) => api.get(`/tasks/${projectId}`),
  create: (projectId, data) => api.post(`/tasks/${projectId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  get: (projectId, taskId) => api.get(`/tasks/${projectId}/t/${taskId}`),
  update: (projectId, taskId, data) => api.put(`/tasks/${projectId}/t/${taskId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (projectId, taskId) => api.delete(`/tasks/${projectId}/t/${taskId}`),
  createSubtask: (projectId, taskId, data) => api.post(`/tasks/${projectId}/t/${taskId}/subtasks`, data),
  updateSubtask: (projectId, subTaskId, data) => api.put(`/tasks/${projectId}/st/${subTaskId}`, data),
  deleteSubtask: (projectId, subTaskId) => api.delete(`/tasks/${projectId}/st/${subTaskId}`),
};

export const noteApi = {
  list: (projectId) => api.get(`/notes/${projectId}`),
  create: (projectId, data) => api.post(`/notes/${projectId}`, data),
  get: (projectId, noteId) => api.get(`/notes/${projectId}/n/${noteId}`),
  update: (projectId, noteId, data) => api.put(`/notes/${projectId}/n/${noteId}`, data),
  delete: (projectId, noteId) => api.delete(`/notes/${projectId}/n/${noteId}`),
};

export const healthApi = {
  check: () => api.get('/healthcheck'),
};