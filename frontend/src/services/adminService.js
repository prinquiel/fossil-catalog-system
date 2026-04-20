import api from './api';

export const adminService = {
  getUserStats() {
    return api.get('/users/stats').then((r) => r.data);
  },

  getPendingRegistrations(params) {
    return api.get('/users/pending', { params }).then((r) => r.data);
  },

  approveRegistration(userId) {
    return api.patch(`/users/${userId}/approve-registration`).then((r) => r.data);
  },

  rejectRegistration(userId, reason) {
    return api.patch(`/users/${userId}/reject-registration`, { reason }).then((r) => r.data);
  },

  getUsers(params) {
    return api.get('/users', { params }).then((r) => r.data);
  },

  createUser(payload) {
    return api.post('/users', payload).then((r) => r.data);
  },
};
