import api from './api';

export const searchService = {
  /**
   * @param {string} q
   */
  async searchFossils(q) {
    const response = await api.get('/search', { params: { q } });
    return response.data;
  },

  /**
   * @param {Record<string, string>} params
   */
  async advancedFossils(params) {
    const response = await api.get('/search/advanced', { params });
    return response.data;
  },
};
