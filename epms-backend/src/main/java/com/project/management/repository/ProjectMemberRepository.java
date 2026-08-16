package com.project.management.repository;

import com.project.management.model.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    
    List<ProjectMember> findByProjectId(Long projectId);
    
    List<ProjectMember> findByUserId(Long userId);
    
    Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Long userId);
    
    boolean existsByProjectIdAndUserId(Long projectId, Long userId);
    
    void deleteByProjectIdAndUserId(Long projectId, Long userId);
    
    List<ProjectMember> findByProjectIdAndRole(Long projectId, ProjectMember.Role role);
}