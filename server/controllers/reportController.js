import Report from '../models/Report.js';
import Sample from '../models/Sample.js';
import Compliance from '../models/Compliance.js';
import TestResult from '../models/TestResult.js';
import { generateReportNumber } from '../utils/idGenerator.js';
import { generateLabReportPdf } from '../services/pdfService.js';
import { createNotification } from '../services/notificationService.js';

// @desc    Generate a formal laboratory test report
// @route   POST /api/reports/generate/:sampleId
// @access  Private (Admin, Compliance Officer)
export const generateReport = async (req, res, next) => {
  try {
    const { sampleId } = req.params;
    const { remarks } = req.body;

    const sample = await Sample.findById(sampleId).populate('customer');
    if (!sample) {
      return res.status(404).json({ success: false, message: 'Sample not found' });
    }

    const compliance = await Compliance.findOne({ sample: sample._id });
    if (!compliance) {
      return res.status(400).json({
        success: false,
        message: 'Cannot generate report: No compliance evaluation found for this sample'
      });
    }

    const testResults = await TestResult.find({ sample: sample._id }).sort({ category: 1, parameterName: 1 });
    if (testResults.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot generate report: No test results recorded for this sample'
      });
    }

    // Check if report already exists for this sample
    let report = await Report.findOne({ sample: sample._id });

    // Build immutable test results snapshot
    const resultsSnapshot = testResults.map(tr => {
      let permissibleRange = 'N/A';
      if (tr.minLimit !== null && tr.maxLimit !== null) {
        permissibleRange = `${tr.minLimit} - ${tr.maxLimit}`;
      } else if (tr.maxLimit !== null) {
        permissibleRange = `Max ${tr.maxLimit}`;
      } else if (tr.minLimit !== null) {
        permissibleRange = `Min ${tr.minLimit}`;
      }

      return {
        parameterName: tr.parameterName,
        category: tr.category,
        resultValue: tr.resultValue,
        unit: tr.unit,
        minLimit: tr.minLimit,
        maxLimit: tr.maxLimit,
        permissibleRange,
        testMethod: tr.testMethod,
        referenceStandard: tr.referenceStandard,
        status: tr.status,
        remarks: tr.remarks
      };
    });

    const summarySnapshot = {
      totalParameters: compliance.totalParameters,
      passed: compliance.passedParameters,
      failed: compliance.failedParameters,
      compliancePercentage: compliance.compliancePercentage,
      overallCompliance: compliance.overallStatus
    };

    const sampleSnapshot = {
      sampleId: sample.sampleId,
      customerName: sample.customerName,
      customerEmail: sample.customerEmail,
      customerPhone: sample.customerPhone,
      sampleType: sample.sampleType,
      sourceType: sample.sourceType,
      collectionLocation: sample.collectionLocation,
      collectionDate: sample.collectionDate,
      receivedDate: sample.receivedDate,
      analysisDate: compliance.testDate || new Date()
    };

    if (report) {
      // Update existing report draft
      report.summarySnapshot = summarySnapshot;
      report.testResultsSnapshot = resultsSnapshot;
      report.sampleSnapshot = sampleSnapshot;
      if (remarks) report.remarks = remarks;
      await report.save();
    } else {
      const repNum = await generateReportNumber();
      report = await Report.create({
        reportNumber: repNum,
        sample: sample._id,
        compliance: compliance._id,
        customer: sample.customer._id || sample.customer,
        status: 'UNDER REVIEW',
        generatedBy: req.user._id,
        generatedAt: new Date(),
        sampleSnapshot,
        summarySnapshot,
        testResultsSnapshot: resultsSnapshot,
        remarks: remarks || undefined
      });
    }

    // Advance sample status
    if (sample.status !== 'REPORT GENERATED' && sample.status !== 'APPROVED' && sample.status !== 'DELIVERED') {
      sample.status = 'REPORT GENERATED';
      await sample.save();
    }

    // Dispatch notification
    await createNotification({
      targetRole: 'compliance_officer',
      title: 'Lab Report Generated',
      message: `Report ${report.reportNumber} generated for Sample ${sample.sampleId} and ready for approval`,
      type: 'REPORT_GENERATED',
      sample: sample._id,
      report: report._id
    });

    res.status(201).json({
      success: true,
      message: `Laboratory report ${report.reportNumber} generated successfully`,
      report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reports with filtering and search
// @route   GET /api/reports
// @access  Private
export const getReports = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    // Customer can only view their own approved / delivered reports
    if (req.user.role === 'customer') {
      query.customer = req.user._id;
      query.status = { $in: ['APPROVED', 'DELIVERED'] };
    } else if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { reportNumber: { $regex: search, $options: 'i' } },
        { 'sampleSnapshot.sampleId': { $regex: search, $options: 'i' } },
        { 'sampleSnapshot.customerName': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Report.countDocuments(query);
    const reports = await Report.find(query)
      .populate('sample')
      .populate('customer', 'name email phone organization')
      .populate('generatedBy', 'name role')
      .populate('approvedBy', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: reports.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      reports
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get report details by ID or reportNumber
// @route   GET /api/reports/:id
// @access  Private
export const getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let query = {};

    if (id.startsWith('REP-')) {
      query = { reportNumber: id.toUpperCase() };
    } else {
      query = { _id: id };
    }

    const report = await Report.findOne(query)
      .populate('sample')
      .populate('customer', 'name email phone organization')
      .populate('generatedBy', 'name role')
      .populate('approvedBy', 'name role')
      .populate('reviewedBy', 'name role');

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Role check: Customer can only view own approved reports
    if (req.user.role === 'customer') {
      if (report.customer._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not authorized to view this report'
        });
      }
      if (!['APPROVED', 'DELIVERED'].includes(report.status)) {
        return res.status(403).json({
          success: false,
          message: 'This report is currently under review and has not yet been approved for customer viewing'
        });
      }
    }

    res.status(200).json({ success: true, report });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve laboratory report
// @route   PUT /api/reports/:id/approve
// @access  Private (Admin, Compliance Officer)
export const approveReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id).populate('sample');
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.status = 'APPROVED';
    report.approvedBy = req.user._id;
    report.approvedAt = new Date();
    report.digitalSignature = {
      signedBy: req.user.name,
      signDate: new Date(),
      signatureHash: `SHA256-${Buffer.from(`${report.reportNumber}-${req.user._id}-${Date.now()}`).toString('base64').slice(0, 24)}`
    };

    await report.save();

    // Advance sample status to APPROVED
    if (report.sample) {
      report.sample.status = 'APPROVED';
      await report.sample.save();
    }

    // Notify customer
    await createNotification({
      recipient: report.customer,
      title: 'Water Test Certificate Approved',
      message: `Your laboratory report ${report.reportNumber} has been verified and approved. You may now download your certificate.`,
      type: 'REPORT_APPROVED',
      sample: report.sample ? report.sample._id : undefined,
      report: report._id
    });

    res.status(200).json({
      success: true,
      message: 'Report approved successfully and released for customer download',
      report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deliver report
// @route   PUT /api/reports/:id/deliver
// @access  Private (Admin, Compliance Officer)
export const deliverReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id).populate('sample');
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.status = 'DELIVERED';
    report.deliveredDate = new Date();
    await report.save();

    if (report.sample) {
      report.sample.status = 'DELIVERED';
      await report.sample.save();
    }

    res.status(200).json({
      success: true,
      message: 'Report marked as delivered',
      report
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download official PDF report
// @route   GET /api/reports/:id/pdf
// @access  Private
export const downloadReportPdf = async (req, res, next) => {
  try {
    const { id } = req.params;
    let query = {};

    if (id.startsWith('REP-')) {
      query = { reportNumber: id.toUpperCase() };
    } else {
      query = { _id: id };
    }

    const report = await Report.findOne(query);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Customer security check
    if (req.user.role === 'customer') {
      if (report.customer.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only download your own reports'
        });
      }
      if (!['APPROVED', 'DELIVERED'].includes(report.status)) {
        return res.status(403).json({
          success: false,
          message: 'Report is still pending approval and cannot be downloaded yet'
        });
      }
    }

    generateLabReportPdf(report, res);
  } catch (error) {
    next(error);
  }
};
