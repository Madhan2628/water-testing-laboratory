import Sample from '../models/Sample.js';
import Report from '../models/Report.js';

export const generateSampleId = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `WTL-${dateStr}`;

  // Find latest sample with same date prefix
  const latestSample = await Sample.findOne({
    sampleId: { $regex: `^${prefix}` }
  }).sort({ sampleId: -1 });

  let sequence = 1;
  if (latestSample && latestSample.sampleId) {
    const parts = latestSample.sampleId.split('-');
    if (parts.length === 3) {
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }
  }

  const paddedSeq = String(sequence).padStart(4, '0');
  return `${prefix}-${paddedSeq}`;
};

export const generateReportNumber = async () => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `REP-${dateStr}`;

  const latestReport = await Report.findOne({
    reportNumber: { $regex: `^${prefix}` }
  }).sort({ reportNumber: -1 });

  let sequence = 1;
  if (latestReport && latestReport.reportNumber) {
    const parts = latestReport.reportNumber.split('-');
    if (parts.length === 3) {
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        sequence = lastSeq + 1;
      }
    }
  }

  const paddedSeq = String(sequence).padStart(4, '0');
  return `${prefix}-${paddedSeq}`;
};
