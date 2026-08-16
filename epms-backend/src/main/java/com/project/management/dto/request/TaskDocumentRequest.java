// dto/request/TaskDocumentRequest.java
package com.project.management.dto.request;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class TaskDocumentRequest {
    private MultipartFile file;
}