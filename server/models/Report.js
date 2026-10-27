import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reportNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true
    },
    sample: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sample',
      required: true,
      index: true
    },
    compliance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Compliance',
      required: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['DRAFT', 'UNDER REVIEW', 'APPROVED', 'DELIVERED'],
      default: 'DRAFT',
      index: true
    },
    labDetails: {
      name: { type: String, default: 'AquaPure Laboratory Services Ltd.' },
      address: { type: String, default: '42 Environmental Science Tower, Tech Park, Metro City' },
      contact: { type: String, default: '+1 (800) 555-AQUA | support@aquapurelab.com' },
      accreditation: { type: String, default: 'ISO/IEC 17025 Accredited Laboratory' }
    },
    sampleSnapshot: {
      sampleId: String,
      customerName: String,
      customerEmail: String,
      customerPhone: String,
      sampleType: String,
      sourceType: String,
      collectionLocation: String,
      collectionDate: Date,
      receivedDate: Date,
      analysisDate: Date
    },
    summarySnapshot: {
      totalParameters: Number,
      passed: Number,
      failed: Number,
      compliancePercentage: Number,
      overallCompliance: String
    },
    testResultsSnapshot: [
      {
        parameterName: String,
        category: String,
        resultValue: Number,
        unit: String,
        minLimit: Number,
        maxLimit: Number,
        permissibleRange: String,
        testMethod: String,
        referenceStandard: String,
        status: String,
        remarks: String
      }
    ],
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    preparedByDate: {
      type: Date,
      default: Date.now
    },
    reviewedByDate: {
      type: Date
    },
    approvedByDate: {
      type: Date
    },
    deliveredDate: {
      type: Date
    },
    remarks: {
      type: String,
      default: 'The results relate only to the items tested. Reproduction of report without written approval is prohibited.'
    },
    digitalSignature: {
      signedBy: String,
      signDate: Date,
      signatureHash: String
    },
    pdfUrl: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

const Report = mongoose.model('Report', reportSchema);
export default Report;
