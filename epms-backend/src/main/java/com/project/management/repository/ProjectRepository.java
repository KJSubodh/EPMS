// repository/ProjectRepository.java
package com.project.management.repository;

import com.project.management.model.Project;
import com.project.management.model.User;
import com.project.management.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long>, JpaSpecificationExecutor<Project> {
    
    Optional<Project> findByName(String name);
    
    // ✅ Fix: Use ProjectStatus enum type
    List<Project> findByStatus(ProjectStatus status);
    
    // ✅ Add missing method: findByCreatedById
    List<Project> findByCreatedById(Long userId);
    
    // ✅ Add missing method: findActiveProjectsOnDate
    @Query("SELECT p FROM Project p WHERE p.startDate <= :date AND p.endDate >= :date")
    List<Project> findActiveProjectsOnDate(@Param("date") LocalDate date);
    
    // ✅ Add missing method: findOverdueProjects
    @Query("SELECT p FROM Project p WHERE p.endDate < :date AND p.status != 'COMPLETED'")
    List<Project> findOverdueProjects(@Param("date") LocalDate date);
    
    // ✅ Add missing method: findProjectsByMemberId
    @Query("SELECT p FROM Project p JOIN p.members m WHERE m.user.id = :userId")
    List<Project> findProjectsByMemberId(@Param("userId") Long userId);
    
    // ✅ Add missing method: countByStatus
    long countByStatus(ProjectStatus status);
    
    // ✅ Additional useful methods
    @Query("SELECT p FROM Project p JOIN p.members m WHERE m.user = :user")
    List<Project> findProjectsByMember(@Param("user") User user);
    
    @Query("SELECT COUNT(p) FROM Project p WHERE p.status = 'ACTIVE'")
    Long countActiveProjects();
    
    @Query("SELECT COUNT(p) FROM Project p WHERE p.status = 'COMPLETED'")
    Long countCompletedProjects();
}