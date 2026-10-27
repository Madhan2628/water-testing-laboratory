package com.wtlms.controller;

import com.wtlms.dto.ApiResponse;
import com.wtlms.dto.ReportReviewDto;
import com.wtlms.model.Report;
import com.wtlms.model.ReportStatus;
import com.wtlms.security.UserPrincipal;
import com.wtlms.service.PdfReportService;
import com.wtlms.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final PdfReportService pdfReportService;

    public ReportController(ReportService reportService, PdfReportService pdfReportService) {
        this.reportService = reportService;
        this.pdfReportService = pdfReportService;
    }

    @PostMapping("/generate/{sampleId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LABORATORY_STAFF')")
    public ResponseEntity<ApiResponse<Report>> generateReport(
            @PathVariable String sampleId,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Report report = reportService.generateReportForSample(sampleId, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Report generated successfully", report));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Report>>> getAllReports(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ReportStatus status,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<Report> reports = reportService.getAllReports(search, status, currentUser);
        return ResponseEntity.ok(ApiResponse.ok(reports));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Report>> getReportById(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Report report = reportService.getReportById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok(report));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadReportPdf(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        try {
            Report report = reportService.getReportById(id, currentUser);
            byte[] pdfBytes = pdfReportService.generateReportPdf(report);

            String filename = "WaterTestReport_" + report.getReportNumber() + ".pdf";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .contentLength(pdfBytes.length)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('ADMIN', 'LABORATORY_STAFF')")
    public ResponseEntity<ApiResponse<Report>> submitReportForApproval(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Report report = reportService.submitForApproval(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Report submitted for QA review", report));
    }

    @PostMapping("/{id}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Report>> reviewReport(
            @PathVariable String id,
            @Valid @RequestBody ReportReviewDto reviewDto,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Report report = reportService.reviewReport(id, reviewDto, currentUser);
        String action = "APPROVE".equalsIgnoreCase(reviewDto.getDecision()) ? "approved" : "rejected";
        return ResponseEntity.ok(ApiResponse.ok("Report successfully " + action, report));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Report>> approveReport(
            @PathVariable String id,
            @RequestBody(required = false) ReportReviewDto reviewDto,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        if (reviewDto == null) {
            reviewDto = new ReportReviewDto("APPROVE", "Approved by QA Administrator", "Quality Assurance Lead");
        } else {
            reviewDto.setDecision("APPROVE");
        }
        Report report = reportService.reviewReport(id, reviewDto, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Report successfully approved", report));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Report>> rejectReport(
            @PathVariable String id,
            @RequestBody(required = false) ReportReviewDto reviewDto,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        if (reviewDto == null) {
            reviewDto = new ReportReviewDto("REJECT", "Returned for correction by QA Administrator", "Quality Assurance Lead");
        } else {
            reviewDto.setDecision("REJECT");
        }
        Report report = reportService.reviewReport(id, reviewDto, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Report rejected and returned for correction", report));
    }
}
