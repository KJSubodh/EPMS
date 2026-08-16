package com.project.management.dto.response;

import com.project.management.enums.TaskPriority;
import com.project.management.enums.TaskStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private TaskPriority priority;
    private TaskStatus status;
    private Long projectId;
    private String projectName;
    private Long assignedToId;
    private String assignedToName;
    private String createdBy;
    private LocalDate dueDate;
    private Double estimatedHours;
    private Double actualHours;
    private String fileAttachment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}