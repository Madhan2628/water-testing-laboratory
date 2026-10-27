package com.wtlms.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.wtlms.model.Report;
import com.wtlms.model.ReportStatus;
import com.wtlms.model.TestResultSnapshot;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class PdfReportService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm");
    private static final DateTimeFormatter SHORT_DATE_FMT = DateTimeFormatter.ofPattern("dd-MMM-yyyy");

    public byte[] generateReportPdf(Report report) throws DocumentException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 40, 40);
        PdfWriter writer = PdfWriter.getInstance(document, out);

        document.open();

        // Color definitions
        Color primaryBlue = new Color(2, 132, 199);
        Color darkBlue = new Color(15, 23, 42);
        Color lightGray = new Color(241, 245, 249);
        Color borderGray = new Color(226, 232, 240);
        Color compliantGreen = new Color(16, 185, 129);
        Color nonCompliantRed = new Color(239, 68, 68);

        // Fonts
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, primaryBlue);
        Font subTitleFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.DARK_GRAY);
        Font sectionTitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, darkBlue);
        Font boldLabelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, darkBlue);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);
        Font smallMutedFont = FontFactory.getFont(FontFactory.HELVETICA, 7, Color.GRAY);
        Font tableHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, Color.WHITE);

        // Header Table
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{65, 35});

        PdfPCell labCell = new PdfPCell();
        labCell.setBorder(Rectangle.NO_BORDER);
        Paragraph labName = new Paragraph("AQUAPURE WATER QUALITY TESTING LAB", titleFont);
        Paragraph labSub = new Paragraph("ISO/IEC 17025 Accreditated Testing Facility\nEnvironmental & Drinking Water Analysis Division\n100 Science City Road, Sector 5, Tech Hub", subTitleFont);
        labCell.addElement(labName);
        labCell.addElement(labSub);
        headerTable.addCell(labCell);

        PdfPCell metaCell = new PdfPCell();
        metaCell.setBorder(Rectangle.NO_BORDER);
        metaCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        String statusBadgeText = report.getStatus() == ReportStatus.APPROVED ? "APPROVED REPORT" : "DRAFT REPORT";
        Color badgeColor = report.getStatus() == ReportStatus.APPROVED ? compliantGreen : Color.ORANGE;

        Paragraph pReportNo = new Paragraph("REPORT NO: " + report.getReportNumber(), boldLabelFont);
        pReportNo.setAlignment(Element.ALIGN_RIGHT);
        Paragraph pSampleId = new Paragraph("SAMPLE ID: " + report.getSampleId(), boldLabelFont);
        pSampleId.setAlignment(Element.ALIGN_RIGHT);
        Paragraph pDate = new Paragraph("ISSUED: " + (report.getReviewedDate() != null ? report.getReviewedDate().format(SHORT_DATE_FMT) : report.getPreparedDate().format(SHORT_DATE_FMT)), normalFont);
        pDate.setAlignment(Element.ALIGN_RIGHT);
        Paragraph pStatus = new Paragraph("[" + statusBadgeText + "]", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, badgeColor));
        pStatus.setAlignment(Element.ALIGN_RIGHT);

        metaCell.addElement(pReportNo);
        metaCell.addElement(pSampleId);
        metaCell.addElement(pDate);
        metaCell.addElement(pStatus);
        headerTable.addCell(metaCell);

        document.add(headerTable);

        // Horizontal line
        document.add(new Paragraph(" "));
        PdfPTable line = new PdfPTable(1);
        line.setWidthPercentage(100);
        PdfPCell lineCell = new PdfPCell();
        lineCell.setBackgroundColor(primaryBlue);
        lineCell.setFixedHeight(2f);
        lineCell.setBorder(Rectangle.NO_BORDER);
        line.addCell(lineCell);
        document.add(line);
        document.add(new Paragraph(" "));

        // Section: Sample & Customer Details
        PdfPTable infoTable = new PdfPTable(4);
        infoTable.setWidthPercentage(100);
        infoTable.setWidths(new float[]{22, 28, 22, 28});

        addInfoRow(infoTable, "Customer Name:", report.getCustomerName(), "Water Source:", report.getWaterSource(), boldLabelFont, normalFont, lightGray);
        addInfoRow(infoTable, "Organization:", report.getCustomerOrganization() != null ? report.getCustomerOrganization() : "Individual", "Sample Type:", report.getSampleType(), boldLabelFont, normalFont, Color.WHITE);
        addInfoRow(infoTable, "Contact / Email:", report.getCustomerEmail(), "Condition:", report.getSampleCondition() != null ? report.getSampleCondition() : "Good", boldLabelFont, normalFont, lightGray);
        addInfoRow(infoTable, "Collection Location:", report.getCollectionLocation(), "Collection Date:", report.getCollectionDate() != null ? report.getCollectionDate().format(DATE_FMT) : "N/A", boldLabelFont, normalFont, Color.WHITE);
        addInfoRow(infoTable, "Receipt Date:", report.getReceivedDate() != null ? report.getReceivedDate().format(DATE_FMT) : "N/A", "Applicable Standard:", report.getApplicableStandard(), boldLabelFont, normalFont, lightGray);

        document.add(infoTable);
        document.add(new Paragraph(" "));

        // Section: Test Results
        Paragraph testHeader = new Paragraph("TEST RESULTS & REGULATORY COMPLIANCE ASSESSMENT", sectionTitleFont);
        testHeader.setSpacingAfter(6);
        document.add(testHeader);

        PdfPTable resultsTable = new PdfPTable(7);
        resultsTable.setWidthPercentage(100);
        resultsTable.setWidths(new float[]{18, 14, 18, 14, 10, 16, 10});

        String[] headers = {"Parameter", "Category", "Test Method", "Result", "Unit", "Reference Limit", "Status"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, tableHeaderFont));
            cell.setBackgroundColor(darkBlue);
            cell.setPadding(5);
            cell.setHorizontalAlignment(Element.ALIGN_CENTER);
            resultsTable.addCell(cell);
        }

        boolean alt = false;
        if (report.getParametersSnapshot() != null && !report.getParametersSnapshot().isEmpty()) {
            for (TestResultSnapshot s : report.getParametersSnapshot()) {
                Color rowBg = alt ? lightGray : Color.WHITE;
                alt = !alt;

                resultsTable.addCell(createCell(s.getParameterName(), normalFont, rowBg, Element.ALIGN_LEFT));
                resultsTable.addCell(createCell(s.getCategory(), normalFont, rowBg, Element.ALIGN_CENTER));
                resultsTable.addCell(createCell(s.getTestMethod() != null ? s.getTestMethod() : "Standard", normalFont, rowBg, Element.ALIGN_CENTER));
                resultsTable.addCell(createCell(s.getMeasuredValue(), boldLabelFont, rowBg, Element.ALIGN_CENTER));
                resultsTable.addCell(createCell(s.getUnit() != null ? s.getUnit() : "-", normalFont, rowBg, Element.ALIGN_CENTER));
                resultsTable.addCell(createCell(s.getReferenceLimitDisplay() != null ? s.getReferenceLimitDisplay() : "-", normalFont, rowBg, Element.ALIGN_CENTER));

                boolean isPass = "COMPLIANT".equalsIgnoreCase(s.getComplianceStatus());
                Font statusFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, isPass ? compliantGreen : nonCompliantRed);
                resultsTable.addCell(createCell(isPass ? "PASS" : "FAIL", statusFont, rowBg, Element.ALIGN_CENTER));
            }
        } else {
            PdfPCell noData = new PdfPCell(new Phrase("No parameter results recorded", normalFont));
            noData.setColspan(7);
            noData.setPadding(8);
            noData.setHorizontalAlignment(Element.ALIGN_CENTER);
            resultsTable.addCell(noData);
        }

        document.add(resultsTable);
        document.add(new Paragraph(" "));

        // Section: Overall Assessment Box
        PdfPTable assessmentTable = new PdfPTable(1);
        assessmentTable.setWidthPercentage(100);

        PdfPCell assessCell = new PdfPCell();
        boolean overallCompliant = "COMPLIANT".equalsIgnoreCase(report.getOverallAssessment());
        assessCell.setBackgroundColor(overallCompliant ? new Color(236, 253, 245) : new Color(254, 242, 242));
        assessCell.setBorderColor(overallCompliant ? compliantGreen : nonCompliantRed);
        assessCell.setBorderWidth(1.5f);
        assessCell.setPadding(8);

        Paragraph assessTitle = new Paragraph("OVERALL WATER QUALITY ASSESSMENT: " +
                (overallCompliant ? "COMPLIANT / POTABLE WITH RESPECT TO TESTED PARAMETERS" : "NON-COMPLIANT WITH SPECIFIED LIMITS"),
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, overallCompliant ? compliantGreen : nonCompliantRed));
        Paragraph assessText = new Paragraph(
                (report.getAssessmentSummary() != null && !report.getAssessmentSummary().isBlank())
                        ? report.getAssessmentSummary()
                        : (overallCompliant
                        ? "All analyzed parameters comply with the permissible requirements of " + report.getApplicableStandard() + " for " + report.getWaterSource() + "."
                        : "One or more analyzed parameters failed to meet the specified regulatory criteria of " + report.getApplicableStandard() + ". Review recommended before consumption or industrial use."),
                normalFont);

        Paragraph obsText = new Paragraph("Laboratory Remarks / Observations: " +
                (report.getLaboratoryObservations() != null ? report.getLaboratoryObservations() : "Sample analyzed under standard laboratory atmospheric conditions."),
                subTitleFont);

        assessCell.addElement(assessTitle);
        assessCell.addElement(assessText);
        assessCell.addElement(obsText);
        assessmentTable.addCell(assessCell);
        document.add(assessmentTable);

        document.add(new Paragraph(" "));

        // Signatures Block
        PdfPTable signTable = new PdfPTable(2);
        signTable.setWidthPercentage(100);
        signTable.setWidths(new float[]{50, 50});

        PdfPCell prepCell = new PdfPCell();
        prepCell.setBorder(Rectangle.NO_BORDER);
        prepCell.addElement(new Paragraph("Analyst / Prepared By:", boldLabelFont));
        prepCell.addElement(new Paragraph(report.getPreparedBy() != null ? report.getPreparedBy() : "Laboratory Testing Staff", normalFont));
        prepCell.addElement(new Paragraph("Date: " + (report.getPreparedDate() != null ? report.getPreparedDate().format(SHORT_DATE_FMT) : "N/A"), subTitleFont));
        signTable.addCell(prepCell);

        PdfPCell authCell = new PdfPCell();
        authCell.setBorder(Rectangle.NO_BORDER);
        authCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        Paragraph authHead = new Paragraph("Authorized Signatory / QA Reviewer:", boldLabelFont);
        authHead.setAlignment(Element.ALIGN_RIGHT);
        Paragraph authName = new Paragraph(report.getReviewedBy() != null ? report.getReviewedBy() : "Dr. Elizabeth Shaw (QA Officer)", normalFont);
        authName.setAlignment(Element.ALIGN_RIGHT);
        Paragraph authDesig = new Paragraph(report.getReviewerDesignation() != null ? report.getReviewerDesignation() : "Quality Assurance & Regulatory Audits", subTitleFont);
        authDesig.setAlignment(Element.ALIGN_RIGHT);
        Paragraph authDate = new Paragraph("Approval Date: " + (report.getReviewedDate() != null ? report.getReviewedDate().format(SHORT_DATE_FMT) : "Pending Review"), subTitleFont);
        authDate.setAlignment(Element.ALIGN_RIGHT);

        authCell.addElement(authHead);
        authCell.addElement(authName);
        authCell.addElement(authDesig);
        authCell.addElement(authDate);
        signTable.addCell(authCell);

        document.add(signTable);

        // Disclaimer at bottom
        document.add(new Paragraph(" "));
        Paragraph disclaimer = new Paragraph("NOTICE & DISCLAIMER: " + report.getDisclaimer() +
                "\nThis document is generated by AquaPure Water Testing Laboratory Management System. Verifiable report ID: " + report.getReportNumber(),
                smallMutedFont);
        disclaimer.setAlignment(Element.ALIGN_CENTER);
        document.add(disclaimer);

        document.close();
        return out.toByteArray();
    }

    private static void addInfoRow(PdfPTable table, String label1, String val1, String label2, String val2,
                                   Font boldFont, Font normalFont, Color bg) {
        PdfPCell c1 = new PdfPCell(new Phrase(label1, boldFont));
        c1.setBackgroundColor(bg);
        c1.setBorderColor(new Color(226, 232, 240));
        c1.setPadding(4);
        table.addCell(c1);

        PdfPCell c2 = new PdfPCell(new Phrase(val1 != null ? val1 : "N/A", normalFont));
        c2.setBackgroundColor(bg);
        c2.setBorderColor(new Color(226, 232, 240));
        c2.setPadding(4);
        table.addCell(c2);

        PdfPCell c3 = new PdfPCell(new Phrase(label2, boldFont));
        c3.setBackgroundColor(bg);
        c3.setBorderColor(new Color(226, 232, 240));
        c3.setPadding(4);
        table.addCell(c3);

        PdfPCell c4 = new PdfPCell(new Phrase(val2 != null ? val2 : "N/A", normalFont));
        c4.setBackgroundColor(bg);
        c4.setBorderColor(new Color(226, 232, 240));
        c4.setPadding(4);
        table.addCell(c4);
    }

    private static PdfPCell createCell(String text, Font font, Color bg, int align) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "-", font));
        cell.setBackgroundColor(bg);
        cell.setBorderColor(new Color(226, 232, 240));
        cell.setPadding(5);
        cell.setHorizontalAlignment(align);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        return cell;
    }
}
