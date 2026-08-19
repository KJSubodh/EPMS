package com.project.management.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.management.dao.AuditLogDao;
import com.project.management.model.AuditLog;
import com.project.management.model.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class AuditLogService {

    private final AuditLogDao auditLogDao;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AuditLogService(AuditLogDao auditLogDao) {
        this.auditLogDao = auditLogDao;
    }

    /**
     * Full audit entry with a serialized "changes" payload (e.g. a diff of
     * before/after field values). Prefer this overload whenever you have
     * meaningful change data to record — it's what makes the audit trail
     * actually useful for "what changed", not just "what happened".
     */
    @Transactional
    public void log(String entityType, Long entityId, String action, Object changes, User performedBy) {
        String changesJson = null;
        if (changes != null) {
            try {
                changesJson = objectMapper.writeValueAsString(changes);
            } catch (JsonProcessingException e) {
                log.error("Failed to serialize audit changes for {} {}", entityType, entityId, e);
            }
        }

        AuditLog entry = AuditLog.builder()
                .entityType(entityType)
                .entityId(entityId)
                .action(action)
                .changes(changesJson)
                .performedBy(performedBy)
                .build();
        auditLogDao.save(entry);
    }

    /**
     * Lightweight audit entry with no change payload. Same parameter order
     * as the old AuditService.logAction(...), so existing call sites can
     * switch over by renaming the bean/method — see migration note below.
     */
    @Transactional
    public void log(String entityType, Long entityId, String action, User performedBy) {
        log(entityType, entityId, action, null, performedBy);
    }
}