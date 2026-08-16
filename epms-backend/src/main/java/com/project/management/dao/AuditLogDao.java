package com.project.management.dao;

import com.project.management.model.AuditLog;
import com.project.management.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class AuditLogDao {

    private final AuditLogRepository auditLogRepository;

    public AuditLog save(AuditLog auditLog) {
        return auditLogRepository.save(auditLog);
    }

    public Optional<AuditLog> findById(Long id) {
        return auditLogRepository.findById(id);
    }

    public List<AuditLog> findByEntityTypeAndEntityId(String entityType, Long entityId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByPerformedAtDesc(entityType, entityId);
    }

    public List<AuditLog> findRecentAuditLogs() {
        return auditLogRepository.findRecentAuditLogs();
    }

    public List<AuditLog> findByPerformedById(Long userId) {
        return auditLogRepository.findByPerformedByIdOrderByPerformedAtDesc(userId);
    }
}