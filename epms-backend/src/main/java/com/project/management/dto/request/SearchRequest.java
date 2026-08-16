// dto/request/SearchRequest.java
package com.project.management.dto.request;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class SearchRequest {
    private String query;                  // Search term
    private String type;                   // tasks, projects, users, all
    private List<String> statuses;         // Filter by status
    private List<String> priorities;       // Filter by priority
    private Long assignedToId;             // Filter by assignee
    private Long projectId;                // Filter by project
    private LocalDate dueDateFrom;         // Date range start
    private LocalDate dueDateTo;           // Date range end
    private LocalDate createdAtFrom;       // Created date range start
    private LocalDate createdAtTo;         // Created date range end
    private String sortBy;                 // title, createdAt, dueDate, priority
    private String sortDirection;          // asc, desc
    private int page = 0;                  // Pagination
    private int size = 20;                 // Page size
}