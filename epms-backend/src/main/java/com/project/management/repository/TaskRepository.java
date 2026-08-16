// repository/TaskRepository.java
package com.project.management.repository;

import com.project.management.model.Task;
import com.project.management.enums.TaskPriority;
import com.project.management.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {
    
    List<Task> findByProjectId(Long projectId);
    
    List<Task> findByProjectIdOrderByBoardPositionAsc(Long projectId);
    
    List<Task> findByProjectIdAndStatusOrderByBoardPositionAsc(Long projectId, TaskStatus status);
    
    List<Task> findByAssignedToId(Long userId);
    
    List<Task> findByProjectIdAndAssignedToId(Long projectId, Long userId);
    
    List<Task> findByStatus(TaskStatus status);
    
    List<Task> findByPriority(TaskPriority priority);
    
    // ✅ ADD THIS METHOD
    List<Task> findByDueDate(LocalDate dueDate);
    
    @Query("SELECT t FROM Task t WHERE t.dueDate < :date AND t.status != 'DONE'")
    List<Task> findOverdueTasks(@Param("date") LocalDate date);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId")
    Long countByProjectId(@Param("projectId") Long projectId);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId AND t.status = 'DONE'")
    Long countCompletedByProjectId(@Param("projectId") Long projectId);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.project.id = :projectId AND t.status IN ('TODO', 'IN_PROGRESS', 'REVIEW')")
    Long countPendingByProjectId(@Param("projectId") Long projectId);
    
    @Query("SELECT t FROM Task t WHERE t.assignedTo.id = :userId AND t.dueDate BETWEEN :startDate AND :endDate")
    List<Task> findTasksByUserAndDateRange(@Param("userId") Long userId, 
                                          @Param("startDate") LocalDate startDate,
                                          @Param("endDate") LocalDate endDate);
    
    @Modifying
    @Query("UPDATE Task t SET t.boardPosition = :position WHERE t.id = :taskId")
    void updateBoardPosition(@Param("taskId") Long taskId, @Param("position") Integer position);
}