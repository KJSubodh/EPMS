// dto/response/BoardColumnResponse.java
package com.project.management.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class BoardColumnResponse {
    private String status;
    private String label;
    private String color;
    private Integer count;
    private List<TaskResponse> tasks;
}