package com.project.management.controller;

import com.project.management.dto.request.TaskRequest;
import com.project.management.dto.request.BoardUpdateRequest;
import com.project.management.dto.response.TaskDocumentResponse;
import com.project.management.dto.response.TaskResponse;
import com.project.management.dto.response.BoardColumnResponse;
import com.project.management.enums.TaskStatus;
import com.project.management.exception.BusinessException;
import com.project.management.model.User;
import com.project.management.model.TaskDocument;
import com.project.management.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    /**
     * CREATE TASK - Admin and Project Manager only
     */
    @PostMapping("/project/{projectId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<TaskResponse> createTask(
            @PathVariable Long projectId,
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(taskService.createTask(request, projectId, currentUser));
    }

    /**
     * GET ALL TASKS - Employees see only their tasks, Admins/PM see all
     */
    @GetMapping
    public ResponseEntity<List<TaskResponse>> getTasks(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(taskService.getTasksForUser(currentUser));
    }

    /**
     * GET TASK BY ID - Employees can only view tasks assigned to them
     */
    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(taskService.getTaskById(id, currentUser));
    }

    /**
     * GET TASKS BY PROJECT - Employees see only tasks assigned to them in that project
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TaskResponse>> getTasksByProject(
            @PathVariable Long projectId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(taskService.getTasksByProject(projectId, currentUser));
    }

    /**
     * GET MY TASKS - Convenience endpoint for employees
     */
    @GetMapping("/my-tasks")
    public ResponseEntity<List<TaskResponse>> getMyTasks(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(taskService.getMyTasks(currentUser));
    }

    /**
     * UPDATE TASK - Admin and Project Manager only
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(taskService.updateTask(id, request, currentUser));
    }

    /**
     * UPDATE TASK STATUS - Anyone assigned to the task can update status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskResponse> updateTaskStatus(
            @PathVariable Long id,
            @RequestParam TaskStatus status,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(taskService.updateTaskStatus(id, status, currentUser));
    }

    /**
     * DELETE TASK - Admin and Project Manager only
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        taskService.deleteTask(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET OVERDUE TASKS
     */
    @GetMapping("/overdue")
    public ResponseEntity<List<TaskResponse>> getOverdueTasks(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(taskService.getTasksForUser(currentUser));
    }

    // ==================== KANBAN BOARD ENDPOINTS ====================

    /**
     * GET BOARD - Get all tasks grouped by status for a project
     */
    @GetMapping("/project/{projectId}/board")
    public ResponseEntity<List<BoardColumnResponse>> getBoard(
            @PathVariable Long projectId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(taskService.getBoardData(projectId, currentUser));
    }

    /**
     * GET MY BOARD - For employees to see their own board
     */
    @GetMapping("/my-board")
    public ResponseEntity<List<BoardColumnResponse>> getMyBoard(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(taskService.getMyBoard(currentUser));
    }

    /**
     * UPDATE BOARD - Reorder tasks and update statuses
     */
    @PutMapping("/board")
    public ResponseEntity<Void> updateBoard(
            @RequestBody BoardUpdateRequest request,
            @AuthenticationPrincipal User currentUser) {
        taskService.updateBoard(request, currentUser);
        return ResponseEntity.ok().build();
    }

    // ==================== DOCUMENT MANAGEMENT ENDPOINTS ====================

    /**
     * UPLOAD DOCUMENT TO TASK
     */
    @PostMapping("/{taskId}/documents")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'EMPLOYEE')")
    public ResponseEntity<TaskDocumentResponse> uploadDocument(
            @PathVariable Long taskId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User currentUser) {
        TaskDocument document = taskService.uploadDocument(taskId, file, currentUser);
        return ResponseEntity.ok(taskService.mapToDocumentResponse(document));
    }

    /**
     * GET ALL DOCUMENTS FOR A TASK
     */
    @GetMapping("/{taskId}/documents")
    public ResponseEntity<List<TaskDocumentResponse>> getTaskDocuments(
            @PathVariable Long taskId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(taskService.getTaskDocumentsWithResponse(taskId, currentUser));
    }

    /**
     * DELETE DOCUMENT FROM TASK
     */
    @DeleteMapping("/documents/{documentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'EMPLOYEE')")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long documentId,
            @AuthenticationPrincipal User currentUser) {
        taskService.deleteDocument(documentId, currentUser);
        return ResponseEntity.noContent().build();
    }

    /**
     * DOWNLOAD DOCUMENT
     */
    @GetMapping("/documents/{documentId}/download")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long documentId,
            @AuthenticationPrincipal User currentUser) {
        TaskDocument document = taskService.getDocumentById(documentId, currentUser);

        try {
            java.nio.file.Path filePath = java.nio.file.Paths.get(document.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                throw new BusinessException("File not found");
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + document.getFileName() + "\"")
                    .body(resource);
        } catch (MalformedURLException e) {
            throw new BusinessException("Error downloading file");
        }
    }
}