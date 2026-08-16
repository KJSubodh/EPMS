// dto/request/NotificationRequest.java
package com.project.management.dto.request;

import lombok.Data;

@Data
public class NotificationRequest {
    private String message;
    private String type;
    private Long userId;
    private Long taskId;
    private Long projectId;
}