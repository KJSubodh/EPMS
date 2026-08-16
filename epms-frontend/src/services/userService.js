import api from './api';

class UserService {
  async getUsers() {
    const response = await api.get('/users');
    return response.data;
  }

  async getUserById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  }

  async getEmployees() {
    const response = await api.get('/users/employees');
    return response.data;
  }

  async getCurrentUser() {
    const response = await api.get('/users/me');
    return response.data;
  }

  async updateUser(id, data) {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  }

  async activateUser(id) {
    const response = await api.patch(`/users/${id}/activate`);
    return response.data;
  }

  async deactivateUser(id) {
    const response = await api.patch(`/users/${id}/deactivate`);
    return response.data;
  }

  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  }
}

export default new UserService();