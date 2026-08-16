// dto/response/SearchResult.java
package com.project.management.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class SearchResult {
    private Long id;
    private String title;
    private String description;
    private String type;          // TASK, PROJECT, USER
    private String status;
    private String priority;
    private String assignedTo;
    private String projectName;
    private String url;           // Frontend URL to navigate
    private LocalDateTime createdAt;
    private Double relevanceScore;
}