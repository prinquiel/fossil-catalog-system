import api from './api';

export const userService = {
  /**
   * Actualiza datos de usuario. El servidor solo permite cambiar correo/usuario a administradores.
   * @param {number|string} userId
   * @param {Record<string, unknown>} body
   */
  async updateUser(userId, body) {
    const { data } = await api.put(`/users/${userId}`, body);
    return data;
  },
};
