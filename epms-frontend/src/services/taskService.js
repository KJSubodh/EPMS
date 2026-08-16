import api from './api';

class TaskService {
  async getTasks() {
    const response = await api.get('/tasks');
    return response.data;
  }

  async getTaskById(id) {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  }

  async getTasksByProject(projectId) {
    const response = await api.get(`/tasks/project/${projectId}`);
    return response.data;
  }

  async getMyTasks() {
    const response = await api.get('/tasks/my-tasks');
    return response.data;
  }

  async createTask(projectId, data) {
    const response = await api.post(`/tasks/project/${projectId}`, data);
    return response.data;
  }

  async updateTask(id, data) {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  }

  async updateTaskStatus(id, status) {
    const response = await api.patch(`/tasks/${id}/status?status=${status}`);
    return response.data;
  }

  async deleteTask(id) {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  }

  async getOverdueTasks() {
    const response = await api.get('/tasks/overdue');
    return response.data;
  }
}

export default new TaskService();