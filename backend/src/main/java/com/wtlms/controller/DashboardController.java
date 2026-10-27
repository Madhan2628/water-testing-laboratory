package com.wtlms.controller;

import com.wtlms.dto.ApiResponse;
import com.wtlms.dto.DashboardStatsDto;
import com.wtlms.model.Sample;
import com.wtlms.security.UserPrincipal;
import com.wtlms.service.DashboardService;
import com.wtlms.service.SampleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final SampleService sampleService;

    public DashboardController(DashboardService dashboardService, SampleService sampleService) {
        this.dashboardService = dashboardService;
        this.sampleService = sampleService;
    }

    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getStatistics(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        DashboardStatsDto stats = dashboardService.getDashboardStatistics(currentUser);
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/recent-samples")
    public ResponseEntity<ApiResponse<List<Sample>>> getRecentSamples(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<Sample> samples = sampleService.getAllSamples(null, null, null, currentUser);
        List<Sample> top = samples.stream().limit(10).toList();
        return ResponseEntity.ok(ApiResponse.ok(top));
    }
}
