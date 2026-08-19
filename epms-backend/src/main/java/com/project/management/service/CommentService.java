// service/CommentService.java
package com.project.management.service;

import com.project.management.dao.CommentDao;
import com.project.management.dao.TaskDao;
import com.project.management.dao.UserDao;
import com.project.management.model.Comment;
import com.project.management.model.Task;
import com.project.management.model.User;
import com.project.management.enums.Role;
import com.project.management.enums.NotificationType;
import com.project.management.dto.request.CommentRequest;
import com.project.management.dto.response.CommentResponse;
import com.project.management.exception.ResourceNotFoundException;
import com.project.management.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommentService {

    private final CommentDao commentDao;
    private final TaskDao taskDao;
    private final UserDao userDao;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final EmailService emailService; // ✅ Add this

    /**
     * Employees could previously read/write comments on ANY task, including
     * ones they aren't assigned to - every other task-related service
     * (TaskService, document access) enforces "employees only see their own
     * tasks" but comments skipped that check entirely. This mirrors the
     * same rule used elsewhere.
     */
    private void checkTaskAccess(Task task, User currentUser) {
        if (currentUser.getRole() == Role.EMPLOYEE) {
            if (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("You can only comment on tasks assigned to you");
            }
        }
    }

    // ✅ Process @mentions in content
    private List<Long> processMentions(String content, User currentUser, Task task) {
        List<Long> mentionedUserIds = new java.util.ArrayList<>();
        
        if (content == null || content.isEmpty()) {
            return mentionedUserIds;
        }

        // Find all @mentions (matches email format)
        Pattern pattern = Pattern.compile("@([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})");
        Matcher matcher = pattern.matcher(content);

        while (matcher.find()) {
            String mentionedEmail = matcher.group(1);
            
            // Find user by email
            userDao.findByEmail(mentionedEmail).ifPresent(user -> {
                if (!user.getId().equals(currentUser.getId())) {
                    mentionedUserIds.add(user.getId());
                    log.info("Found mention: {} by {}", user.getEmail(), currentUser.getEmail());
                }
            });
        }

        return mentionedUserIds;
    }

    @Transactional
    public CommentResponse createComment(Long taskId, CommentRequest request, User currentUser) {
        Task task = taskDao.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        checkTaskAccess(task, currentUser);

        Comment parent = null;
        if (request.getParentId() != null) {
            parent = commentDao.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent comment not found"));
        }

        Comment comment = Comment.builder()
                .content(request.getContent())
                .task(task)
                .user(currentUser)
                .parent(parent)
                .build();

        // ✅ Process @mentions
        List<Long> mentionedUserIds = processMentions(request.getContent(), currentUser, task);
        comment.setMentionedUserIds(mentionedUserIds);

        Comment saved = commentDao.save(comment);

        // 🔔 Send notification to task assignee (if not the commenter)
        if (task.getAssignedTo() != null && !task.getAssignedTo().getId().equals(currentUser.getId())) {
            String message = String.format("%s commented on task: %s", currentUser.getFullName(), task.getTitle());
            notificationService.createTaskNotification(task.getAssignedTo(), task, message, NotificationType.TASK_UPDATED);
        }

        // 🔔 Send notification to task creator (if different from assignee and commenter)
        if (task.getCreatedBy() != null && 
            !task.getCreatedBy().getId().equals(currentUser.getId()) &&
            (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(task.getCreatedBy().getId()))) {
            String message = String.format("%s commented on task: %s", currentUser.getFullName(), task.getTitle());
            notificationService.createTaskNotification(task.getCreatedBy(), task, message, NotificationType.TASK_UPDATED);
        }

        // 🔔 If reply, notify parent comment author
        if (parent != null && !parent.getUser().getId().equals(currentUser.getId())) {
            String message = String.format("%s replied to your comment on task: %s", 
                    currentUser.getFullName(), task.getTitle());
            notificationService.createTaskNotification(parent.getUser(), task, message, NotificationType.TASK_UPDATED);
        }

        // ✅ Send notifications to mentioned users
        for (Long userId : mentionedUserIds) {
            User mentionedUser = userDao.findById(userId).orElse(null);
            if (mentionedUser != null && !mentionedUser.getId().equals(currentUser.getId())) {
                // In-app notification
                String mentionMessage = String.format("%s mentioned you in a comment on task: %s", 
                        currentUser.getFullName(), task.getTitle());
                notificationService.createTaskNotification(mentionedUser, task, mentionMessage, NotificationType.TASK_UPDATED);
                
                // ✅ Email notification for mention
                emailService.sendMentionEmail(mentionedUser, currentUser, task, saved);
            }
        }

        auditLogService.log("Comment", saved.getId(), "CREATED", currentUser);

        return mapToResponse(saved);
    }

    public List<CommentResponse> getTaskComments(Long taskId, User currentUser) {
        Task task = taskDao.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        checkTaskAccess(task, currentUser);

        List<Comment> comments = commentDao.findTopLevelCommentsByTaskId(taskId);
        
        return comments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CommentResponse updateComment(Long commentId, CommentRequest request, User currentUser) {
        Comment comment = commentDao.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (!comment.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only edit your own comments");
        }

        comment.setContent(request.getContent());
        
        // ✅ Re-process mentions on update
        Task task = comment.getTask();
        List<Long> mentionedUserIds = processMentions(request.getContent(), currentUser, task);
        comment.setMentionedUserIds(mentionedUserIds);
        
        Comment updated = commentDao.save(comment);

        auditLogService.log("Comment", commentId, "UPDATED", currentUser);

        return mapToResponse(updated);
    }

    @Transactional
    public void deleteComment(Long commentId, User currentUser) {
        Comment comment = commentDao.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (!comment.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only delete your own comments");
        }

        commentDao.delete(comment);

        auditLogService.log("Comment", commentId, "DELETED", currentUser);
    }

    public long getCommentCount(Long taskId) {
        return commentDao.countByTaskId(taskId);
    }

    private CommentResponse mapToResponse(Comment comment) {
        List<CommentResponse> replies = comment.getReplies().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .userId(comment.getUser().getId())
                .userName(comment.getUser().getFullName())
                .taskId(comment.getTask().getId())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .replies(replies)
                .build();
    }
}