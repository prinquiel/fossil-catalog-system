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

  getUserById(id) {
    return api.get(`/users/${id}`).then((r) => r.data);
  },

  createUser(payload) {
    return api.post('/users', payload).then((r) => r.data);
  },

  updateUser(id, payload) {
    return api.put(`/users/${id}`, payload).then((r) => r.data);
  },

  updateUserRoles(id, roles) {
    return api.patch(`/users/${id}/roles`, { roles }).then((r) => r.data);
  },

  deleteUser(id) {
    return api.delete(`/users/${id}`).then((r) => r.data);
  },

  activateUser(id) {
    return api.patch(`/users/${id}/activate`).then((r) => r.data);
  },
};
