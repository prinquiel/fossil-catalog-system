import api from './api';

export const studyService = {
  async getAll() {
    const response = await api.get('/studies');
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/studies/${id}`);
    return response.data;
  },

  async getByFossil(fossilId) {
    const response = await api.get(`/studies/fossil/${fossilId}`);
    return response.data;
  },

  async create(payload) {
    const response = await api.post('/studies', payload);
    return response.data;
  },

  async update(id, payload) {
    const response = await api.put(`/studies/${id}`, payload);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/studies/${id}`);
    return response.data;
  },
};
