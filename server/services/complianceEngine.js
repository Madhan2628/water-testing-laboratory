import Compliance from '../models/Compliance.js';
import TestResult from '../models/TestResult.js';
import Sample from '../models/Sample.js';
import { createNotification } from './notificationService.js';

/**
 * Evaluates individual parameter result value against min and max thresholds
 */
export const evaluateParameterResult = (resultValue, minLimit, maxLimit) => {
  if (resultValue === null || resultValue === undefined || isNaN(resultValue)) {
    return 'NOT TESTED';
  }

  const val = Number(resultValue);

  if (minLimit !== null && minLimit !== undefined && val < minLimit) {
    return 'FAIL';
  }

  if (maxLimit !== null && maxLimit !== undefined && val > maxLimit) {
    return 'FAIL';
  }

  return 'PASS';
};

/**
 * Re-calculates and persists compliance summary for a given sample
 */
export const calculateSampleCompliance = async (sampleId, evaluatedByUserId = null) => {
  const sample = await Sample.findById(sampleId);
  if (!sample) {
    throw new Error('Sample not found for compliance evaluation');
  }

  const results = await TestResult.find({ sample: sampleId });

  const totalParameters = results.length;
  let passedParameters = 0;
  let failedParameters = 0;
  const failedParamNames = [];

  results.forEach(res => {
    if (res.status === 'PASS') {
      passedParameters++;
    } else if (res.status === 'FAIL') {
      failedParameters++;
      failedParamNames.push(res.parameterName);
    }
  });

  const compliancePercentage = totalParameters > 0
    ? Math.round((passedParameters / totalParameters) * 100 * 10) / 10
    : 0;

  let overallStatus = 'PENDING';
  if (totalParameters > 0) {
    overallStatus = failedParameters > 0 ? 'NON-COMPLIANT' : 'COMPLIANT';
  }

  // Find or create compliance record
  let compliance = await Compliance.findOne({ sample: sampleId });

  if (compliance) {
    compliance.totalParameters = totalParameters;
    compliance.passedParameters = passedParameters;
    compliance.failedParameters = failedParameters;
    compliance.compliancePercentage = compliancePercentage;
    compliance.overallStatus = overallStatus;
    compliance.testDate = new Date();
    await compliance.save();
  } else {
    compliance = await Compliance.create({
      sample: sample._id,
      sampleIdString: sample.sampleId,
      customer: sample.customer,
      totalParameters,
      passedParameters,
      failedParameters,
      compliancePercentage,
      overallStatus,
      testDate: new Date(),
      standardReference: 'IS 10500:2012'
    });
  }

  // Update sample status to 'ANALYSIS COMPLETED' if currently 'UNDER ANALYSIS' or 'RECEIVED'
  if (totalParameters > 0 && ['RECEIVED', 'UNDER ANALYSIS'].includes(sample.status)) {
    sample.status = 'ANALYSIS COMPLETED';
    await sample.save();

    await createNotification({
      targetRole: 'compliance_officer',
      title: 'Analysis Completed - Awaiting Review',
      message: `Sample ${sample.sampleId} analysis completed with status: ${overallStatus} (${compliancePercentage}%)`,
      type: 'ANALYSIS_COMPLETED',
      sample: sample._id
    });
  }

  // If non-compliant, create urgent alert notification
  if (overallStatus === 'NON-COMPLIANT') {
    await createNotification({
      targetRole: 'compliance_officer',
      title: '⚠️ Non-Compliant Water Sample Detected',
      message: `Sample ${sample.sampleId} failed ${failedParameters} parameter(s): ${failedParamNames.join(', ')}`,
      type: 'NON_COMPLIANT_ALERT',
      sample: sample._id
    });
  }

  return { compliance, sample, failedParamNames };
};
