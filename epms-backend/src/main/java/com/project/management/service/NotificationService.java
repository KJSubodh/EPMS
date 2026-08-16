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

    public void createTaskNotification(User user, Task task, String message) {
        createNotification(user, message, NotificationType.TASK_ASSIGNED, task);
    }

    public void createProjectNotification(User user, Project project, String message) {
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .type(NotificationType.PROJECT_CREATED)
                .isRead(false)
                .build();
        notificationDao.save(notification);
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