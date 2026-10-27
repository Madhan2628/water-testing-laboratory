import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateLabReportPdf = (reportData, res) => {
  const doc = new PDFDocument({
    margin: 40,
    size: 'A4',
    info: {
      Title: `Water Test Report - ${reportData.reportNumber}`,
      Author: 'AquaPure Laboratory Services'
    }
  });

  // Pipe to HTTP response stream directly
  doc.pipe(res);

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="Water_Test_Report_${reportData.reportNumber}.pdf"`
  );

  // --- HEADER SECTION ---
  doc.rect(40, 40, 515, 75).fill('#0f2d59');
  
  doc.fillColor('#ffffff')
    .fontSize(18)
    .font('Helvetica-Bold')
    .text(reportData.labDetails?.name || 'AQUAPURE LABORATORY SERVICES', 55, 52);

  doc.fontSize(9)
    .font('Helvetica')
    .fillColor('#d4e3fc')
    .text(reportData.labDetails?.address || '42 Environmental Science Tower, Tech Park, Metro City', 55, 74)
    .text(`Tel: ${reportData.labDetails?.contact || '+1 (800) 555-AQUA'} | ${reportData.labDetails?.accreditation || 'ISO/IEC 17025 Accredited'}`, 55, 88);

  doc.moveDown(3);

  // --- CERTIFICATE TITLE ---
  const currentY = 125;
  doc.fillColor('#0f2d59')
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('OFFICIAL CERTIFICATE OF WATER QUALITY ANALYSIS', 40, currentY, { align: 'center' });

  // Status Badge
  const statusColor = reportData.status === 'APPROVED' || reportData.status === 'DELIVERED' ? '#10b981' : '#f59e0b';
  doc.fontSize(9)
    .font('Helvetica-Bold')
    .fillColor(statusColor)
    .text(`STATUS: ${reportData.status}`, 40, currentY + 18, { align: 'center' });

  // --- SAMPLE INFORMATION BOX ---
  const boxTop = currentY + 35;
  doc.rect(40, boxTop, 515, 95).lineWidth(1).strokeColor('#cbd5e1').stroke();
  doc.rect(40, boxTop, 515, 20).fill('#f1f5f9');

  doc.fillColor('#0f2d59').fontSize(10).font('Helvetica-Bold').text('SAMPLE & TEST REGISTRATION DETAILS', 50, boxTop + 5);

  const col1 = 50;
  const col2 = 300;
  let textY = boxTop + 26;

  doc.fillColor('#334155').fontSize(8.5).font('Helvetica');
  doc.text(`Report Number: ${reportData.reportNumber}`, col1, textY);
  doc.text(`Sample ID: ${reportData.sampleSnapshot?.sampleId || 'N/A'}`, col2, textY);

  textY += 14;
  doc.text(`Customer Name: ${reportData.sampleSnapshot?.customerName || 'N/A'}`, col1, textY);
  doc.text(`Sample Type: ${reportData.sampleSnapshot?.sampleType || 'N/A'}`, col2, textY);

  textY += 14;
  doc.text(`Source: ${reportData.sampleSnapshot?.sourceType || 'N/A'}`, col1, textY);
  doc.text(`Location: ${reportData.sampleSnapshot?.collectionLocation || 'N/A'}`, col2, textY);

  textY += 14;
  const colDate = reportData.sampleSnapshot?.collectionDate ? new Date(reportData.sampleSnapshot.collectionDate).toLocaleDateString() : 'N/A';
  const recDate = reportData.sampleSnapshot?.receivedDate ? new Date(reportData.sampleSnapshot.receivedDate).toLocaleDateString() : 'N/A';
  doc.text(`Collection Date: ${colDate}`, col1, textY);
  doc.text(`Received Date: ${recDate}`, col2, textY);

  // --- TEST RESULTS TABLE ---
  const tableTop = boxTop + 105;
  doc.rect(40, tableTop, 515, 20).fill('#0f2d59');

  doc.fillColor('#ffffff').fontSize(8.5).font('Helvetica-Bold');
  doc.text('Parameter Name', 50, tableTop + 5);
  doc.text('Result', 180, tableTop + 5);
  doc.text('Unit', 235, tableTop + 5);
  doc.text('Permissible Limit', 290, tableTop + 5);
  doc.text('Test Method', 400, tableTop + 5);
  doc.text('Status', 485, tableTop + 5);

  let rowY = tableTop + 22;
  const results = reportData.testResultsSnapshot || [];

  results.forEach((r, idx) => {
    // Zebra striping
    if (idx % 2 === 0) {
      doc.rect(40, rowY, 515, 17).fill('#f8fafc');
    }

    doc.fillColor('#1e293b').fontSize(8).font('Helvetica');
    doc.text(r.parameterName || 'Param', 50, rowY + 4, { width: 125, ellipsis: true });
    doc.text(String(r.resultValue ?? 'N/A'), 180, rowY + 4);
    doc.text(r.unit || '-', 235, rowY + 4);
    doc.text(r.permissibleRange || (r.maxLimit ? `<= ${r.maxLimit}` : '-'), 290, rowY + 4, { width: 105 });
    doc.text(r.testMethod || 'Standard', 400, rowY + 4, { width: 80, ellipsis: true });

    // Status pill
    const pass = r.status === 'PASS';
    doc.font('Helvetica-Bold').fillColor(pass ? '#059669' : '#dc2626');
    doc.text(r.status || 'PASS', 485, rowY + 4);

    rowY += 17;
  });

  // Table bottom border
  doc.rect(40, rowY, 515, 1).fill('#cbd5e1');
  rowY += 10;

  // --- COMPLIANCE SUMMARY SECTION ---
  doc.rect(40, rowY, 515, 45).fill('#f1f5f9');
  doc.rect(40, rowY, 515, 45).lineWidth(1).strokeColor('#cbd5e1').stroke();

  const isCompliant = reportData.summarySnapshot?.overallCompliance === 'COMPLIANT';
  doc.fillColor('#0f2d59').fontSize(9).font('Helvetica-Bold').text('TEST & COMPLIANCE SUMMARY', 50, rowY + 6);

  doc.fontSize(8.5).font('Helvetica').fillColor('#334155');
  doc.text(`Total Parameters Tested: ${reportData.summarySnapshot?.totalParameters || 0}`, 50, rowY + 22);
  doc.text(`Passed: ${reportData.summarySnapshot?.passed || 0}`, 190, rowY + 22);
  doc.text(`Failed: ${reportData.summarySnapshot?.failed || 0}`, 260, rowY + 22);
  doc.text(`Compliance Rate: ${reportData.summarySnapshot?.compliancePercentage || 0}%`, 330, rowY + 22);

  doc.font('Helvetica-Bold').fillColor(isCompliant ? '#059669' : '#dc2626');
  doc.text(`VERDICT: ${reportData.summarySnapshot?.overallCompliance || 'PENDING'}`, 440, rowY + 22);

  rowY += 55;

  // --- FOOTER & SIGNATORIES SECTION ---
  doc.rect(40, rowY, 515, 75).lineWidth(1).strokeColor('#cbd5e1').stroke();

  doc.fillColor('#334155').fontSize(8).font('Helvetica');
  doc.text('Prepared By:', 55, rowY + 10);
  doc.text('Analyst / Technician', 55, rowY + 22);
  doc.font('Helvetica-Bold').text('AquaPure Lab Tech', 55, rowY + 45);

  doc.font('Helvetica').text('Reviewed & Quality Checked:', 220, rowY + 10);
  doc.text('Quality Officer', 220, rowY + 22);
  doc.font('Helvetica-Bold').text('Compliance Officer', 220, rowY + 45);

  doc.font('Helvetica').text('Authorized Signatory:', 380, rowY + 10);
  doc.text('Laboratory Director', 380, rowY + 22);
  doc.font('Helvetica-Bold').fillColor('#0f2d59').text('Dr. A. Vance, Ph.D. (Director)', 380, rowY + 45);
  doc.fontSize(7).font('Helvetica-Oblique').fillColor('#64748b').text('[ Digitally Signed & Sealed ]', 380, rowY + 58);

  rowY += 85;

  // Disclaimer text
  doc.fontSize(7).font('Helvetica').fillColor('#94a3b8').text(
    reportData.remarks || 'This report is generated electronically and valid without physical signature. Terms & conditions apply.',
    40,
    rowY,
    { align: 'center', width: 515 }
  );

  doc.end();
};
