package com.wtlms.service;

import com.wtlms.dto.ReportReviewDto;
import com.wtlms.exception.BadRequestException;
import com.wtlms.exception.ResourceNotFoundException;
import com.wtlms.model.*;
import com.wtlms.repository.AuditLogRepository;
import com.wtlms.repository.ReportRepository;
import com.wtlms.repository.SampleRepository;
import com.wtlms.repository.TestResultRepository;
import com.wtlms.security.UserPrincipal;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final SampleRepository sampleRepository;
    private final TestResultRepository testResultRepository;
    private final AuditLogRepository auditLogRepository;

    public ReportService(ReportRepository reportRepository,
                         SampleRepository sampleRepository,
                         TestResultRepository testResultRepository,
                         AuditLogRepository auditLogRepository) {
        this.reportRepository = reportRepository;
        this.sampleRepository = sampleRepository;
        this.testResultRepository = testResultRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public synchronized String generateNextReportNumber() {
        int currentYear = Year.now().getValue();
        String prefix = "REP-" + currentYear + "-";
        long count = reportRepository.count() + 1;
        String repStr = prefix + String.format("%04d", count);
        while (reportRepository.existsByReportNumber(repStr)) {
            count++;
            repStr = prefix + String.format("%04d", count);
        }
        return repStr;
    }

    public Report generateReportForSample(String sampleId, UserPrincipal currentUser) {
        Sample sample = sampleRepository.findBySampleId(sampleId)
                .or(() -> sampleRepository.findById(sampleId))
                .orElseThrow(() -> new ResourceNotFoundException("Sample not found: " + sampleId));

        List<TestResult> results = testResultRepository.findBySampleId(sample.getSampleId());
        if (results.isEmpty()) {
            throw new BadRequestException("Cannot generate report: No test results recorded yet for sample " + sample.getSampleId());
        }

        // Look for existing report for this sample or create new
        Optional<Report> existingOpt = reportRepository.findBySampleId(sample.getSampleId());
        Report report = existingOpt.orElseGet(Report::new);

        if (report.getReportNumber() == null) {
            report.setReportNumber(generateNextReportNumber());
            report.setStatus(ReportStatus.DRAFT);
        } else if (report.getStatus() == ReportStatus.APPROVED) {
            // Version increment for revision
            report.setVersion(report.getVersion() + 1);
            report.setStatus(ReportStatus.DRAFT);
        }

        report.setSampleId(sample.getSampleId());
        report.setSampleRefId(sample.getId());
        report.setCustomerId(sample.getCustomerId());
        report.setCustomerName(sample.getCustomerName());
        report.setCustomerEmail(sample.getCustomerEmail());
        report.setCustomerPhone(sample.getCustomerPhone());
        report.setCollectionLocation(sample.getCollectionLocation());
        report.setWaterSource(sample.getWaterSource());
        report.setSampleType(sample.getSampleType());
        report.setSampleCondition(sample.getSampleCondition());
        report.setCollectionDate(sample.getCollectionDateTime());
        report.setReceivedDate(sample.getSampleReceivedDate());
        report.setTestingCompletedDate(LocalDateTime.now());
        report.setPreparedBy(currentUser.getFullName() != null ? currentUser.getFullName() : currentUser.getUsername());
        report.setPreparedById(currentUser.getId());
        report.setPreparedDate(LocalDateTime.now());

        // Snapshot parameters
        List<TestResultSnapshot> snapshots = new ArrayList<>();
        int passed = 0;
        int failed = 0;
        List<String> failedNames = new ArrayList<>();

        for (TestResult tr : results) {
            TestResultSnapshot snap = new TestResultSnapshot(
                    tr.getParameterName(),
                    tr.getCategory(),
                    tr.getMeasuredValue(),
                    tr.getUnit(),
                    tr.getReferenceLimitDisplay(),
                    tr.getReferenceStandard(),
                    tr.getTestMethod(),
                    tr.getComplianceStatus(),
                    tr.getInterpretation(),
                    tr.getLaboratoryRemarks()
            );
            snapshots.add(snap);

            if ("COMPLIANT".equalsIgnoreCase(tr.getComplianceStatus())) {
                passed++;
            } else if ("NON_COMPLIANT".equalsIgnoreCase(tr.getComplianceStatus())) {
                failed++;
                failedNames.add(tr.getParameterName());
            }
        }

        int total = snapshots.size();
        double compliancePct = total > 0 ? Math.round(((double) passed / total) * 1000.0) / 10.0 : 0.0;

        report.setParametersSnapshot(snapshots);
        report.setTotalParameters(total);
        report.setPassedParameters(passed);
        report.setFailedParameters(failed);
        report.setCompliancePercentage(compliancePct);

        if (failed == 0) {
            report.setOverallAssessment("COMPLIANT");
            report.setAssessmentSummary(String.format(
                    "All %d tested parameters comply with the permissible requirements of IS 10500:2012 for %s. Water meets tested drinking quality criteria.",
                    total, sample.getWaterSource()));
        } else {
            report.setOverallAssessment("NON_COMPLIANT");
            report.setAssessmentSummary(String.format(
                    "Non-compliant with standard limits. %d of %d parameters failed permissible thresholds: %s. Action and remedial purification recommended before use.",
                    failed, total, String.join(", ", failedNames)));
        }

        report.getAuditTrail().add(new ReportAuditItem(
                "GENERATED",
                currentUser.getUsername(),
                currentUser.getFullName(),
                currentUser.getAuthorities().iterator().next().getAuthority(),
                "Generated laboratory report with " + total + " parameters (" + passed + " passed, " + failed + " failed)"
        ));

        Report saved = reportRepository.save(report);

        auditLogRepository.save(new AuditLog(
                "GENERATE_REPORT",
                currentUser.getUsername(),
                currentUser.getAuthorities().iterator().next().getAuthority(),
                "Report",
                saved.getReportNumber(),
                "Generated report " + saved.getReportNumber() + " for sample " + sample.getSampleId()
        ));

        return saved;
    }

    public Report submitForApproval(String reportId, UserPrincipal currentUser) {
        Report report = reportRepository.findById(reportId)
                .or(() -> reportRepository.findByReportNumber(reportId))
                .orElseThrow(() -> new ResourceNotFoundException("Report not found: " + reportId));

        report.setStatus(ReportStatus.PENDING_APPROVAL);
        report.setUpdatedAt(LocalDateTime.now());
        report.getAuditTrail().add(new ReportAuditItem(
                "SUBMITTED",
                currentUser.getUsername(),
                currentUser.getFullName(),
                currentUser.getAuthorities().iterator().next().getAuthority(),
                "Submitted report for QA review and authorized approval"
        ));

        // Update corresponding sample status
        sampleRepository.findBySampleId(report.getSampleId()).ifPresent(s -> {
            s.setStatus(SampleStatus.REPORT_PENDING_APPROVAL);
            s.getStatusHistory().add(new StatusHistoryItem(
                    SampleStatus.REPORT_PENDING_APPROVAL,
                    currentUser.getUsername(),
                    "Draft report " + report.getReportNumber() + " submitted for approval"
            ));
            sampleRepository.save(s);
        });

        return reportRepository.save(report);
    }

    public Report reviewReport(String reportId, ReportReviewDto dto, UserPrincipal currentUser) {
        Report report = reportRepository.findById(reportId)
                .or(() -> reportRepository.findByReportNumber(reportId))
                .orElseThrow(() -> new ResourceNotFoundException("Report not found: " + reportId));

        boolean isApproved = "APPROVE".equalsIgnoreCase(dto.getDecision());

        if (isApproved) {
            report.setStatus(ReportStatus.APPROVED);
            report.setReviewedBy(currentUser.getFullName() != null ? currentUser.getFullName() : currentUser.getUsername());
            report.setReviewedById(currentUser.getId());
            report.setReviewerDesignation(dto.getReviewerDesignation() != null ? dto.getReviewerDesignation() : "QA Lead Officer");
            report.setReviewedDate(LocalDateTime.now());
            report.setReviewerComments(dto.getReviewerComments() != null ? dto.getReviewerComments() : "Verified and approved in accordance with ISO/IEC 17025 compliance.");

            report.getAuditTrail().add(new ReportAuditItem(
                    "APPROVED",
                    currentUser.getUsername(),
                    currentUser.getFullName(),
                    currentUser.getAuthorities().iterator().next().getAuthority(),
                    "Approved report: " + report.getReviewerComments()
            ));

            // Mark sample as APPROVED
            sampleRepository.findBySampleId(report.getSampleId()).ifPresent(s -> {
                s.setStatus(SampleStatus.APPROVED);
                s.getStatusHistory().add(new StatusHistoryItem(
                        SampleStatus.APPROVED,
                        currentUser.getUsername(),
                        "Report " + report.getReportNumber() + " approved and published"
                ));
                sampleRepository.save(s);
            });
        } else {
            report.setStatus(ReportStatus.REJECTED);
            report.setReviewedBy(currentUser.getFullName() != null ? currentUser.getFullName() : currentUser.getUsername());
            report.setReviewedDate(LocalDateTime.now());
            report.setReviewerComments(dto.getReviewerComments() != null ? dto.getReviewerComments() : "Returned for correction / re-analysis.");

            report.getAuditTrail().add(new ReportAuditItem(
                    "REJECTED",
                    currentUser.getUsername(),
                    currentUser.getFullName(),
                    currentUser.getAuthorities().iterator().next().getAuthority(),
                    "Returned for correction: " + report.getReviewerComments()
            ));

            // Return sample to TESTING_IN_PROGRESS
            sampleRepository.findBySampleId(report.getSampleId()).ifPresent(s -> {
                s.setStatus(SampleStatus.TESTING_IN_PROGRESS);
                s.getStatusHistory().add(new StatusHistoryItem(
                        SampleStatus.TESTING_IN_PROGRESS,
                        currentUser.getUsername(),
                        "Report returned for revision: " + dto.getReviewerComments()
                ));
                sampleRepository.save(s);
            });
        }

        report.setUpdatedAt(LocalDateTime.now());
        Report saved = reportRepository.save(report);

        auditLogRepository.save(new AuditLog(
                isApproved ? "APPROVE_REPORT" : "REJECT_REPORT",
                currentUser.getUsername(),
                currentUser.getAuthorities().iterator().next().getAuthority(),
                "Report",
                saved.getReportNumber(),
                (isApproved ? "Approved report " : "Rejected report ") + saved.getReportNumber() + ": " + dto.getReviewerComments()
        ));

        return saved;
    }

    public List<Report> getAllReports(String search, ReportStatus status, UserPrincipal currentUser) {
        boolean isCustomer = currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"));

        List<Report> list = reportRepository.findAll();

        return list.stream()
                .filter(r -> {
                    // Customers can ONLY see approved reports belonging to them!
                    if (isCustomer) {
                        if (r.getStatus() != ReportStatus.APPROVED) {
                            return false;
                        }
                        boolean emailMatches = r.getCustomerEmail() != null && r.getCustomerEmail().equalsIgnoreCase(currentUser.getUsername());
                        boolean idMatches = r.getCustomerId() != null && r.getCustomerId().equals(currentUser.getId());
                        if (!emailMatches && !idMatches) {
                            return false;
                        }
                    }

                    if (status != null && r.getStatus() != status) {
                        return false;
                    }

                    if (search != null && !search.isBlank()) {
                        String q = search.toLowerCase();
                        boolean matchNum = r.getReportNumber() != null && r.getReportNumber().toLowerCase().contains(q);
                        boolean matchSample = r.getSampleId() != null && r.getSampleId().toLowerCase().contains(q);
                        boolean matchCust = r.getCustomerName() != null && r.getCustomerName().toLowerCase().contains(q);
                        if (!matchNum && !matchSample && !matchCust) {
                            return false;
                        }
                    }

                    return true;
                })
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public Report getReportById(String id, UserPrincipal currentUser) {
        Report report = reportRepository.findById(id)
                .or(() -> reportRepository.findByReportNumber(id))
                .or(() -> reportRepository.findBySampleId(id))
                .orElseThrow(() -> new ResourceNotFoundException("Report not found: " + id));

        boolean isCustomer = currentUser != null && currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"));

        if (isCustomer) {
            // Customer can only view their own APPROVED reports
            if (report.getStatus() != ReportStatus.APPROVED) {
                throw new BadRequestException("Draft reports are not accessible to customers until reviewed and approved.");
            }
            boolean emailMatches = report.getCustomerEmail() != null && report.getCustomerEmail().equalsIgnoreCase(currentUser.getUsername());
            boolean idMatches = report.getCustomerId() != null && report.getCustomerId().equals(currentUser.getId());
            if (!emailMatches && !idMatches) {
                throw new BadRequestException("Access denied: You are not authorized to view this report.");
            }
        }

        return report;
    }
}
