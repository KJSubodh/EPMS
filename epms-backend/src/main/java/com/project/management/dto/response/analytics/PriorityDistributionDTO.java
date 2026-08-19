// PriorityDistributionDTO.java
package com.project.management.dto.response.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriorityDistributionDTO {
    private String priority;
    private long count;
    private String color;
}