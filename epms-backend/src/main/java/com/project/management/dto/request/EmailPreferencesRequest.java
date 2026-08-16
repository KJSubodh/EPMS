// dto/request/EmailPreferencesRequest.java
package com.project.management.dto.request;

import lombok.Data;

@Data
public class EmailPreferencesRequest {
    private Boolean taskAssignment = true;
    private Boolean dueReminders = true;
    private Boolean taskCompletion = true;
    private Boolean dailyDigest = false;
    private Boolean commentNotifications = true;
}