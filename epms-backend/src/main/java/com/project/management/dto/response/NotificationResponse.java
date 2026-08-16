// dto/response/NotificationResponse.java
package com.project.management.dto.response;

import com.project.management.enums.NotificationType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationResponse {
    private Long id;
    private String message;
    private NotificationType type;
    private Boolean isRead;
    private Long userId;
    private String userFullName;
    private Long taskId;
    private String taskTitle;
    private Long projectId;
    private String projectName;
    private LocalDateTime createdAt;
}