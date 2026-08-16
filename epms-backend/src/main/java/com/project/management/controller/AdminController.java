package com.project.management.controller;

import com.project.management.dto.request.UpdateUserRequest;  // ← ADD THIS
import com.project.management.dto.response.UserResponse;
import com.project.management.enums.Role;
import com.project.management.model.User;
import com.project.management.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList()));
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<UserResponse> changeUserRole(
            @PathVariable Long id,
            @RequestParam Role role,
            @AuthenticationPrincipal User currentUser
    ) {
        User updated = userService.changeUserRole(id, role, currentUser);
        return ResponseEntity.ok(mapToResponse(updated));
    }

    @PatchMapping("/users/{id}/activate")
    public ResponseEntity<Void> activateUser(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        userService.activateUser(id, currentUser);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/users/{id}/deactivate")
    public ResponseEntity<Void> deactivateUser(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        userService.deactivateUser(id, currentUser);
        return ResponseEntity.ok().build();
    }

    // ← ADD THIS NEW ENDPOINT
    @PutMapping("/users/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        User updated = userService.updateUser(id, request, currentUser);
        return ResponseEntity.ok(mapToResponse(updated));
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .department(user.getDepartment())
                .designation(user.getDesignation())
                .isActive(user.getIsActive())
                .profileImage(user.getProfileImage())
                .createdAt(user.getCreatedAt())
                .build();
    }
}