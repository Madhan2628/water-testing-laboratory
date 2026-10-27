package com.wtlms.controller;

import com.wtlms.dto.ApiResponse;
import com.wtlms.dto.BatchResultDto;
import com.wtlms.dto.ResultEntryDto;
import com.wtlms.model.TestResult;
import com.wtlms.security.UserPrincipal;
import com.wtlms.service.TestResultService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/results")
public class TestResultController {

    private final TestResultService testResultService;

    public TestResultController(TestResultService testResultService) {
        this.testResultService = testResultService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LABORATORY_STAFF')")
    public ResponseEntity<ApiResponse<TestResult>> recordSingleResult(
            @RequestParam String sampleId,
            @Valid @RequestBody ResultEntryDto entryDto,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        TestResult saved = testResultService.recordSingleResult(sampleId, entryDto, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Test result recorded and evaluated", saved));
    }

    @PostMapping("/batch")
    @PreAuthorize("hasAnyRole('ADMIN', 'LABORATORY_STAFF')")
    public ResponseEntity<ApiResponse<List<TestResult>>> batchSaveResults(
            @Valid @RequestBody BatchResultDto batchDto,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<TestResult> results = testResultService.batchSaveResults(batchDto, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Batch results saved successfully (" + results.size() + " parameters)", results));
    }

    @GetMapping("/sample/{sampleId}")
    public ResponseEntity<ApiResponse<List<TestResult>>> getResultsForSample(
            @PathVariable String sampleId) {
        List<TestResult> results = testResultService.getResultsBySampleId(sampleId);
        return ResponseEntity.ok(ApiResponse.ok(results));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LABORATORY_STAFF')")
    public ResponseEntity<ApiResponse<Void>> deleteResult(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        testResultService.deleteResult(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Test result deleted successfully", null));
    }
}
