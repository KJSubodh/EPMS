// service/SearchService.java
package com.project.management.service;

import com.project.management.dto.request.SearchRequest;
import com.project.management.dto.response.SearchResponse;
import com.project.management.dto.response.SearchResult;
import com.project.management.model.Task;
import com.project.management.model.Project;
import com.project.management.model.User;
import com.project.management.repository.TaskRepository;
import com.project.management.repository.ProjectRepository;
import com.project.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public SearchResponse search(SearchRequest request) {
        String searchType = request.getType() != null ? request.getType() : "all";
        
        List<SearchResult> results = new ArrayList<>();
        Map<String, Long> typeCounts = new HashMap<>();
        long totalCount = 0;

        // Search based on type
        if ("all".equals(searchType) || "tasks".equals(searchType)) {
            var taskResults = searchTasks(request);
            results.addAll(taskResults);
            typeCounts.put("tasks", (long) taskResults.size());
            totalCount += taskResults.size();
        }

        if ("all".equals(searchType) || "projects".equals(searchType)) {
            var projectResults = searchProjects(request);
            results.addAll(projectResults);
            typeCounts.put("projects", (long) projectResults.size());
            totalCount += projectResults.size();
        }

        if ("all".equals(searchType) || "users".equals(searchType)) {
            var userResults = searchUsers(request);
            results.addAll(userResults);
            typeCounts.put("users", (long) userResults.size());
            totalCount += userResults.size();
        }

        // Sort by relevance (or date)
        results.sort((a, b) -> {
            if (a.getRelevanceScore() != null && b.getRelevanceScore() != null) {
                return b.getRelevanceScore().compareTo(a.getRelevanceScore());
            }
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });

        // Paginate results
        int start = request.getPage() * request.getSize();
        int end = Math.min(start + request.getSize(), results.size());
        List<SearchResult> paginatedResults = start < results.size() 
            ? results.subList(start, end) 
            : Collections.emptyList();

        // Generate suggestions
        List<String> suggestions = generateSuggestions(request.getQuery());

        return SearchResponse.builder()
                .results(paginatedResults.stream()
                    .map(r -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", r.getId());
                        map.put("title", r.getTitle());
                        map.put("description", r.getDescription());
                        map.put("type", r.getType());
                        map.put("status", r.getStatus());
                        map.put("priority", r.getPriority());
                        map.put("assignedTo", r.getAssignedTo());
                        map.put("projectName", r.getProjectName());
                        map.put("url", r.getUrl());
                        map.put("createdAt", r.getCreatedAt());
                        return map;
                    })
                    .collect(Collectors.toList()))
                .totalCount(totalCount)
                .page(request.getPage())
                .size(request.getSize())
                .totalPages((int) Math.ceil((double) totalCount / request.getSize()))
                .typeCounts(typeCounts)
                .suggestions(suggestions)
                .build();
    }

    private List<SearchResult> searchTasks(SearchRequest request) {
        Specification<Task> spec = SearchSpecification.taskSearch(request);
        List<Task> tasks = taskRepository.findAll(spec);
        
        return tasks.stream()
            .map(task -> SearchResult.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .type("TASK")
                .status(task.getStatus() != null ? task.getStatus().name() : null)
                .priority(task.getPriority() != null ? task.getPriority().name() : null)
                .assignedTo(task.getAssignedTo() != null ? task.getAssignedTo().getFullName() : null)
                .projectName(task.getProject() != null ? task.getProject().getName() : null)
                .url("/tasks/" + task.getId())
                .createdAt(task.getCreatedAt())
                .relevanceScore(calculateRelevanceScore(task.getTitle(), request.getQuery()))
                .build())
            .collect(Collectors.toList());
    }

    private List<SearchResult> searchProjects(SearchRequest request) {
        Specification<Project> spec = SearchSpecification.projectSearch(request);
        List<Project> projects = projectRepository.findAll(spec);
        
        return projects.stream()
            .map(project -> SearchResult.builder()
                .id(project.getId())
                .title(project.getName())
                .description(project.getDescription())
                .type("PROJECT")
                .status(project.getStatus() != null ? project.getStatus().name() : null)
                .url("/projects/" + project.getId())
                .createdAt(project.getCreatedAt())
                .relevanceScore(calculateRelevanceScore(project.getName(), request.getQuery()))
                .build())
            .collect(Collectors.toList());
    }

    private List<SearchResult> searchUsers(SearchRequest request) {
        Specification<User> spec = SearchSpecification.userSearch(request);
        List<User> users = userRepository.findAll(spec);
        
        return users.stream()
            .map(user -> SearchResult.builder()
                .id(user.getId())
                .title(user.getFullName())
                .description(user.getEmail())
                .type("USER")
                .url("/profile/" + user.getId())
                .createdAt(user.getCreatedAt())
                .relevanceScore(calculateRelevanceScore(user.getFullName(), request.getQuery()))
                .build())
            .collect(Collectors.toList());
    }

    private Double calculateRelevanceScore(String text, String query) {
        if (query == null || query.isEmpty() || text == null) {
            return 0.0;
        }
        String lowerText = text.toLowerCase();
        String lowerQuery = query.toLowerCase();
        
        // Exact match score
        if (lowerText.equals(lowerQuery)) {
            return 100.0;
        }
        
        // Contains query
        if (lowerText.contains(lowerQuery)) {
            return 80.0 - (lowerText.length() - lowerQuery.length()) * 0.5;
        }
        
        // Word match
        String[] words = lowerQuery.split("\\s+");
        int matches = 0;
        for (String word : words) {
            if (lowerText.contains(word)) {
                matches++;
            }
        }
        if (matches > 0) {
            return (double) matches / words.length * 60.0;
        }
        
        return 10.0;
    }

    // ✅ MAKE THIS PUBLIC so SearchController can access it
    public List<String> generateSuggestions(String query) {
        if (query == null || query.length() < 2) {
            return Collections.emptyList();
        }
        
        List<String> suggestions = new ArrayList<>();
        String lowerQuery = query.toLowerCase();
        
        // Common suggestions based on query
        if (lowerQuery.contains("task") || lowerQuery.contains("todo")) {
            suggestions.add("Filter by status: TODO");
            suggestions.add("Filter by status: IN_PROGRESS");
        }
        if (lowerQuery.contains("project")) {
            suggestions.add("Show all projects");
            suggestions.add("Filter by status: ACTIVE");
        }
        if (lowerQuery.contains("user") || lowerQuery.contains("assign")) {
            suggestions.add("Filter by assignee");
        }
        if (lowerQuery.contains("priority")) {
            suggestions.add("Filter by priority: HIGH");
            suggestions.add("Filter by priority: MEDIUM");
        }
        if (lowerQuery.contains("due") || lowerQuery.contains("date")) {
            suggestions.add("Filter by due date");
        }
        
        // Add general suggestions
        if (suggestions.isEmpty()) {
            suggestions.add("Try searching for tasks, projects, or users");
            suggestions.add("Use filters to narrow results");
        }
        
        return suggestions;
    }
}