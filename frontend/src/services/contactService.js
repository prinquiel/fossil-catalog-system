import api from './api';

export const contactService = {
  list() {
    return api.get('/contact').then((r) => r.data);
  },
  getById(id) {
    return api.get(`/contact/${id}`).then((r) => r.data);
  },
  markRead(id) {
    return api.patch(`/contact/${id}/read`).then((r) => r.data);
  },
  markReplied(id) {
    return api.patch(`/contact/${id}/reply`).then((r) => r.data);
  },
  remove(id) {
    return api.delete(`/contact/${id}`).then((r) => r.data);
  },
};
