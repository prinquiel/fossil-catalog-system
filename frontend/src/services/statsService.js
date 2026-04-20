import api from './api';

export const statsService = {
  overview() {
    return api.get('/stats/overview').then((r) => r.data);
  },
  fossils() {
    return api.get('/stats/fossils').then((r) => r.data);
  },
  users() {
    return api.get('/stats/users').then((r) => r.data);
  },
  categories() {
    return api.get('/stats/categories').then((r) => r.data);
  },
  timeline() {
    return api.get('/stats/timeline').then((r) => r.data);
  },
};
