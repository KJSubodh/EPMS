package com.project.management.service;

import com.project.management.dao.NotificationDao;
import com.project.management.model.Notification;
import com.project.management.model.User;
import com.project.management.model.Task;
import com.project.management.model.Project;
import com.project.management.enums.NotificationType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationDao notificationDao;

    public Notification createNotification(User user, String message, NotificationType type, Task task) {
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .type(type)
                .task(task)
                .isRead(false)
                .build();
        return notificationDao.save(notification);
    }

    /**
     * Task-related notification with an explicit type. Use this for
     * TASK_ASSIGNED, TASK_UPDATED, or TASK_COMPLETED depending on what
     * actually happened to the task.
     */
    public Notification createTaskNotification(User user, Task task, String message, NotificationType type) {
        return createNotification(user, message, type, task);
    }

    /**
     * Convenience overload for the common "assigned" case, so existing call
     * sites that don't pass a type keep compiling and behave exactly as
     * before (previously this was the *only* option, hardcoded).
     */
    public Notification createTaskNotification(User user, Task task, String message) {
        return createTaskNotification(user, task, message, NotificationType.TASK_ASSIGNED);
    }

    /**
     * Project-related notification with an explicit type. Use this for
     * PROJECT_CREATED, PROJECT_UPDATED, or PROJECT_COMPLETED depending on
     * what actually happened to the project.
     */
    public Notification createProjectNotification(User user, Project project, String message, NotificationType type) {
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .type(type)
                .isRead(false)
                .build();
        return notificationDao.save(notification);
    }

    /**
     * Convenience overload for the common "created" case, preserves the
     * previous behavior for existing call sites.
     */
    public Notification createProjectNotification(User user, Project project, String message) {
        return createProjectNotification(user, project, message, NotificationType.PROJECT_CREATED);
    }

    /**
     * Member added to a project. Previously there was no call site that
     * could ever produce NotificationType.MEMBER_ADDED even though the
     * frontend has an icon/color ready for it.
     */
    public Notification createMemberAddedNotification(User user, Project project, String message) {
        return createProjectNotification(user, project, message, NotificationType.MEMBER_ADDED);
    }

    /**
     * Member removed from a project. Same situation as above for
     * NotificationType.MEMBER_REMOVED.
     */
    public Notification createMemberRemovedNotification(User user, Project project, String message) {
        return createProjectNotification(user, project, message, NotificationType.MEMBER_REMOVED);
    }

    public List<Notification> getNotificationsByUser(Long userId) {
        return notificationDao.findByUserId(userId);
    }

    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationDao.findByUserIdAndIsReadFalse(userId);
    }

    public Long getUnreadCount(Long userId) {
        return notificationDao.countUnreadByUserId(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationDao.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        notificationDao.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationDao.markAllAsRead(userId);
    }

    @Transactional
    public void deleteNotification(Long notificationId) {
        notificationDao.deleteById(notificationId);
    }
}