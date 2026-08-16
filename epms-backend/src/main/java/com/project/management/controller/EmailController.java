// controller/EmailController.java
package com.project.management.controller;

import com.project.management.dto.request.EmailPreferencesRequest;
import com.project.management.dto.response.EmailPreferencesResponse;
import com.project.management.model.User;
import com.project.management.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/email")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;

    @GetMapping("/preferences")
    public ResponseEntity<EmailPreferencesResponse> getPreferences(
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(emailService.getPreferences(currentUser.getId()));
    }

    @PutMapping("/preferences")
    public ResponseEntity<EmailPreferencesResponse> updatePreferences(
            @AuthenticationPrincipal User currentUser,
            @RequestBody EmailPreferencesRequest request) {
        return ResponseEntity.ok(emailService.updatePreferences(currentUser.getId(), request));
    }
}