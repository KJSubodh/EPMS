package com.project.management.service;

import com.project.management.dao.ProjectDao;
import com.project.management.dao.UserDao;
import com.project.management.dao.ProjectMemberDao;
import com.project.management.model.Project;
import com.project.management.model.User;
import com.project.management.model.ProjectMember;
import com.project.management.enums.ProjectStatus;
import com.project.management.enums.Role;
import com.project.management.dto.request.ProjectRequest;
import com.project.management.dto.response.ProjectResponse;
import com.project.management.dto.response.DashboardStatsResponse;
import com.project.management.exception.UnauthorizedException;
import com.project.management.exception.ResourceNotFoundException;
import com.project.management.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectDao projectDao;
    private final UserDao userDao;
    private final ProjectMemberDao projectMemberDao;
    private final NotificationService notificationService;
    private final AuditService auditService;

    /**
     * CREATE PROJECT - Only Admin can create projects
     */
    @Transactional
    public ProjectResponse createProject(ProjectRequest request, User currentUser) {
        // ✅ AUTHORIZATION: Only Admin can create projects
        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only Admins can create projects");
        }

        // ✅ BUSINESS RULE: Start date cannot be in the past, end date cannot precede start date
        if (request.getStartDate().isBefore(LocalDate.now())) {
            throw new BusinessException("Start date cannot be in the past");
        }
        if (request.getEndDate() != null && request.getEndDate().isBefore(request.getStartDate())) {
            throw new BusinessException("End date cannot be before start date");
        }

        Project project = Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .status(request.getStatus())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .createdBy(currentUser)
                .build();

        Project savedProject = projectDao.save(project);

        // Add creator as PROJECT_LEAD
        ProjectMember member = ProjectMember.builder()
                .project(savedProject)
                .user(currentUser)
                .role(ProjectMember.Role.PROJECT_LEAD)
                .build();
        projectMemberDao.save(member);

        notificationService.createProjectNotification(
            currentUser,
            savedProject,
            "Project created: " + savedProject.getName()
        );

        auditService.logAction("Project", savedProject.getId(), "CREATED", currentUser);

        return mapToResponse(savedProject);
    }

    /**
     * GET PROJECTS - Employees only see projects they are assigned to
     */
    public List<ProjectResponse> getProjectsForUser(User currentUser) {
        List<Project> projects;

        if (currentUser.getRole() == Role.ADMIN) {
            // ✅ Admin sees all projects
            projects = projectDao.findAll();
        } else if (currentUser.getRole() == Role.PROJECT_MANAGER) {
            // ✅ Project Manager sees projects they created OR are members of
            List<Project> created = projectDao.findByCreatedById(currentUser.getId());
            List<Project> memberOf = projectDao.findProjectsByMemberId(currentUser.getId());
            projects = created.stream()
                    .filter(p -> !memberOf.contains(p))
                    .collect(Collectors.toList());
            projects.addAll(memberOf);
        } else {
            // ✅ Employees only see projects they are assigned to
            projects = projectDao.findProjectsByMemberId(currentUser.getId());
        }

        return projects.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * GET PROJECT BY ID - Employees can only view projects they are assigned to
     */
    public ProjectResponse getProjectById(Long id, User currentUser) {
        Project project = projectDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // ✅ AUTHORIZATION: Check if user can view this project
        if (currentUser.getRole() == Role.EMPLOYEE) {
            boolean isMember = project.getMembers().stream()
                    .anyMatch(m -> m.getUser().getId().equals(currentUser.getId()));
            if (!isMember) {
                throw new UnauthorizedException("You are not assigned to this project");
            }
        }

        return mapToResponse(project);
    }

    /**
     * UPDATE PROJECT - Only Admin and Project Manager (own projects)
     */
    @Transactional
    public ProjectResponse updateProject(Long id, ProjectRequest request, User currentUser) {
        Project project = projectDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // ✅ AUTHORIZATION: Only Admin and Project Manager can update
        if (currentUser.getRole() == Role.EMPLOYEE) {
            throw new UnauthorizedException("Employees cannot update projects");
        }

        // ✅ Project Manager can only update their own projects
        if (currentUser.getRole() == Role.PROJECT_MANAGER) {
            boolean isCreator = project.getCreatedBy().getId().equals(currentUser.getId());
            boolean isLead = project.getMembers().stream()
                    .anyMatch(m -> m.getUser().getId().equals(currentUser.getId()) 
                            && m.getRole() == ProjectMember.Role.PROJECT_LEAD);
            if (!isCreator && !isLead) {
                throw new UnauthorizedException("You can only update projects you created or lead");
            }
        }

        // ✅ BUSINESS RULE: Cannot update completed projects
        if (project.getStatus() == ProjectStatus.COMPLETED) {
            throw new BusinessException("Completed projects cannot be updated");
        }

        // ✅ BUSINESS RULE: End date cannot precede start date.
        // (Past start dates are allowed here since the project may have
        // already started — only the create flow blocks past start dates.)
        if (request.getEndDate() != null && request.getEndDate().isBefore(request.getStartDate())) {
            throw new BusinessException("End date cannot be before start date");
        }

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStatus(request.getStatus());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());

        Project updated = projectDao.save(project);

        notificationService.createProjectNotification(
            currentUser,
            updated,
            "Project updated: " + updated.getName()
        );

        auditService.logAction("Project", id, "UPDATED", currentUser);

        return mapToResponse(updated);
    }

    /**
     * DELETE PROJECT - Only Admin can delete projects
     */
    @Transactional
    public void deleteProject(Long id, User currentUser) {
        Project project = projectDao.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // ✅ AUTHORIZATION: Only Admin can delete projects
        if (currentUser.getRole() != Role.ADMIN) {
            throw new UnauthorizedException("Only Admins can delete projects");
        }

        auditService.logAction("Project", id, "DELETED", currentUser);
        projectDao.delete(project);
    }

    /**
     * ADD MEMBER TO PROJECT - Admin and Project Manager (own projects)
     */
    @Transactional
    public ProjectResponse addMemberToProject(Long projectId, Long userId, ProjectMember.Role role, User currentUser) {
        Project project = projectDao.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // ✅ AUTHORIZATION: Check if user can add members
        if (currentUser.getRole() == Role.EMPLOYEE) {
            throw new UnauthorizedException("Employees cannot add members to projects");
        }

        if (currentUser.getRole() == Role.PROJECT_MANAGER) {
            boolean isCreator = project.getCreatedBy().getId().equals(currentUser.getId());
            boolean isLead = project.getMembers().stream()
                    .anyMatch(m -> m.getUser().getId().equals(currentUser.getId()) 
                            && m.getRole() == ProjectMember.Role.PROJECT_LEAD);
            if (!isCreator && !isLead) {
                throw new UnauthorizedException("You can only add members to projects you created or lead");
            }
        }

        User user = userDao.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (projectMemberDao.existsByProjectIdAndUserId(projectId, userId)) {
            throw new BusinessException("User already a member of this project");
        }

        ProjectMember member = ProjectMember.builder()
                .project(project)
                .user(user)
                .role(role)
                .build();
        projectMemberDao.save(member);

        notificationService.createProjectNotification(
            user,
            project,
            "You have been added to project: " + project.getName()
        );

        auditService.logAction("ProjectMember", projectId, "MEMBER_ADDED", currentUser);

        return mapToResponse(project);
    }

    /**
     * REMOVE MEMBER FROM PROJECT - Admin and Project Manager (own projects)
     */
    @Transactional
    public void removeMemberFromProject(Long projectId, Long userId, User currentUser) {
        Project project = projectDao.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        // ✅ AUTHORIZATION: Check if user can remove members
        if (currentUser.getRole() == Role.EMPLOYEE) {
            throw new UnauthorizedException("Employees cannot remove members from projects");
        }

        if (currentUser.getRole() == Role.PROJECT_MANAGER) {
            boolean isCreator = project.getCreatedBy().getId().equals(currentUser.getId());
            boolean isLead = project.getMembers().stream()
                    .anyMatch(m -> m.getUser().getId().equals(currentUser.getId()) 
                            && m.getRole() == ProjectMember.Role.PROJECT_LEAD);
            if (!isCreator && !isLead) {
                throw new UnauthorizedException("You can only remove members from projects you created or lead");
            }
        }

        // ✅ Cannot remove the creator/lead
        ProjectMember member = projectMemberDao.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found"));

        if (member.getRole() == ProjectMember.Role.PROJECT_LEAD) {
            throw new BusinessException("Cannot remove the project lead");
        }

        projectMemberDao.deleteByProjectIdAndUserId(projectId, userId);
        auditService.logAction("ProjectMember", projectId, "MEMBER_REMOVED", currentUser);
    }

    private ProjectResponse mapToResponse(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .createdBy(project.getCreatedBy().getFullName())
                .createdAt(project.getCreatedAt())
                .memberCount(project.getMembers() != null ? project.getMembers().size() : 0)
                .taskCount(project.getTasks() != null ? project.getTasks().size() : 0)
                .build();
    }
}