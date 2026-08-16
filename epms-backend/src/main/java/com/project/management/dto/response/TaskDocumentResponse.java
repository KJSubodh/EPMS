// dto/response/TaskDocumentResponse.java
package com.project.management.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class TaskDocumentResponse {
    private Long id;
    private String fileName;
    private String filePath;
    private String fileType;
    private Long fileSize;
    private String formattedSize;
    private Long taskId;
    private String uploadedBy;
    private String uploadedByName;
    private LocalDateTime uploadedAt;
    private boolean isImage;
}