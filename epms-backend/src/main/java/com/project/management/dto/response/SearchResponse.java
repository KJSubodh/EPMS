// dto/response/SearchResponse.java
package com.project.management.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class SearchResponse {
    private List<Map<String, Object>> results;
    private long totalCount;
    private int page;
    private int size;
    private int totalPages;
    private Map<String, Long> typeCounts;  // Count by type (tasks, projects, users)
    private List<String> suggestions;      // Search suggestions
}