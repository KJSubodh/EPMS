package com.project.management.controller;

import com.project.management.dto.response.analytics.*;
import com.project.management.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard-summary")
    public ResponseEntity<DashboardSummaryDTO> getDashboardSummary() {
        return ResponseEntity.ok(analyticsService.getDashboardSummary());
    }

    @GetMapping("/project-status")
    public ResponseEntity<List<ProjectStatusDTO>> getProjectStatus() {
        return ResponseEntity.ok(analyticsService.getProjectStatusDistribution());
    }

    @GetMapping("/task-trend")
    public ResponseEntity<List<TaskTrendDTO>> getTaskTrend() {
        return ResponseEntity.ok(analyticsService.getTaskTrend());
    }

    @GetMapping("/team-performance")
    public ResponseEntity<List<TeamPerformanceDTO>> getTeamPerformance() {
        return ResponseEntity.ok(analyticsService.getTeamPerformance());
    }

    @GetMapping("/priority-distribution")
    public ResponseEntity<List<PriorityDistributionDTO>> getPriorityDistribution() {
        return ResponseEntity.ok(analyticsService.getPriorityDistribution());
    }

    @GetMapping("/user-activity")
    public ResponseEntity<Map<String, Long>> getUserActivity() {
        return ResponseEntity.ok(analyticsService.getUserActivity());
    }
}