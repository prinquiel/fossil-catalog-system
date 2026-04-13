import api from './api';

export const fossilService = {
  async getAll(params = {}) {
    const response = await api.get('/fossils', { params });
    return response.data;
  },

  async getById(id) {
    const response = await api.get(`/fossils/${id}`);
    return response.data;
  },

  async create(fossilData) {
    const response = await api.post('/fossils', fossilData);
    return response.data;
  },

  async update(id, fossilData) {
    const response = await api.put(`/fossils/${id}`, fossilData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/fossils/${id}`);
    return response.data;
  },

  async approve(id) {
    const response = await api.patch(`/fossils/${id}/approve`);
    return response.data;
  },

  async reject(id) {
    const response = await api.patch(`/fossils/${id}/reject`);
    return response.data;
  },

  async getPending() {
    const response = await api.get('/fossils/admin/pending');
    return response.data;
  },
};
