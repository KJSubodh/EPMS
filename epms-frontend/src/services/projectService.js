import api from './api';

class ProjectService {
  async getProjects() {
    const response = await api.get('/projects');
    return response.data;
  }

  async getProjectById(id) {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  }

  async createProject(data) {
    const response = await api.post('/projects', data);
    return response.data;
  }

  async updateProject(id, data) {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  }

  async deleteProject(id) {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  }

  async addMember(projectId, userId, role) {
    const response = await api.post(`/projects/${projectId}/members`, { userId, role });
    return response.data;
  }

  async removeMember(projectId, userId) {
    const response = await api.delete(`/projects/${projectId}/members/${userId}`);
    return response.data;
  }

  async getProjectStats(projectId) {
    const response = await api.get(`/projects/${projectId}/stats`);
    return response.data;
  }
}

export default new ProjectService();