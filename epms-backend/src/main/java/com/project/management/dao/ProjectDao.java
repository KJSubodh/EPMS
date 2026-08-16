package com.project.management.dao;

import com.project.management.model.Project;
import com.project.management.enums.ProjectStatus;
import com.project.management.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ProjectDao {

    private final ProjectRepository projectRepository;

    public Project save(Project project) {
        return projectRepository.save(project);
    }

    public Optional<Project> findById(Long id) {
        return projectRepository.findById(id);
    }

    public List<Project> findAll() {
        return projectRepository.findAll();
    }

    // ✅ Now works with ProjectStatus enum
    public List<Project> findByStatus(ProjectStatus status) {
        return projectRepository.findByStatus(status);
    }

    // ✅ Now works
    public List<Project> findByCreatedById(Long userId) {
        return projectRepository.findByCreatedById(userId);
    }

    // ✅ Now works
    public List<Project> findActiveProjectsOnDate(LocalDate date) {
        return projectRepository.findActiveProjectsOnDate(date);
    }

    // ✅ Now works
    public List<Project> findOverdueProjects(LocalDate date) {
        return projectRepository.findOverdueProjects(date);
    }

    // ✅ Now works
    public List<Project> findProjectsByMemberId(Long userId) {
        return projectRepository.findProjectsByMemberId(userId);
    }

    // ✅ Now works
    public Long countByStatus(ProjectStatus status) {
        return projectRepository.countByStatus(status);
    }

    public void deleteById(Long id) {
        projectRepository.deleteById(id);
    }

    public void delete(Project project) {
        projectRepository.delete(project);
    }

    public boolean existsById(Long id) {
        return projectRepository.existsById(id);
    }
}