import api from './api';

export const auditService = {
  list() {
    return api.get('/audit').then((r) => r.data);
  },
};
