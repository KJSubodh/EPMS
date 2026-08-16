// dto/request/BoardUpdateRequest.java
package com.project.management.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class BoardUpdateRequest {
    private List<ColumnUpdate> columns;
    
    @Data
    public static class ColumnUpdate {
        private String status;
        private List<Long> taskIds;
    }
}