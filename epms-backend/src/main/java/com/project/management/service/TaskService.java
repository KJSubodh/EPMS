package com.project.management.service;

import com.project.management.dao.TaskDao;
import com.project.management.dao.ProjectDao;
import com.project.management.dao.UserDao;
import com.project.management.model.Task;
import com.project.management.model.TaskDocument;
import com.project.management.model.Project;
import com.project.management.model.User;
import com.project.management.enums.Role;
import com.project.management.enums.TaskStatus;
import com.project.management.enums.TaskPriority;
import com.project.management.enums.NotificationType;
import com.project.management.dto.request.TaskRequest;
import com.project.management.dto.request.BoardUpdateRequest;
import com.project.management.dto.response.TaskResponse;
import com.project.management.dto.response.BoardColumnResponse;
import com.project.management.dto.response.TaskDocumentResponse;
import com.project.management.exception.UnauthorizedException;
import com.project.management.exception.ResourceNotFoundException;
import com.project.management.exception.BusinessException;
import com.project.management.repository.TaskDocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskDao taskDao;
    private final ProjectDao projectDao;
    private final UserDao userDao;
    private final TaskDocumentRepository documentRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final EmailService emailService;  // ✅ ADD THIS

    // ==================== TASK CRUD METHODS ====================

    @Transactional
    public TaskResponse createTask(TaskRequest request, Long projectId, User currentUser) {
        if (currentUser.getRole() == Role.EMPLOYEE) {
            throw new UnauthorizedException("Employees cannot create tasks. Only Admins and Project Managers can.");
        }

        Project project = projectDao.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        if (currentUser.getRole() == Role.PROJECT_MANAGER) {
            boolean isMember = project.getMembers().stream()
                    .anyMatch(m -> m.getUser().getId().equals(currentUser.getId()));
            if (!isMember) {
                throw new UnauthorizedException("You are not a member of this project");
            }
        }

        User assignedTo = null;
        if (request.getAssignedToId() != null) {
            assignedTo = userDao.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }

        if (request.getDueDate().isBefore(LocalDate.now())) {
            throw new BusinessException("Due date cannot be in the past");
        }

        TaskStatus taskStatus = request.getStatus() != null ? request.getStatus() : TaskStatus.TODO;
        Integer maxPosition = taskDao.getMaxBoardPositionByProjectAndStatus(projectId, taskStatus);
        int nextPosition = (maxPosition != null ? maxPosition : -1) + 1;

        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status(taskStatus)
                .project(project)
                .assignedTo(assignedTo)
                .createdBy(currentUser)
                .dueDate(request.getDueDate())
                .estimatedHours(request.getEstimatedHours())
                .boardPosition(nextPosition)
                .build();

        Task savedTask = taskDao.save(task);

        // 🔔 Send in-app notification to assigned user
        if (assignedTo != null) {
            String message = String.format("You have been assigned to task: %s", savedTask.getTitle());
            notificationService.createTaskNotification(assignedTo, savedTask, message, NotificationType.TASK_ASSIGNED);

            // ✅ Send email notification to assigned user
            emailService.sendTaskAssignmentEmail(assignedTo, savedTask);
        }

        auditLogService.log("Task", savedTask.getId(), "CREATED", currentUser);

        return mapToResponse(savedTask);
    }

    public TaskResponse getTaskById(Long id, User currentUser) {
        Task task = taskDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (currentUser.getRole() == Role.EMPLOYEE) {
            if (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("You can only view tasks assigned to you");
            }
        }

        return mapToResponse(task);
    }

    public List<TaskResponse> getTasksForUser(User currentUser) {
        if (currentUser.getRole() == Role.EMPLOYEE) {
            return taskDao.findByAssignedToId(currentUser.getId())
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        } else {
            return taskDao.findAll()
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }
    }

    public List<TaskResponse> getTasksByProject(Long projectId, User currentUser) {
        List<Task> tasks = taskDao.findByProjectId(projectId);

        if (currentUser.getRole() == Role.EMPLOYEE) {
            tasks = tasks.stream()
                    .filter(t -> t.getAssignedTo() != null && t.getAssignedTo().getId().equals(currentUser.getId()))
                    .collect(Collectors.toList());
        }

        return tasks.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest request, User currentUser) {
        Task task = taskDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (currentUser.getRole() == Role.EMPLOYEE) {
            throw new UnauthorizedException("Employees cannot update task details. Only Admins and Project Managers can.");
        }

        if (currentUser.getRole() == Role.PROJECT_MANAGER) {
            boolean isMember = task.getProject().getMembers().stream()
                    .anyMatch(m -> m.getUser().getId().equals(currentUser.getId()));
            if (!isMember) {
                throw new UnauthorizedException("You are not a member of this project");
            }
        }

        if (task.getStatus() == TaskStatus.DONE) {
            throw new BusinessException("Completed tasks cannot be edited");
        }

        User previousAssignee = task.getAssignedTo();
        User assignedTo = null;
        if (request.getAssignedToId() != null) {
            assignedTo = userDao.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }

        if (request.getDueDate().isBefore(LocalDate.now())) {
            throw new BusinessException("Due date cannot be in the past");
        }

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        task.setStatus(request.getStatus());
        task.setDueDate(request.getDueDate());
        task.setEstimatedHours(request.getEstimatedHours());
        task.setAssignedTo(assignedTo);

        Task updated = taskDao.save(task);

        // 🔔 Send notifications for assignment changes
        if (assignedTo != null && (previousAssignee == null || !previousAssignee.getId().equals(assignedTo.getId()))) {
            String message = String.format("Task reassigned to you: %s", updated.getTitle());
            notificationService.createTaskNotification(assignedTo, updated, message, NotificationType.TASK_ASSIGNED);
            // ✅ Send email for reassignment
            emailService.sendTaskAssignmentEmail(assignedTo, updated);
        }

        if (previousAssignee != null && (assignedTo == null || !previousAssignee.getId().equals(assignedTo.getId()))) {
            String message = String.format("You have been unassigned from task: %s", updated.getTitle());
            // This is an unassignment, not a new assignment - was previously
            // mis-typed as TASK_ASSIGNED, which showed the wrong icon/color.
            notificationService.createTaskNotification(previousAssignee, updated, message, NotificationType.TASK_UPDATED);
        }

        auditLogService.log("Task", id, "UPDATED", currentUser);

        return mapToResponse(updated);
    }

    @Transactional
    public TaskResponse updateTaskStatus(Long id, TaskStatus status, User currentUser) {
        Task task = taskDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        boolean isAssignedToMe = task.getAssignedTo() != null && task.getAssignedTo().getId().equals(currentUser.getId());
        boolean isAdminOrPM = currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.PROJECT_MANAGER;

        if (!isAdminOrPM && !isAssignedToMe) {
            throw new UnauthorizedException("You can only update status of tasks assigned to you");
        }

        if (task.getStatus() == TaskStatus.DONE && status != TaskStatus.DONE) {
            throw new BusinessException("Completed tasks cannot be reopened");
        }

        TaskStatus previousStatus = task.getStatus();
        task.setStatus(status);
        Task updated = taskDao.save(task);

        boolean isCompletion = status == TaskStatus.DONE;
        NotificationType statusNotificationType = isCompletion ? NotificationType.TASK_COMPLETED : NotificationType.TASK_UPDATED;

        // 🔔 Notify the assignee - a single notification per status change.
        // Previously this fired twice on completion (once here, once more
        // below), and fired even when the assignee completed their own task.
        if (task.getAssignedTo() != null && !task.getAssignedTo().getId().equals(currentUser.getId())) {
            String assigneeMessage = isCompletion
                    ? String.format("Task completed: %s", updated.getTitle())
                    : String.format("Task '%s' status changed from %s to %s", updated.getTitle(), previousStatus, status);
            notificationService.createTaskNotification(task.getAssignedTo(), updated, assigneeMessage, statusNotificationType);

            if (isCompletion) {
                // ✅ Send email completion notification
                emailService.sendTaskCompletionEmail(updated, task.getAssignedTo());
            }
        }

        if (task.getCreatedBy() != null && !task.getCreatedBy().getId().equals(currentUser.getId())) {
            if (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(task.getCreatedBy().getId())) {
                String message = String.format("Task '%s' status updated to %s by %s",
                        updated.getTitle(), status, currentUser.getFullName());
                notificationService.createTaskNotification(task.getCreatedBy(), updated, message, statusNotificationType);
            }
        }

        auditLogService.log("Task", id, "STATUS_UPDATED", currentUser);

        return mapToResponse(updated);
    }

    @Transactional
    public void deleteTask(Long id, User currentUser) {
        Task task = taskDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (currentUser.getRole() == Role.EMPLOYEE) {
            throw new UnauthorizedException("Employees cannot delete tasks. Only Admins and Project Managers can.");
        }

        if (currentUser.getRole() == Role.PROJECT_MANAGER) {
            boolean isMember = task.getProject().getMembers().stream()
                    .anyMatch(m -> m.getUser().getId().equals(currentUser.getId()));
            if (!isMember) {
                throw new UnauthorizedException("You are not a member of this project");
            }
        }

        auditLogService.log("Task", id, "DELETED", currentUser);
        taskDao.delete(task);
    }

    public List<TaskResponse> getMyTasks(User currentUser) {
        return taskDao.findByAssignedToId(currentUser.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ==================== KANBAN BOARD METHODS ====================

    public List<BoardColumnResponse> getBoardData(Long projectId, User currentUser) {
        Project project = projectDao.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        List<Task> tasks = taskDao.findByProjectIdOrderByBoardPositionAsc(projectId);

        if (currentUser.getRole() == Role.EMPLOYEE) {
            tasks = tasks.stream()
                    .filter(t -> t.getAssignedTo() != null &&
                            t.getAssignedTo().getId().equals(currentUser.getId()))
                    .collect(Collectors.toList());
        }

        Map<TaskStatus, List<Task>> grouped = tasks.stream()
                .collect(Collectors.groupingBy(Task::getStatus));

        List<BoardColumnResponse> columns = new ArrayList<>();
        TaskStatus[] statusOrder = { TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW, TaskStatus.DONE };

        for (TaskStatus status : statusOrder) {
            List<Task> statusTasks = grouped.getOrDefault(status, new ArrayList<>());
            statusTasks.sort(Comparator.comparing(Task::getBoardPosition));

            BoardColumnResponse column = BoardColumnResponse.builder()
                    .status(status.name())
                    .label(status.getLabel())
                    .color(status.getColor())
                    .count(statusTasks.size())
                    .tasks(statusTasks.stream()
                            .map(this::mapToResponse)
                            .collect(Collectors.toList()))
                    .build();

            columns.add(column);
        }

        return columns;
    }

    @Transactional
    public void updateBoard(BoardUpdateRequest request, User currentUser) {
        if (request.getColumns() == null || request.getColumns().isEmpty()) {
            throw new BusinessException("Board data cannot be empty");
        }

        Long firstTaskId = null;
        for (BoardUpdateRequest.ColumnUpdate column : request.getColumns()) {
            if (column.getTaskIds() != null && !column.getTaskIds().isEmpty()) {
                firstTaskId = column.getTaskIds().get(0);
                break;
            }
        }

        if (firstTaskId != null) {
            Task firstTask = taskDao.findById(firstTaskId)
                    .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

            if (currentUser.getRole() == Role.EMPLOYEE) {
                throw new UnauthorizedException("Employees cannot reorder board");
            }
        }

        int position = 0;
        for (BoardUpdateRequest.ColumnUpdate column : request.getColumns()) {
            TaskStatus status = TaskStatus.valueOf(column.getStatus());

            if (column.getTaskIds() == null)
                continue;

            for (Long taskId : column.getTaskIds()) {
                Task task = taskDao.findById(taskId)
                        .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));

                if (!task.getStatus().equals(status) || !task.getBoardPosition().equals(position)) {
                    task.setStatus(status);
                    task.setBoardPosition(position);
                    taskDao.save(task);
                }
                position++;
            }
        }
    }

    public List<BoardColumnResponse> getMyBoard(User currentUser) {
        List<Task> tasks = taskDao.findByAssignedToId(currentUser.getId());

        Map<TaskStatus, List<Task>> grouped = tasks.stream()
                .collect(Collectors.groupingBy(Task::getStatus));

        List<BoardColumnResponse> columns = new ArrayList<>();
        TaskStatus[] statusOrder = { TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW, TaskStatus.DONE };

        for (TaskStatus status : statusOrder) {
            List<Task> statusTasks = grouped.getOrDefault(status, new ArrayList<>());
            statusTasks.sort(Comparator.comparing(Task::getBoardPosition));

            BoardColumnResponse column = BoardColumnResponse.builder()
                    .status(status.name())
                    .label(status.getLabel())
                    .color(status.getColor())
                    .count(statusTasks.size())
                    .tasks(statusTasks.stream()
                            .map(this::mapToResponse)
                            .collect(Collectors.toList()))
                    .build();

            columns.add(column);
        }

        return columns;
    }

    // ==================== DOCUMENT MANAGEMENT METHODS ====================

    public TaskDocument getDocumentById(Long documentId, User currentUser) {
        TaskDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        if (currentUser.getRole() == Role.EMPLOYEE) {
            Task task = document.getTask();
            if (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("You can only view documents from tasks assigned to you");
            }
        }

        return document;
    }

    @Transactional
    public TaskDocument uploadDocument(Long taskId, MultipartFile file, User currentUser) {
        Task task = taskDao.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (currentUser.getRole() == Role.EMPLOYEE) {
            if (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("You can only upload documents to tasks assigned to you");
            }
        }

        if (file.isEmpty()) {
            throw new BusinessException("File is empty");
        }

        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BusinessException("File size exceeds 10MB limit");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        if (!isValidFileType(extension)) {
            throw new BusinessException(
                    "File type not allowed. Allowed: PDF, JPG, PNG, GIF, DOC, DOCX, XLS, XLSX, TXT, CSV, ZIP");
        }

        try {
            String uploadDir = "uploads/tasks/" + taskId;
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String uniqueFilename = UUID.randomUUID().toString() + "." + extension;
            Path filePath = uploadPath.resolve(uniqueFilename);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            TaskDocument document = TaskDocument.builder()
                    .fileName(originalFilename)
                    .filePath(filePath.toString())
                    .fileType(extension)
                    .fileSize(file.getSize())
                    .task(task)
                    .uploadedBy(currentUser)
                    .build();

            TaskDocument saved = documentRepository.save(document);

            auditLogService.log("TaskDocument", saved.getId(), "UPLOADED", currentUser);

            return saved;
        } catch (IOException e) {
            throw new BusinessException("Failed to upload file: " + e.getMessage());
        }
    }

    public List<TaskDocumentResponse> getTaskDocumentsWithResponse(Long taskId, User currentUser) {
        Task task = taskDao.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (currentUser.getRole() == Role.EMPLOYEE) {
            if (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("You can only view documents for tasks assigned to you");
            }
        }

        List<TaskDocument> documents = documentRepository.findByTaskIdOrderByCreatedAtDesc(taskId);

        return documents.stream()
                .map(this::mapToDocumentResponse)
                .collect(Collectors.toList());
    }

    public List<TaskDocument> getTaskDocuments(Long taskId, User currentUser) {
        Task task = taskDao.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        if (currentUser.getRole() == Role.EMPLOYEE) {
            if (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("You can only view documents for tasks assigned to you");
            }
        }

        return documentRepository.findByTaskIdOrderByCreatedAtDesc(taskId);
    }

    @Transactional
    public void deleteDocument(Long documentId, User currentUser) {
        TaskDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        if (currentUser.getRole() == Role.EMPLOYEE) {
            Task task = document.getTask();
            if (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("You can only delete documents from tasks assigned to you");
            }
        }

        try {
            Path filePath = Paths.get(document.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println("Failed to delete file: " + e.getMessage());
        }

        documentRepository.delete(document);

        auditLogService.log("TaskDocument", documentId, "DELETED", currentUser);
    }

    // ==================== HELPER METHODS ====================

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }

    private boolean isValidFileType(String extension) {
        String[] allowed = { "pdf", "jpg", "jpeg", "png", "gif", "doc", "docx", "xls", "xlsx", "txt", "csv", "zip" };
        for (String ext : allowed) {
            if (ext.equals(extension)) {
                return true;
            }
        }
        return false;
    }

    public String formatFileSize(Long size) {
        if (size == null || size == 0)
            return "0 B";

        String[] units = { "B", "KB", "MB", "GB" };
        int index = 0;
        double fileSize = size;

        while (fileSize >= 1024 && index < units.length - 1) {
            fileSize /= 1024;
            index++;
        }

        return String.format("%.1f %s", fileSize, units[index]);
    }

    private boolean isImageFile(String fileName) {
        if (fileName == null)
            return false;
        String ext = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        String[] imageExts = { "jpg", "jpeg", "png", "gif", "svg", "webp", "bmp", "ico" };
        for (String imageExt : imageExts) {
            if (imageExt.equals(ext))
                return true;
        }
        return false;
    }

    public TaskDocumentResponse mapToDocumentResponse(TaskDocument document) {
        return TaskDocumentResponse.builder()
                .id(document.getId())
                .fileName(document.getFileName())
                .filePath(document.getFilePath())
                .fileType(document.getFileType())
                .fileSize(document.getFileSize())
                .formattedSize(formatFileSize(document.getFileSize()))
                .taskId(document.getTask().getId())
                .uploadedBy(document.getUploadedBy().getId().toString())
                .uploadedByName(document.getUploadedBy().getFullName())
                .uploadedAt(document.getCreatedAt())
                .isImage(isImageFile(document.getFileName()))
                .build();
    }

    private TaskResponse mapToResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .priority(task.getPriority())
                .status(task.getStatus())
                .projectId(task.getProject().getId())
                .projectName(task.getProject().getName())
                .assignedToId(task.getAssignedTo() != null ? task.getAssignedTo().getId() : null)
                .assignedToName(task.getAssignedTo() != null ? task.getAssignedTo().getFullName() : null)
                .createdBy(task.getCreatedBy().getFullName())
                .dueDate(task.getDueDate())
                .estimatedHours(task.getEstimatedHours())
                .actualHours(task.getActualHours())
                .fileAttachment(task.getFileAttachment())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}