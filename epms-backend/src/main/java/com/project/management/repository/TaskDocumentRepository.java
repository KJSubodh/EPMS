// repository/TaskDocumentRepository.java
package com.project.management.repository;

import com.project.management.model.TaskDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskDocumentRepository extends JpaRepository<TaskDocument, Long> {
    
    List<TaskDocument> findByTaskId(Long taskId);
    
    // ✅ ADD THIS METHOD
    List<TaskDocument> findByTaskIdOrderByCreatedAtDesc(Long taskId);
    
    @Modifying
    @Query("DELETE FROM TaskDocument d WHERE d.task.id = :taskId")
    void deleteByTaskId(@Param("taskId") Long taskId);
}