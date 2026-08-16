// dto/response/EmailPreferencesResponse.java
package com.project.management.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EmailPreferencesResponse {
    private Boolean taskAssignment;
    private Boolean dueReminders;
    private Boolean taskCompletion;
    private Boolean dailyDigest;
    private Boolean commentNotifications;
}