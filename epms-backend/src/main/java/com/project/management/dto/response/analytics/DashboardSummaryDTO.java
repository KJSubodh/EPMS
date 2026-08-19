// DashboardSummaryDTO.java
package com.project.management.dto.response.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDTO {
    private long totalUsers;
    private long activeUsers;
    private long totalProjects;
    private long activeProjects;
    private long completedProjects;
    private long totalTasks;
    private long completedTasks;
    private long inProgressTasks;
    private long overdueTasks;
    private long blockedTasks;
    private double completionRate;
    private double avgTasksPerUser;
    private long tasksCreatedThisWeek;
    private long tasksCompletedThisWeek;
}