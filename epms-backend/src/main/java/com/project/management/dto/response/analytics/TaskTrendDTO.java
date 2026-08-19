// TaskTrendDTO.java
package com.project.management.dto.response.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskTrendDTO {
    private LocalDate date;
    private long created;
    private long completed;
    private long inProgress;
}