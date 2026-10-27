import Compliance from '../models/Compliance.js';
import Sample from '../models/Sample.js';
import { createNotification } from '../services/notificationService.js';

// @desc    Get compliance records with extensive filtering
// @route   GET /api/compliance
// @access  Private (Admin, Compliance Officer, Technician)
export const getComplianceRecords = async (req, res, next) => {
  try {
    const {
      overallStatus,
      decision,
      startDate,
      endDate,
      search,
      sampleType,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (overallStatus) {
      query.overallStatus = overallStatus;
    }

    if (decision) {
      query.decision = decision;
    }

    if (startDate || endDate) {
      query.testDate = {};
      if (startDate) query.testDate.$gte = new Date(startDate);
      if (endDate) query.testDate.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { sampleIdString: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Compliance.countDocuments(query);
    let records = await Compliance.find(query)
      .populate({
        path: 'sample',
        populate: [
          { path: 'customer', select: 'name email phone organization' },
          { path: 'registeredBy', select: 'name role' }
        ]
      })
      .populate('customer', 'name email phone organization')
      .populate('reviewedBy', 'name role')
      .sort({ testDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Optional filter by sampleType if present on populated sample
    if (sampleType) {
      records = records.filter(rec => rec.sample && rec.sample.sampleType === sampleType);
    }

    res.status(200).json({
      success: true,
      count: records.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      records
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get compliance details for a sample
// @route   GET /api/compliance/sample/:sampleId
// @access  Private
export const getComplianceBySampleId = async (req, res, next) => {
  try {
    const { sampleId } = req.params;
    let query = {};

    if (sampleId.startsWith('WTL-')) {
      const sample = await Sample.findOne({ sampleId: sampleId.toUpperCase() });
      if (!sample) {
        return res.status(404).json({ success: false, message: 'Sample not found' });
      }
      query = { sample: sample._id };
    } else {
      query = { sample: sampleId };
    }

    const compliance = await Compliance.findOne(query)
      .populate('sample')
      .populate('customer', 'name email phone organization')
      .populate('reviewedBy', 'name role');

    if (!compliance) {
      return res.status(404).json({
        success: false,
        message: 'No compliance evaluation found for this sample yet'
      });
    }

    // Customer security check
    if (req.user.role === 'customer' && compliance.customer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only view compliance for your own samples'
      });
    }

    res.status(200).json({
      success: true,
      compliance
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Compliance Officer review & sign-off
// @route   PUT /api/compliance/:id/review
// @access  Private (Admin, Compliance Officer)
export const reviewCompliance = async (req, res, next) => {
  try {
    const { decision, officerRemarks } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: "Decision must be either 'APPROVED' or 'REJECTED'"
      });
    }

    const compliance = await Compliance.findById(req.params.id).populate('sample');
    if (!compliance) {
      return res.status(404).json({ success: false, message: 'Compliance record not found' });
    }

    compliance.decision = decision;
    compliance.reviewedBy = req.user._id;
    compliance.reviewDate = new Date();
    if (officerRemarks) compliance.officerRemarks = officerRemarks;

    await compliance.save();

    // Notify customer & admin
    await createNotification({
      recipient: compliance.customer,
      title: `Water Sample Compliance Review: ${decision}`,
      message: `Your sample ${compliance.sampleIdString} compliance audit has been marked as ${decision} by the Quality Officer.`,
      type: 'SYSTEM',
      sample: compliance.sample._id
    });

    res.status(200).json({
      success: true,
      message: `Compliance review saved with decision: ${decision}`,
      compliance
    });
  } catch (error) {
    next(error);
  }
};
