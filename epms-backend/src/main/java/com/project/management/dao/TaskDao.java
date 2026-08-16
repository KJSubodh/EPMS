// dao/TaskDao.java
package com.project.management.dao;

import com.project.management.model.Task;
import com.project.management.enums.TaskStatus;
import com.project.management.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class TaskDao {

    private final TaskRepository taskRepository;

    public Task save(Task task) {
        return taskRepository.save(task);
    }

    public Optional<Task> findById(Long id) {
        return taskRepository.findById(id);
    }

    public List<Task> findAll() {
        return taskRepository.findAll();
    }

    public List<Task> findByProjectId(Long projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    public List<Task> findByProjectIdOrderByBoardPositionAsc(Long projectId) {
        return taskRepository.findByProjectIdOrderByBoardPositionAsc(projectId);
    }

    public List<Task> findByProjectIdAndStatusOrderByBoardPositionAsc(Long projectId, TaskStatus status) {
        return taskRepository.findByProjectIdAndStatusOrderByBoardPositionAsc(projectId, status);
    }

    public List<Task> findByAssignedToId(Long userId) {
        return taskRepository.findByAssignedToId(userId);
    }

    public List<Task> findByProjectIdAndAssignedToId(Long projectId, Long userId) {
        return taskRepository.findByProjectIdAndAssignedToId(projectId, userId);
    }

    public List<Task> findByStatus(TaskStatus status) {
        return taskRepository.findByStatus(status);
    }

    // ✅ ADD THIS METHOD
    public List<Task> findByDueDate(LocalDate dueDate) {
        return taskRepository.findByDueDate(dueDate);
    }

    public List<Task> findOverdueTasks(LocalDate date) {
        return taskRepository.findOverdueTasks(date);
    }

    public Long countByProjectId(Long projectId) {
        return taskRepository.countByProjectId(projectId);
    }

    public Long countCompletedByProjectId(Long projectId) {
        return taskRepository.countCompletedByProjectId(projectId);
    }

    public Long countPendingByProjectId(Long projectId) {
        return taskRepository.countPendingByProjectId(projectId);
    }

    public List<Task> findTasksByUserAndDateRange(Long userId, LocalDate startDate, LocalDate endDate) {
        return taskRepository.findTasksByUserAndDateRange(userId, startDate, endDate);
    }

    public Integer getMaxBoardPositionByProjectAndStatus(Long projectId, TaskStatus status) {
        List<Task> tasks = taskRepository.findByProjectIdAndStatusOrderByBoardPositionAsc(projectId, status);
        if (tasks.isEmpty()) {
            return null;
        }
        return tasks.stream()
                .map(Task::getBoardPosition)
                .max(Integer::compareTo)
                .orElse(null);
    }

    public void delete(Task task) {
        taskRepository.delete(task);
    }

    public void deleteById(Long id) {
        taskRepository.deleteById(id);
    }

    public boolean existsById(Long id) {
        return taskRepository.existsById(id);
    }

    public void updateBoardPosition(Long taskId, Integer position) {
        taskRepository.updateBoardPosition(taskId, position);
    }
}