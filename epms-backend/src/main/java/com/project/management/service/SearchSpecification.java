// service/SearchSpecification.java
package com.project.management.service;

import com.project.management.model.Task;
import com.project.management.model.Project;
import com.project.management.model.User;
import com.project.management.enums.TaskStatus;
import com.project.management.enums.TaskPriority;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.*;
import com.project.management.dto.request.SearchRequest;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class SearchSpecification {
    
    // ==================== TASK SPECIFICATIONS ====================
    
    public static Specification<Task> taskSearch(SearchRequest request) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Search by query in title or description
            if (request.getQuery() != null && !request.getQuery().isEmpty()) {
                String searchTerm = "%" + request.getQuery().toLowerCase() + "%";
                Predicate titlePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("title")), searchTerm);
                Predicate descPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("description")), searchTerm);
                predicates.add(criteriaBuilder.or(titlePredicate, descPredicate));
            }
            
            // Filter by statuses
            if (request.getStatuses() != null && !request.getStatuses().isEmpty()) {
                predicates.add(root.get("status").in(request.getStatuses()));
            }
            
            // Filter by priorities
            if (request.getPriorities() != null && !request.getPriorities().isEmpty()) {
                predicates.add(root.get("priority").in(request.getPriorities()));
            }
            
            // Filter by assignee
            if (request.getAssignedToId() != null) {
                predicates.add(criteriaBuilder.equal(
                    root.get("assignedTo").get("id"), request.getAssignedToId()));
            }
            
            // Filter by project
            if (request.getProjectId() != null) {
                predicates.add(criteriaBuilder.equal(
                    root.get("project").get("id"), request.getProjectId()));
            }
            
            // Filter by due date range
            if (request.getDueDateFrom() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("dueDate"), request.getDueDateFrom()));
            }
            if (request.getDueDateTo() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("dueDate"), request.getDueDateTo()));
            }
            
            // Filter by created date range
            if (request.getCreatedAtFrom() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("createdAt"), request.getCreatedAtFrom().atStartOfDay()));
            }
            if (request.getCreatedAtTo() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("createdAt"), request.getCreatedAtTo().atTime(23, 59, 59)));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
    
    // ==================== PROJECT SPECIFICATIONS ====================
    
    public static Specification<Project> projectSearch(SearchRequest request) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (request.getQuery() != null && !request.getQuery().isEmpty()) {
                String searchTerm = "%" + request.getQuery().toLowerCase() + "%";
                Predicate namePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("name")), searchTerm);
                Predicate descPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("description")), searchTerm);
                predicates.add(criteriaBuilder.or(namePredicate, descPredicate));
            }
            
            if (request.getStatuses() != null && !request.getStatuses().isEmpty()) {
                predicates.add(root.get("status").in(request.getStatuses()));
            }
            
            if (request.getCreatedAtFrom() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                    root.get("createdAt"), request.getCreatedAtFrom().atStartOfDay()));
            }
            if (request.getCreatedAtTo() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                    root.get("createdAt"), request.getCreatedAtTo().atTime(23, 59, 59)));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
    
    // ==================== USER SPECIFICATIONS ====================
    
    public static Specification<User> userSearch(SearchRequest request) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (request.getQuery() != null && !request.getQuery().isEmpty()) {
                String searchTerm = "%" + request.getQuery().toLowerCase() + "%";
                Predicate namePredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("fullName")), searchTerm);
                Predicate emailPredicate = criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("email")), searchTerm);
                predicates.add(criteriaBuilder.or(namePredicate, emailPredicate));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}