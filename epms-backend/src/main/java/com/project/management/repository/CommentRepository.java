// repository/CommentRepository.java
package com.project.management.repository;

import com.project.management.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    List<Comment> findByTaskIdOrderByCreatedAtAsc(Long taskId);
    
    List<Comment> findByTaskIdAndParentIsNullOrderByCreatedAtAsc(Long taskId);
    
    @Query("SELECT c FROM Comment c WHERE c.task.id = :taskId AND c.parent IS NULL ORDER BY c.createdAt ASC")
    List<Comment> findTopLevelCommentsByTaskId(@Param("taskId") Long taskId);
    
    long countByTaskId(Long taskId);
}