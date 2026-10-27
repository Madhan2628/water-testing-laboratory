import TestResult from '../models/TestResult.js';
import TestParameter from '../models/TestParameter.js';
import Sample from '../models/Sample.js';
import { evaluateParameterResult, calculateSampleCompliance } from '../services/complianceEngine.js';

// @desc    Submit single or batch test results for a sample
// @route   POST /api/test-results
// @access  Private (Admin, Technician)
export const saveTestResults = async (req, res, next) => {
  try {
    const { sampleId, results } = req.body;

    if (!sampleId || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Sample ID and an array of test results are required'
      });
    }

    const sample = await Sample.findById(sampleId);
    if (!sample) {
      return res.status(404).json({ success: false, message: 'Sample not found' });
    }

    // Set sample status to 'UNDER ANALYSIS' if not already
    if (['REGISTERED', 'RECEIVED'].includes(sample.status)) {
      sample.status = 'UNDER ANALYSIS';
      await sample.save();
    }

    const savedResults = [];

    for (const item of results) {
      const { parameterId, resultValue, remarks } = item;

      if (resultValue === undefined || resultValue === null || resultValue === '') {
        continue; // Skip unfilled parameter
      }

      const paramDoc = await TestParameter.findById(parameterId);
      if (!paramDoc) continue;

      const numVal = Number(resultValue);
      const passFailStatus = evaluateParameterResult(numVal, paramDoc.minLimit, paramDoc.maxLimit);

      const filter = { sample: sample._id, parameter: paramDoc._id };
      const updateData = {
        sample: sample._id,
        parameter: paramDoc._id,
        parameterName: paramDoc.name,
        category: paramDoc.category,
        unit: paramDoc.unit,
        testMethod: paramDoc.testMethod,
        referenceStandard: paramDoc.referenceStandard,
        minLimit: paramDoc.minLimit,
        maxLimit: paramDoc.maxLimit,
        resultValue: numVal,
        status: passFailStatus,
        testedBy: req.user._id,
        testedDate: new Date(),
        remarks: remarks || ''
      };

      const result = await TestResult.findOneAndUpdate(filter, updateData, {
        new: true,
        upsert: true,
        runValidators: true
      });

      savedResults.push(result);
    }

    // Re-evaluate sample compliance automatically
    const { compliance, overallStatus } = await calculateSampleCompliance(sample._id, req.user._id);

    res.status(200).json({
      success: true,
      message: `Saved ${savedResults.length} test parameter results successfully. Compliance status: ${compliance.overallStatus}`,
      savedCount: savedResults.length,
      compliance,
      results: savedResults
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all test results for a specific sample
// @route   GET /api/test-results/sample/:sampleId
// @access  Private
export const getResultsBySampleId = async (req, res, next) => {
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

    // Customer security check
    if (req.user.role === 'customer') {
      const sample = await Sample.findById(query.sample);
      if (!sample || sample.customer.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only view test results for your own samples'
        });
      }
    }

    const results = await TestResult.find(query)
      .populate('parameter')
      .populate('testedBy', 'name role')
      .sort({ category: 1, parameterName: 1 });

    res.status(200).json({
      success: true,
      count: results.length,
      results
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update single test result
// @route   PUT /api/test-results/:id
// @access  Private (Admin, Technician)
export const updateSingleResult = async (req, res, next) => {
  try {
    const { resultValue, remarks } = req.body;
    const testResult = await TestResult.findById(req.params.id);

    if (!testResult) {
      return res.status(404).json({ success: false, message: 'Test result record not found' });
    }

    if (resultValue !== undefined) {
      const numVal = Number(resultValue);
      testResult.resultValue = numVal;
      testResult.status = evaluateParameterResult(numVal, testResult.minLimit, testResult.maxLimit);
      testResult.testedBy = req.user._id;
      testResult.testedDate = new Date();
    }

    if (remarks !== undefined) {
      testResult.remarks = remarks;
    }

    const updated = await testResult.save();

    // Trigger compliance recalculation
    await calculateSampleCompliance(testResult.sample, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Test result updated successfully',
      result: updated
    });
  } catch (error) {
    next(error);
  }
};
