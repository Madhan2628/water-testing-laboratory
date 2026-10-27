package com.wtlms;

import com.wtlms.model.Report;
import com.wtlms.model.ReportStatus;
import com.wtlms.model.TestResultSnapshot;
import com.wtlms.service.PdfReportService;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PdfReportTest {

    @Test
    void testPdfGenerationProducesValidPdfBytes() throws Exception {
        PdfReportService pdfService = new PdfReportService();

        Report report = new Report();
        report.setReportNumber("REP-2026-0001");
        report.setSampleId("WTL-2026-0001");
        report.setCustomerName("PureBeverage Bottling Corp");
        report.setCustomerEmail("customer2@purebev.com");
        report.setCustomerPhone("+1 555-0105");
        report.setCustomerOrganization("PureBeverage Bottling Corp");
        report.setWaterSource("Drinking water");
        report.setSampleType("Potable Water");
        report.setCollectionLocation("Main Intake Valve A");
        report.setCollectionDate(LocalDateTime.now().minusDays(2));
        report.setReceivedDate(LocalDateTime.now().minusDays(1));
        report.setStatus(ReportStatus.APPROVED);
        report.setOverallAssessment("COMPLIANT");
        report.setAssessmentSummary("All tested parameters comply with IS 10500:2012 permissible drinking water standards.");
        report.setPreparedBy("Sarah Connor (Senior Chemist)");
        report.setReviewedBy("Dr. Elizabeth Shaw (QA Officer)");
        report.setReviewedDate(LocalDateTime.now());

        TestResultSnapshot snap1 = new TestResultSnapshot("pH", "Chemical", "7.4", "pH units", "6.5 - 8.5", "IS 10500:2012", "IS 3025 (Part 11)", "COMPLIANT", "Compliant", "Verified");
        TestResultSnapshot snap2 = new TestResultSnapshot("TDS", "Physical", "280", "mg/L", "Max 500 mg/L", "IS 10500:2012", "IS 3025 (Part 16)", "COMPLIANT", "Compliant", "Verified");

        report.setParametersSnapshot(List.of(snap1, snap2));
        report.setTotalParameters(2);
        report.setPassedParameters(2);
        report.setFailedParameters(0);
        report.setCompliancePercentage(100.0);

        byte[] pdfBytes = pdfService.generateReportPdf(report);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 500, "Generated PDF should have significant length");

        // Verify PDF Magic Bytes (%PDF-)
        assertEquals('%', (char) pdfBytes[0]);
        assertEquals('P', (char) pdfBytes[1]);
        assertEquals('D', (char) pdfBytes[2]);
        assertEquals('F', (char) pdfBytes[3]);
        assertEquals('-', (char) pdfBytes[4]);
    }
}
