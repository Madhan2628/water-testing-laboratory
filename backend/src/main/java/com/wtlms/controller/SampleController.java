package com.wtlms.controller;

import com.wtlms.dto.ApiResponse;
import com.wtlms.dto.SampleRequestDto;
import com.wtlms.dto.SampleStatusUpdateDto;
import com.wtlms.model.Sample;
import com.wtlms.model.SampleStatus;
import com.wtlms.security.UserPrincipal;
import com.wtlms.service.SampleService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/samples")
public class SampleController {

    private final SampleService sampleService;

    public SampleController(SampleService sampleService) {
        this.sampleService = sampleService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Sample>> createSample(
            @Valid @RequestBody SampleRequestDto requestDto,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Sample created = sampleService.createSample(requestDto, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Sample registered successfully", created));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Sample>>> getAllSamples(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String waterSource,
            @RequestParam(required = false) SampleStatus status,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<Sample> samples = sampleService.getAllSamples(search, waterSource, status, currentUser);
        return ResponseEntity.ok(ApiResponse.ok(samples));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Sample>> getSampleById(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Sample sample = sampleService.getSampleById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok(sample));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LABORATORY_STAFF')")
    public ResponseEntity<ApiResponse<Sample>> updateSample(
            @PathVariable String id,
            @RequestBody SampleRequestDto requestDto,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Sample updated = sampleService.updateSample(id, requestDto, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Sample updated successfully", updated));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'LABORATORY_STAFF')")
    public ResponseEntity<ApiResponse<Sample>> updateSampleStatus(
            @PathVariable String id,
            @Valid @RequestBody SampleStatusUpdateDto statusDto,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Sample updated = sampleService.updateSampleStatus(id, statusDto, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Sample status updated to " + updated.getStatus(), updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSample(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        sampleService.deleteSample(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Sample deleted successfully", null));
    }
}
