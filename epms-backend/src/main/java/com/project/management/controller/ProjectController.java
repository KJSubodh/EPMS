package com.project.management.controller;

import com.project.management.dto.request.ProjectRequest;
import com.project.management.dto.request.ProjectMemberRequest;
import com.project.management.dto.response.ProjectResponse;
import com.project.management.model.User;
import com.project.management.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    /**
     * CREATE PROJECT - Only Admin
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody ProjectRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(projectService.createProject(request, currentUser));
    }

    /**
     * GET PROJECTS - Role-based filtering
     */
    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getProjects(
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(projectService.getProjectsForUser(currentUser));
    }

    /**
     * GET PROJECT BY ID - Role-based access
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProjectById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(projectService.getProjectById(id, currentUser));
    }

    /**
     * UPDATE PROJECT - Admin and Project Manager (own projects)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(projectService.updateProject(id, request, currentUser));
    }

    /**
     * DELETE PROJECT - Only Admin
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        projectService.deleteProject(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    /**
     * ADD MEMBER - Admin and Project Manager (own projects)
     */
    @PostMapping("/{projectId}/members")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<ProjectResponse> addMember(
            @PathVariable Long projectId,
            @Valid @RequestBody ProjectMemberRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(projectService.addMemberToProject(
            projectId, 
            request.getUserId(), 
            request.getRole(), 
            currentUser
        ));
    }

    /**
     * REMOVE MEMBER - Admin and Project Manager (own projects)
     */
    @DeleteMapping("/{projectId}/members/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long projectId,
            @PathVariable Long userId,
            @AuthenticationPrincipal User currentUser
    ) {
        projectService.removeMemberFromProject(projectId, userId, currentUser);
        return ResponseEntity.noContent().build();
    }
}