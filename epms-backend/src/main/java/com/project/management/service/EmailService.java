// service/EmailService.java
package com.project.management.service;

import com.project.management.dao.UserDao; // ✅ Add this import
import com.project.management.model.Task;
import com.project.management.model.User;
import com.project.management.model.Comment;
import com.project.management.dto.request.EmailPreferencesRequest;
import com.project.management.dto.response.EmailPreferencesResponse;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final UserDao userDao; // ✅ Add this field

    @Value("${app.email.from}")
    private String fromEmail;

    @Value("${app.email.base-url}")
    private String baseUrl;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMMM dd, yyyy");

    /**
     * Send task assignment email
     */
    @Async
    public void sendTaskAssignmentEmail(User assignee, Task task) {
        if (!assignee.getEmailTaskAssignment()) {
            log.info("Email notifications disabled for user: {}", assignee.getEmail());
            return;
        }

        try {
            String subject = "🔔 Task Assigned: " + task.getTitle();

            Context context = new Context(Locale.ENGLISH);
            context.setVariable("userName", assignee.getFullName());
            context.setVariable("taskTitle", task.getTitle());
            context.setVariable("taskDescription", task.getDescription());
            context.setVariable("priority", task.getPriority());
            context.setVariable("status", task.getStatus());
            context.setVariable("dueDate", task.getDueDate().format(DATE_FORMATTER));
            context.setVariable("projectName", task.getProject().getName());
            context.setVariable("assignedBy", task.getCreatedBy().getFullName());
            context.setVariable("taskLink", baseUrl + "/tasks/" + task.getId());
            context.setVariable("year", LocalDate.now().getYear());

            String htmlContent = templateEngine.process("email/task-assignment", context);
            sendEmail(assignee.getEmail(), subject, htmlContent);

            log.info("Task assignment email sent to: {}", assignee.getEmail());
        } catch (Exception e) {
            log.error("Failed to send task assignment email to {}: {}", assignee.getEmail(), e.getMessage());
        }
    }

    /**
     * Send due date reminder email
     */
    @Async
    public void sendDueDateReminder(User assignee, Task task) {
        if (!assignee.getEmailDueReminders()) {
            return;
        }

        try {
            String subject = "⏰ Task Due Tomorrow: " + task.getTitle();

            Context context = new Context(Locale.ENGLISH);
            context.setVariable("userName", assignee.getFullName());
            context.setVariable("taskTitle", task.getTitle());
            context.setVariable("taskDescription", task.getDescription());
            context.setVariable("priority", task.getPriority());
            context.setVariable("status", task.getStatus());
            context.setVariable("dueDate", task.getDueDate().format(DATE_FORMATTER));
            context.setVariable("projectName", task.getProject().getName());
            context.setVariable("taskLink", baseUrl + "/tasks/" + task.getId());
            context.setVariable("year", LocalDate.now().getYear());

            String htmlContent = templateEngine.process("email/due-reminder", context);
            sendEmail(assignee.getEmail(), subject, htmlContent);

            log.info("Due date reminder sent to: {}", assignee.getEmail());
        } catch (Exception e) {
            log.error("Failed to send due date reminder to {}: {}", assignee.getEmail(), e.getMessage());
        }
    }

    /**
     * Send task completion email
     */
    @Async
    public void sendTaskCompletionEmail(Task task, User completedBy) {
        if (task.getCreatedBy() == null || !task.getCreatedBy().getEmailTaskCompletion()) {
            return;
        }

        try {
            String subject = "✅ Task Completed: " + task.getTitle();

            Context context = new Context(Locale.ENGLISH);
            context.setVariable("adminName", task.getCreatedBy().getFullName());
            context.setVariable("taskTitle", task.getTitle());
            context.setVariable("taskDescription", task.getDescription());
            context.setVariable("employeeName", completedBy.getFullName());
            context.setVariable("completedDate", LocalDate.now().format(DATE_FORMATTER));
            context.setVariable("taskLink", baseUrl + "/tasks/" + task.getId());
            context.setVariable("year", LocalDate.now().getYear());

            String htmlContent = templateEngine.process("email/task-completion", context);
            sendEmail(task.getCreatedBy().getEmail(), subject, htmlContent);

            log.info("Task completion email sent to: {}", task.getCreatedBy().getEmail());
        } catch (Exception e) {
            log.error("Failed to send task completion email: {}", e.getMessage());
        }
    }

    /**
     * Send daily digest email
     */
    @Async
    public void sendDailyDigest(User user, List<Task> tasks, List<Task> completedTasks, List<Task> overdueTasks) {
        if (!user.getEmailDailyDigest()) {
            return;
        }

        try {
            String subject = "📊 Daily Task Summary - " + LocalDate.now().format(DATE_FORMATTER);

            Context context = new Context(Locale.ENGLISH);
            context.setVariable("userName", user.getFullName());
            context.setVariable("date", LocalDate.now().format(DATE_FORMATTER));
            context.setVariable("totalTasks", tasks.size());
            context.setVariable("completedTasks", completedTasks.size());
            context.setVariable("overdueTasks", overdueTasks.size());
            context.setVariable("tasksDueToday", tasks.stream()
                    .filter(t -> t.getDueDate().equals(LocalDate.now()))
                    .count());
            context.setVariable("tasks", tasks.stream().limit(5).toList());
            context.setVariable("dashboardLink", baseUrl + "/dashboard");
            context.setVariable("year", LocalDate.now().getYear());

            String htmlContent = templateEngine.process("email/daily-digest", context);
            sendEmail(user.getEmail(), subject, htmlContent);

            log.info("Daily digest sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send daily digest to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    /**
     * Send comment notification email
     */
    @Async
    public void sendCommentNotificationEmail(User recipient, Comment comment, Task task) {
        if (!recipient.getEmailCommentNotifications()) {
            return;
        }

        try {
            String subject = "💬 New Comment on: " + task.getTitle();

            Context context = new Context(Locale.ENGLISH);
            context.setVariable("userName", recipient.getFullName());
            context.setVariable("commenterName", comment.getUser().getFullName());
            context.setVariable("taskTitle", task.getTitle());
            context.setVariable("commentContent", comment.getContent());
            context.setVariable("commentDate", comment.getCreatedAt().format(DATE_FORMATTER));
            context.setVariable("taskLink", baseUrl + "/tasks/" + task.getId());
            context.setVariable("year", LocalDate.now().getYear());

            String htmlContent = templateEngine.process("email/comment-notification", context);
            sendEmail(recipient.getEmail(), subject, htmlContent);

            log.info("Comment notification sent to: {}", recipient.getEmail());
        } catch (Exception e) {
            log.error("Failed to send comment notification to {}: {}", recipient.getEmail(), e.getMessage());
        }
    }

    /**
     * Generic email sender
     */
    private void sendEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }

    /**
     * Update email preferences
     */
    public EmailPreferencesResponse updatePreferences(Long userId, EmailPreferencesRequest request) {
        User user = userDao.findById(userId) // ✅ Now works because userDao is injected
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setEmailTaskAssignment(request.getTaskAssignment());
        user.setEmailDueReminders(request.getDueReminders());
        user.setEmailTaskCompletion(request.getTaskCompletion());
        user.setEmailDailyDigest(request.getDailyDigest());
        user.setEmailCommentNotifications(request.getCommentNotifications());

        userDao.save(user); // ✅ Now works

        return EmailPreferencesResponse.builder()
                .taskAssignment(user.getEmailTaskAssignment())
                .dueReminders(user.getEmailDueReminders())
                .taskCompletion(user.getEmailTaskCompletion())
                .dailyDigest(user.getEmailDailyDigest())
                .commentNotifications(user.getEmailCommentNotifications())
                .build();
    }

    /**
     * Get email preferences
     */
    public EmailPreferencesResponse getPreferences(Long userId) {
        User user = userDao.findById(userId) // ✅ Now works because userDao is injected
                .orElseThrow(() -> new RuntimeException("User not found"));

        return EmailPreferencesResponse.builder()
                .taskAssignment(user.getEmailTaskAssignment())
                .dueReminders(user.getEmailDueReminders())
                .taskCompletion(user.getEmailTaskCompletion())
                .dailyDigest(user.getEmailDailyDigest())
                .commentNotifications(user.getEmailCommentNotifications())
                .build();
    }

    // Add this method to EmailService.java

    /**
     * Send mention notification email
     */
    @Async
    public void sendMentionEmail(User mentionedUser, User mentionedBy, Task task, Comment comment) {
        if (!mentionedUser.getEmailCommentNotifications()) {
            return;
        }

        try {
            String subject = "🔔 You were mentioned in a comment on: " + task.getTitle();

            Context context = new Context(Locale.ENGLISH);
            context.setVariable("userName", mentionedUser.getFullName());
            context.setVariable("mentionerName", mentionedBy.getFullName());
            context.setVariable("taskTitle", task.getTitle());
            context.setVariable("taskDescription", task.getDescription());
            context.setVariable("commentContent", comment.getContent());
            context.setVariable("commentDate", comment.getCreatedAt().format(DATE_FORMATTER));
            context.setVariable("taskLink", baseUrl + "/tasks/" + task.getId());
            context.setVariable("year", LocalDate.now().getYear());

            String htmlContent = templateEngine.process("email/mention-notification", context);
            sendEmail(mentionedUser.getEmail(), subject, htmlContent);

            log.info("Mention email sent to: {}", mentionedUser.getEmail());
        } catch (Exception e) {
            log.error("Failed to send mention email to {}: {}", mentionedUser.getEmail(), e.getMessage());
        }
    }
}