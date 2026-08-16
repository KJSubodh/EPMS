package com.project.management.service;

import com.project.management.dao.AuditLogDao;
import com.project.management.model.AuditLog;
import com.project.management.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogDao auditLogDao;

    public void logAction(String entityType, Long entityId, String action, User performedBy) {
        AuditLog log = AuditLog.builder()
                .entityType(entityType)
                .entityId(entityId)
                .action(action)
                .performedBy(performedBy)
                .build();
        auditLogDao.save(log);
    }
}