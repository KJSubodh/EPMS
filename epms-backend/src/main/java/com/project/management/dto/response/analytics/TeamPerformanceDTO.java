// TeamPerformanceDTO.java
package com.project.management.dto.response.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamPerformanceDTO {
    private Long userId;
    private String fullName;
    private String email;
    private String role;
    private long totalAssigned;
    private long completed;
    private long inProgress;
    private double completionRate;
    private long overdue;
    private double avgCompletionTime; // in hours
}