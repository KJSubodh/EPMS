package com.project.management.repository;

import com.project.management.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    
    List<AuditLog> findByEntityTypeAndEntityIdOrderByPerformedAtDesc(String entityType, Long entityId);
    
    List<AuditLog> findByPerformedByIdOrderByPerformedAtDesc(Long userId);
    
    @Query("SELECT a FROM AuditLog a ORDER BY a.performedAt DESC LIMIT 20")
    List<AuditLog> findRecentAuditLogs();
}