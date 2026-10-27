package com.wtlms;

import com.wtlms.dto.ReportReviewDto;
import com.wtlms.exception.BadRequestException;
import com.wtlms.model.Report;
import com.wtlms.model.ReportStatus;
import com.wtlms.model.TestResultSnapshot;
import com.wtlms.repository.AuditLogRepository;
import com.wtlms.repository.ReportRepository;
import com.wtlms.repository.SampleRepository;
import com.wtlms.repository.TestResultRepository;
import com.wtlms.security.UserPrincipal;
import com.wtlms.service.ComplianceEngineService;
import com.wtlms.service.ReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class ReportApprovalAndSecurityTest {

    private ReportRepository reportRepository;
    private SampleRepository sampleRepository;
    private TestResultRepository testResultRepository;
    private AuditLogRepository auditLogRepository;
    private ReportService reportService;

    private UserPrincipal adminPrincipal;
    private UserPrincipal customerPrincipal;
    private UserPrincipal otherCustomerPrincipal;

    @BeforeEach
    void setUp() {
        reportRepository = Mockito.mock(ReportRepository.class);
        sampleRepository = Mockito.mock(SampleRepository.class);
        testResultRepository = Mockito.mock(TestResultRepository.class);
        auditLogRepository = Mockito.mock(AuditLogRepository.class);

        reportService = new ReportService(
                reportRepository,
                sampleRepository,
                testResultRepository,
                auditLogRepository
        );

        adminPrincipal = new UserPrincipal("admin-id", "admin@watertest.com", "pass", "Dr. Shaw",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN")), true);

        customerPrincipal = new UserPrincipal("cust-1-id", "cust1@gmail.com", "pass", "GreenValley Agro",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_CUSTOMER")), true);

        otherCustomerPrincipal = new UserPrincipal("cust-2-id", "cust2@gmail.com", "pass", "Metro Municipal",
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_CUSTOMER")), true);
    }

    @Test
    void testCustomerDataIsolation() {
        Report report = new Report();
        report.setId("rep-101");
        report.setReportNumber("REP-2026-0001");
        report.setCustomerId("cust-1-id"); // owned by cust 1
        report.setStatus(ReportStatus.APPROVED);

        when(reportRepository.findById("rep-101")).thenReturn(Optional.of(report));

        // Owner customer can access
        Report retrieved = reportService.getReportById("rep-101", customerPrincipal);
        assertNotNull(retrieved);
        assertEquals("REP-2026-0001", retrieved.getReportNumber());

        // Other customer cannot access -> throws BadRequestException / 403 Access Denied
        assertThrows(BadRequestException.class, () -> {
            reportService.getReportById("rep-101", otherCustomerPrincipal);
        });

        // Admin can access all reports
        Report adminRetrieved = reportService.getReportById("rep-101", adminPrincipal);
        assertNotNull(adminRetrieved);
    }

    @Test
    void testApproveReportTransitionsStatusAndAudit() {
        Report report = new Report();
        report.setId("rep-202");
        report.setReportNumber("REP-2026-0002");
        report.setStatus(ReportStatus.PENDING_APPROVAL);

        when(reportRepository.findById("rep-202")).thenReturn(Optional.of(report));
        when(reportRepository.save(any(Report.class))).thenAnswer(i -> i.getArgument(0));

        ReportReviewDto approveDto = new ReportReviewDto("APPROVE", "Assay verified and accredited", "Lead QA Officer");
        Report approved = reportService.reviewReport("rep-202", approveDto, adminPrincipal);

        assertEquals(ReportStatus.APPROVED, approved.getStatus());
        assertEquals("Dr. Shaw", approved.getReviewedBy());
        assertNotNull(approved.getReviewedDate());
        assertFalse(approved.getAuditTrail().isEmpty());
    }

    @Test
    void testHistoricalSnapshotPreservation() {
        // An approved report contains its immutable parameter snapshot
        Report report = new Report();
        report.setId("rep-303");
        report.setReportNumber("REP-2026-0003");
        report.setStatus(ReportStatus.APPROVED);

        TestResultSnapshot snap = new TestResultSnapshot(
                "Fluoride", "Chemical", "0.8", "mg/L", "Max 1.0 mg/L", "IS 10500:2012", "IS 3025", "COMPLIANT", "Safe", "OK"
        );
        report.setParametersSnapshot(List.of(snap));

        when(reportRepository.findById("rep-303")).thenReturn(Optional.of(report));

        Report result = reportService.getReportById("rep-303", adminPrincipal);
        assertEquals(1, result.getParametersSnapshot().size());
        assertEquals("Max 1.0 mg/L", result.getParametersSnapshot().get(0).getReferenceLimitDisplay());
        assertEquals("IS 10500:2012", result.getParametersSnapshot().get(0).getReferenceStandard());
    }
}
