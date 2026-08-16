package com.project.management.dao;

import com.project.management.model.ProjectMember;
import com.project.management.repository.ProjectMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ProjectMemberDao {

    private final ProjectMemberRepository projectMemberRepository;

    public ProjectMember save(ProjectMember member) {
        return projectMemberRepository.save(member);
    }

    public Optional<ProjectMember> findById(Long id) {
        return projectMemberRepository.findById(id);
    }

    public List<ProjectMember> findByProjectId(Long projectId) {
        return projectMemberRepository.findByProjectId(projectId);
    }

    public List<ProjectMember> findByUserId(Long userId) {
        return projectMemberRepository.findByUserId(userId);
    }

    public Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Long userId) {
        return projectMemberRepository.findByProjectIdAndUserId(projectId, userId);
    }

    public boolean existsByProjectIdAndUserId(Long projectId, Long userId) {
        return projectMemberRepository.existsByProjectIdAndUserId(projectId, userId);
    }

    public void deleteByProjectIdAndUserId(Long projectId, Long userId) {
        projectMemberRepository.deleteByProjectIdAndUserId(projectId, userId);
    }

    public void deleteById(Long id) {
        projectMemberRepository.deleteById(id);
    }

    public List<ProjectMember> findByProjectIdAndRole(Long projectId, ProjectMember.Role role) {
        return projectMemberRepository.findByProjectIdAndRole(projectId, role);
    }
}