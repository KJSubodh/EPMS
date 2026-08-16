// service/ScheduledEmailService.java
package com.project.management.service;

import com.project.management.dao.TaskDao;
import com.project.management.dao.UserDao;
import com.project.management.model.Task;
import com.project.management.model.User;
import com.project.management.enums.Role;
import com.project.management.enums.TaskStatus;  // ✅ ADD THIS IMPORT
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScheduledEmailService {

    private final TaskDao taskDao;
    private final UserDao userDao;
    private final EmailService emailService;

    /**
     * Send due date reminders - Runs daily at 9:00 AM
     */
    @Scheduled(cron = "0 0 9 * * *")
    public void sendDueDateReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<Task> tasksDueTomorrow = taskDao.findByDueDate(tomorrow);
        
        int remindersSent = 0;
        for (Task task : tasksDueTomorrow) {
            if (task.getAssignedTo() != null && task.getStatus() != TaskStatus.DONE) {
                emailService.sendDueDateReminder(task.getAssignedTo(), task);
                remindersSent++;
            }
        }
        
        log.info("Sent {} due date reminders for tasks due tomorrow", remindersSent);
    }

    /**
     * Send daily digest - Runs daily at 6:00 PM
     */
    @Scheduled(cron = "0 0 18 * * *")
    public void sendDailyDigest() {
        List<User> employees = userDao.findByRole(Role.EMPLOYEE);
        
        int digestsSent = 0;
        for (User employee : employees) {
            List<Task> allTasks = taskDao.findByAssignedToId(employee.getId());
            List<Task> completedTasks = allTasks.stream()
                    .filter(t -> t.getStatus() == TaskStatus.DONE)
                    .collect(Collectors.toList());
            List<Task> overdueTasks = allTasks.stream()
                    .filter(t -> t.getStatus() != TaskStatus.DONE && t.getDueDate().isBefore(LocalDate.now()))
                    .collect(Collectors.toList());
            
            if (!allTasks.isEmpty()) {
                emailService.sendDailyDigest(employee, allTasks, completedTasks, overdueTasks);
                digestsSent++;
            }
        }
        
        log.info("Sent {} daily digests to employees", digestsSent);
    }
}