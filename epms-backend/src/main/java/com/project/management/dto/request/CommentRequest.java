// dto/request/CommentRequest.java
package com.project.management.dto.request;

import lombok.Data;

@Data
public class CommentRequest {
    private String content;
    private Long parentId; // For replies
}