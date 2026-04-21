import api from './api';

export const geologyTaxonomyService = {
  async getEras() {
    const { data } = await api.get('/geology/eras');
    return data;
  },
  /** Todos los períodos (opcionalmente filtrar por era en el cliente). */
  async getAllPeriods() {
    const { data } = await api.get('/geology/periods');
    return data;
  },
  async getPeriodsByEra(eraId) {
    if (!eraId) return { success: true, data: [] };
    const { data } = await api.get(`/geology/periods/era/${eraId}`);
    return data;
  },
  async getKingdoms() {
    const { data } = await api.get('/taxonomy/kingdoms');
    return data;
  },
  async getPhylumsByKingdom(kingdomId) {
    if (!kingdomId) return { success: true, data: [] };
    const { data } = await api.get(`/taxonomy/phylums/kingdom/${kingdomId}`);
    return data;
  },
  async getClassesByPhylum(phylumId) {
    if (!phylumId) return { success: true, data: [] };
    const { data } = await api.get(`/taxonomy/classes/phylum/${phylumId}`);
    return data;
  },
  async getOrdersByClass(classId) {
    if (!classId) return { success: true, data: [] };
    const { data } = await api.get(`/taxonomy/orders/class/${classId}`);
    return data;
  },
  async getFamiliesByOrder(orderId) {
    if (!orderId) return { success: true, data: [] };
    const { data } = await api.get(`/taxonomy/families/order/${orderId}`);
    return data;
  },
  async getGeneraByFamily(familyId) {
    if (!familyId) return { success: true, data: [] };
    const { data } = await api.get(`/taxonomy/genera/family/${familyId}`);
    return data;
  },
  async getSpeciesByGenus(genusId) {
    if (!genusId) return { success: true, data: [] };
    const { data } = await api.get(`/taxonomy/species/genus/${genusId}`);
    return data;
  },
  async getAllSpecies() {
    const { data } = await api.get('/taxonomy/species');
    return data;
  },
};
