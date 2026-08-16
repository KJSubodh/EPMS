package com.project.management.service;

import com.project.management.dao.UserDao;
import com.project.management.dto.request.UpdateUserRequest;
import com.project.management.model.User;
import com.project.management.enums.Role;
import com.project.management.exception.ResourceNotFoundException;
import com.project.management.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService { // ✅ Implements UserDetailsService

    private final UserDao userDao;
    private final PasswordEncoder passwordEncoder;

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
                throw new RuntimeException("Email already in use by another user");
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

        return userDao.save(user);
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
                throw new RuntimeException("Current password is incorrect");
            }
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        return userDao.save(user);
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

        user.setRole(newRole);
        return userDao.save(user);
    }

    @Transactional
    public void activateUser(Long id, User currentUser) {
        if (currentUser.getId().equals(id)) {
            throw new UnauthorizedException("You cannot change your own status");
        }
        User user = getUserById(id);
        user.setIsActive(true);
        userDao.save(user);
    }

    @Transactional
    public void deactivateUser(Long id, User currentUser) {
        if (currentUser.getId().equals(id)) {
            throw new UnauthorizedException("You cannot change your own status");
        }
        User user = getUserById(id);
        user.setIsActive(false);
        userDao.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = getUserById(id);
        userDao.delete(user);
    }

    public boolean isUserActive(Long id) {
        User user = getUserById(id);
        return user.getIsActive();
    }
}