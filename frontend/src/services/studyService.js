import api from './api';

export const studyService = {
  async getAll() {
    const response = await api.get('/studies');
    return response.data;
  },

  /** Catálogo público: publicados + conteo de pendientes de revisión (sin autenticación). */
  async getPublicByFossil(fossilId) {
    const response = await api.get(`/studies/public/fossil/${fossilId}`);
    return response.data;
  },

  /** Índice público: todos los estudios publicados (listado). */
  async getPublicCatalog() {
    const response = await api.get('/studies/public');
    return response.data;
  },

  /** Detalle público: solo publicado (sin autenticación). */
  async getPublicById(id) {
    const response = await api.get(`/studies/public/${id}`);
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

  async getAdminPending() {
    const response = await api.get('/studies/admin/pending');
    return response.data;
  },

  async publish(id) {
    const response = await api.patch(`/studies/${id}/publish`);
    return response.data;
  },

  async reject(id, reason) {
    const response = await api.patch(`/studies/${id}/reject`, { reason: reason ?? null });
    return response.data;
  },

  /**
   * @param {Record<string, unknown> | FormData} payload — JSON o FormData (imagen de composición)
   */
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
