package com.project.management.service;

import com.project.management.dao.UserDao;
import com.project.management.dto.request.UpdateUserRequest;
import com.project.management.model.User;
import com.project.management.enums.Role;
import com.project.management.exception.ResourceNotFoundException;
import com.project.management.exception.UnauthorizedException;
import com.project.management.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService { // ✅ Implements UserDetailsService

    private final UserDao userDao;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userDao.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    public User getUserById(Long id) {
        return userDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public User getUserByEmail(String email) {
        return userDao.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public List<User> getAllUsers() {
        return userDao.findAll();
    }

    public List<User> getEmployees() {
        return userDao.findByRole(Role.EMPLOYEE);
    }

    public List<User> getActiveEmployees() {
        return userDao.findActiveEmployees();
    }

    public List<User> getUsersByRole(Role role) {
        return userDao.findByRole(role);
    }

    public boolean existsByEmail(String email) {
        return userDao.existsByEmail(email);
    }

    public long getEmployeeCount() {
        return userDao.countEmployees();
    }

    @Transactional
    public User updateUser(Long id, UpdateUserRequest request, User currentUser) {
        User user = getUserById(id);

        if (!currentUser.getRole().equals(Role.ADMIN) && !currentUser.getId().equals(id)) {
            throw new UnauthorizedException("You can only update your own profile");
        }

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userDao.existsByEmail(request.getEmail())) {
                // Was a generic RuntimeException, which typically maps to a
                // 500 in the default exception handler instead of a clean
                // 400 - BusinessException matches the convention used
                // everywhere else in the codebase for validation failures.
                throw new BusinessException("Email already in use by another user");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }

        if (request.getProfileImage() != null) {
            user.setProfileImage(request.getProfileImage());
        }

        // Only admins can set department, designation, or role
        if (currentUser.getRole().equals(Role.ADMIN)) {
            if (request.getDepartment() != null) {
                user.setDepartment(request.getDepartment());
            }
            if (request.getDesignation() != null) {
                user.setDesignation(request.getDesignation());
            }
            if (request.getRole() != null) {
                user.setRole(request.getRole());
            }
        }

        User saved = userDao.save(user);

        auditLogService.log("User", id, "UPDATED", currentUser);

        return saved;
    }

    @Transactional
    public User changePassword(Long id, String oldPassword, String newPassword, User currentUser) {
        User user = getUserById(id);

        if (!currentUser.getId().equals(id) && !currentUser.getRole().equals(Role.ADMIN)) {
            throw new UnauthorizedException("You can only change your own password");
        }

        // Verify old password (unless admin is resetting)
        if (!currentUser.getRole().equals(Role.ADMIN)) {
            if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
                throw new BusinessException("Current password is incorrect");
            }
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        User saved = userDao.save(user);

        // No password data goes into the audit log, just the fact that it changed.
        auditLogService.log("User", id, "PASSWORD_CHANGED", currentUser);

        return saved;
    }

    @Transactional
    public User changeUserRole(Long id, Role newRole, User currentUser) {
        User user = getUserById(id);

        if (currentUser.getId().equals(id)) {
            throw new UnauthorizedException("You cannot change your own role");
        }

        if (user.getRole().equals(Role.ADMIN) && !newRole.equals(Role.ADMIN)) {
            long adminCount = userDao.countByRole(Role.ADMIN);
            if (adminCount <= 1) {
                throw new UnauthorizedException("Cannot demote the last remaining admin");
            }
        }

        Role previousRole = user.getRole();
        user.setRole(newRole);
        User saved = userDao.save(user);

        // Uses the richer log(...) overload so the audit trail actually
        // shows what the role change was, not just that "something" changed.
        auditLogService.log(
                "User",
                id,
                "ROLE_CHANGED",
                Map.of("from", previousRole.name(), "to", newRole.name()),
                currentUser);

        return saved;
    }

    @Transactional
    public void activateUser(Long id, User currentUser) {
        if (currentUser.getId().equals(id)) {
            throw new UnauthorizedException("You cannot change your own status");
        }
        User user = getUserById(id);
        user.setIsActive(true);
        userDao.save(user);

        auditLogService.log("User", id, "ACTIVATED", currentUser);
    }

    @Transactional
    public void deactivateUser(Long id, User currentUser) {
        if (currentUser.getId().equals(id)) {
            throw new UnauthorizedException("You cannot change your own status");
        }
        User user = getUserById(id);
        user.setIsActive(false);
        userDao.save(user);

        auditLogService.log("User", id, "DEACTIVATED", currentUser);
    }

    /**
     * Kept for backward compatibility with existing callers - unaudited,
     * since there's no actor to attribute the deletion to. Prefer
     * deleteUser(id, currentUser) below wherever the caller has the actor
     * available, so account deletions actually show up in the audit trail.
     */
    @Transactional
    public void deleteUser(Long id) {
        User user = getUserById(id);
        userDao.delete(user);
    }

    @Transactional
    public void deleteUser(Long id, User currentUser) {
        User user = getUserById(id);
        userDao.delete(user);

        auditLogService.log("User", id, "DELETED", currentUser);
    }

    public boolean isUserActive(Long id) {
        User user = getUserById(id);
        return user.getIsActive();
    }

    public List<User> searchUsers(String query) {
        if (query == null || query.isEmpty()) {
            return userDao.findAll();
        }
        return userDao.searchByQuery(query);
    }
}