package com.project.management.service;

import com.project.management.dto.response.analytics.*;
import com.project.management.enums.Role;
import com.project.management.enums.TaskPriority;
import com.project.management.enums.TaskStatus;
import com.project.management.model.Project;
import com.project.management.model.Task;
import com.project.management.model.User;
import com.project.management.repository.ProjectRepository;
import com.project.management.repository.TaskRepository;
import com.project.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;

    // Helper method to check if task is completed
    private boolean isTaskCompleted(Task task) {
        return task.getStatus() == TaskStatus.DONE;
    }

    // Helper method to check if task is not completed
    private boolean isTaskNotCompleted(Task task) {
        return task.getStatus() != TaskStatus.DONE;
    }

    // ✅ Dashboard Summary
    public DashboardSummaryDTO getDashboardSummary() {
        log.info("Fetching dashboard summary");
        
        List<User> users = userRepository.findAll();
        List<Project> projects = projectRepository.findAll();
        List<Task> tasks = taskRepository.findAll();

        long totalUsers = users.size();
        long activeUsers = users.stream().filter(User::getIsActive).count();
        long totalProjects = projects.size();
        
        // ✅ FIX: Project uses ProjectStatus enum - compare using enum values
        long activeProjects = projects.stream()
                .filter(p -> p.getStatus() != null && "ACTIVE".equals(p.getStatus().name()))
                .count();
        long completedProjects = projects.stream()
                .filter(p -> p.getStatus() != null && "COMPLETED".equals(p.getStatus().name()))
                .count();
        long totalTasks = tasks.size();
        
        long completedTasks = tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.DONE)
                .count();
        long inProgressTasks = tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS)
                .count();
                
        long overdueTasks = tasks.stream()
                .filter(t -> isTaskNotCompleted(t))
                .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(LocalDate.now()))
                .count();
                
        long blockedTasks = tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.BLOCKED)
                .count();
                
        double completionRate = totalTasks > 0 ? (double) completedTasks / totalTasks * 100 : 0;
        double avgTasksPerUser = totalUsers > 0 ? (double) totalTasks / totalUsers : 0;

        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        long tasksCreatedThisWeek = tasks.stream()
                .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().isAfter(weekAgo))
                .count();
                
        long tasksCompletedThisWeek = tasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.DONE)
                .filter(t -> t.getUpdatedAt() != null && t.getUpdatedAt().isAfter(weekAgo))
                .count();

        return DashboardSummaryDTO.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .totalProjects(totalProjects)
                .activeProjects(activeProjects)
                .completedProjects(completedProjects)
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .inProgressTasks(inProgressTasks)
                .overdueTasks(overdueTasks)
                .blockedTasks(blockedTasks)
                .completionRate(Math.round(completionRate * 100.0) / 100.0)
                .avgTasksPerUser(Math.round(avgTasksPerUser * 100.0) / 100.0)
                .tasksCreatedThisWeek(tasksCreatedThisWeek)
                .tasksCompletedThisWeek(tasksCompletedThisWeek)
                .build();
    }

    // ✅ Project Status Distribution (using ProjectStatus enum)
    public List<ProjectStatusDTO> getProjectStatusDistribution() {
        log.info("Fetching project status distribution");
        
        List<Project> projects = projectRepository.findAll();
        
        Map<String, Long> statusCounts = new HashMap<>();
        for (Project project : projects) {
            // ✅ FIX: Get the name of the enum
            String status = project.getStatus() != null ? project.getStatus().name() : "UNKNOWN";
            statusCounts.put(status, statusCounts.getOrDefault(status, 0L) + 1);
        }

        Map<String, String> colorMap = Map.of(
                "PLANNING", "#3B82F6",
                "ACTIVE", "#22C55E",
                "ON_HOLD", "#F59E0B",
                "COMPLETED", "#8B5CF6",
                "CANCELLED", "#EF4444"
        );

        return statusCounts.entrySet().stream()
                .map(entry -> ProjectStatusDTO.builder()
                        .status(entry.getKey())
                        .count(entry.getValue())
                        .color(colorMap.getOrDefault(entry.getKey(), "#9CA3AF"))
                        .build())
                .sorted((a, b) -> Long.compare(b.getCount(), a.getCount()))
                .collect(Collectors.toList());
    }

    // ✅ Task Trend (Last 30 Days)
    public List<TaskTrendDTO> getTaskTrend() {
        log.info("Fetching task trend for last 30 days");
        
        LocalDate startDate = LocalDate.now().minusDays(29);
        List<Task> tasks = taskRepository.findAll();

        Map<LocalDate, TaskTrendDTO> trendMap = new HashMap<>();
        
        for (int i = 0; i < 30; i++) {
            LocalDate date = startDate.plusDays(i);
            trendMap.put(date, TaskTrendDTO.builder()
                    .date(date)
                    .created(0)
                    .completed(0)
                    .inProgress(0)
                    .build());
        }

        for (Task task : tasks) {
            if (task.getCreatedAt() != null) {
                LocalDate createdDate = task.getCreatedAt().toLocalDate();
                if (trendMap.containsKey(createdDate)) {
                    TaskTrendDTO dto = trendMap.get(createdDate);
                    dto.setCreated(dto.getCreated() + 1);
                }
            }
            
            if (task.getStatus() == TaskStatus.DONE && task.getUpdatedAt() != null) {
                LocalDate completedDate = task.getUpdatedAt().toLocalDate();
                if (trendMap.containsKey(completedDate)) {
                    TaskTrendDTO dto = trendMap.get(completedDate);
                    dto.setCompleted(dto.getCompleted() + 1);
                }
            }
            
            if (task.getStatus() == TaskStatus.IN_PROGRESS && task.getUpdatedAt() != null) {
                LocalDate updatedDate = task.getUpdatedAt().toLocalDate();
                if (trendMap.containsKey(updatedDate)) {
                    TaskTrendDTO dto = trendMap.get(updatedDate);
                    dto.setInProgress(dto.getInProgress() + 1);
                }
            }
        }

        return new ArrayList<>(trendMap.values());
    }

    // ✅ Team Performance
    public List<TeamPerformanceDTO> getTeamPerformance() {
        log.info("Fetching team performance");
        
        List<Role> roles = List.of(Role.EMPLOYEE, Role.PROJECT_MANAGER);
        List<User> users = userRepository.findByRoleIn(roles);
        List<Task> tasks = taskRepository.findAll();

        return users.stream().map(user -> {
            List<Task> userTasks = tasks.stream()
                    .filter(t -> t.getAssignedTo() != null && t.getAssignedTo().getId().equals(user.getId()))
                    .collect(Collectors.toList());

            long totalAssigned = userTasks.size();
            long completed = userTasks.stream()
                    .filter(t -> t.getStatus() == TaskStatus.DONE)
                    .count();
            long inProgress = userTasks.stream()
                    .filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS)
                    .count();
                    
            long overdue = userTasks.stream()
                    .filter(t -> isTaskNotCompleted(t))
                    .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(LocalDate.now()))
                    .count();

            double completionRate = totalAssigned > 0 ? (double) completed / totalAssigned * 100 : 0;
            
            double avgCompletionTime = userTasks.stream()
                    .filter(t -> t.getStatus() == TaskStatus.DONE 
                            && t.getCreatedAt() != null && t.getUpdatedAt() != null)
                    .mapToDouble(t -> {
                        long hours = ChronoUnit.HOURS.between(t.getCreatedAt(), t.getUpdatedAt());
                        return hours;
                    })
                    .average()
                    .orElse(0);

            return TeamPerformanceDTO.builder()
                    .userId(user.getId())
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .totalAssigned(totalAssigned)
                    .completed(completed)
                    .inProgress(inProgress)
                    .completionRate(Math.round(completionRate * 100.0) / 100.0)
                    .overdue(overdue)
                    .avgCompletionTime(Math.round(avgCompletionTime * 100.0) / 100.0)
                    .build();
        })
        .filter(dto -> dto.getTotalAssigned() > 0)
        .sorted((a, b) -> Long.compare(b.getCompleted(), a.getCompleted()))
        .collect(Collectors.toList());
    }

    // ✅ Priority Distribution
    public List<PriorityDistributionDTO> getPriorityDistribution() {
        log.info("Fetching priority distribution");
        
        List<Task> tasks = taskRepository.findAll();
        
        Map<String, Long> priorityCounts = new HashMap<>();
        for (Task task : tasks) {
            String priority = task.getPriority() != null ? task.getPriority().name() : "UNKNOWN";
            priorityCounts.put(priority, priorityCounts.getOrDefault(priority, 0L) + 1);
        }

        Map<String, String> colorMap = Map.of(
                "CRITICAL", "#EF4444",
                "MAJOR", "#F59E0B",
                "MEDIUM", "#3B82F6",
                "MINOR", "#9CA3AF"
        );

        return priorityCounts.entrySet().stream()
                .map(entry -> PriorityDistributionDTO.builder()
                        .priority(entry.getKey())
                        .count(entry.getValue())
                        .color(colorMap.getOrDefault(entry.getKey(), "#9CA3AF"))
                        .build())
                .sorted((a, b) -> Long.compare(b.getCount(), a.getCount()))
                .collect(Collectors.toList());
    }

    // ✅ User Activity (Last 7 Days)
    public Map<String, Long> getUserActivity() {
        log.info("Fetching user activity for last 7 days");
        
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        List<Task> recentTasks = taskRepository.findAll().stream()
                .filter(t -> t.getUpdatedAt() != null && t.getUpdatedAt().isAfter(weekAgo))
                .collect(Collectors.toList());

        Map<String, Long> activityMap = new HashMap<>();
        
        for (Task task : recentTasks) {
            if (task.getAssignedTo() != null) {
                String name = task.getAssignedTo().getFullName();
                activityMap.put(name, activityMap.getOrDefault(name, 0L) + 1);
            }
            if (task.getCreatedBy() != null) {
                String name = task.getCreatedBy().getFullName();
                activityMap.put(name, activityMap.getOrDefault(name, 0L) + 1);
            }
        }

        return activityMap;
    }
}