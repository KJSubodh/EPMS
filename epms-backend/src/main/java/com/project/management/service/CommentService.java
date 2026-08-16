// service/CommentService.java
package com.project.management.service;

import com.project.management.dao.CommentDao;
import com.project.management.dao.TaskDao;
import com.project.management.dao.UserDao;
import com.project.management.model.Comment;
import com.project.management.model.Task;
import com.project.management.model.User;
import com.project.management.dto.request.CommentRequest;
import com.project.management.dto.response.CommentResponse;
import com.project.management.exception.ResourceNotFoundException;
import com.project.management.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentDao commentDao;
    private final TaskDao taskDao;
    private final UserDao userDao;
    private final NotificationService notificationService;

    @Transactional
    public CommentResponse createComment(Long taskId, CommentRequest request, User currentUser) {
        Task task = taskDao.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

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

        Comment saved = commentDao.save(comment);

        // 🔔 Send notification to task assignee (if not the commenter)
        if (task.getAssignedTo() != null && !task.getAssignedTo().getId().equals(currentUser.getId())) {
            String message = String.format("%s commented on task: %s", currentUser.getFullName(), task.getTitle());
            notificationService.createTaskNotification(task.getAssignedTo(), task, message);
        }

        // 🔔 Send notification to task creator (if different from assignee and commenter)
        if (task.getCreatedBy() != null && 
            !task.getCreatedBy().getId().equals(currentUser.getId()) &&
            (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(task.getCreatedBy().getId()))) {
            String message = String.format("%s commented on task: %s", currentUser.getFullName(), task.getTitle());
            notificationService.createTaskNotification(task.getCreatedBy(), task, message);
        }

        // 🔔 If reply, notify parent comment author
        if (parent != null && !parent.getUser().getId().equals(currentUser.getId())) {
            String message = String.format("%s replied to your comment on task: %s", 
                    currentUser.getFullName(), task.getTitle());
            notificationService.createTaskNotification(parent.getUser(), task, message);
        }

        return mapToResponse(saved);
    }

    public List<CommentResponse> getTaskComments(Long taskId, User currentUser) {
        Task task = taskDao.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

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
        Comment updated = commentDao.save(comment);

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