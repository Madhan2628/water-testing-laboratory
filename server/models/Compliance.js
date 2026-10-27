import mongoose from 'mongoose';

const complianceSchema = new mongoose.Schema(
  {
    sample: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sample',
      required: true,
      unique: true,
      index: true
    },
    sampleIdString: {
      type: String,
      required: true,
      index: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    testDate: {
      type: Date,
      default: Date.now
    },
    totalParameters: {
      type: Number,
      required: true,
      default: 0
    },
    passedParameters: {
      type: Number,
      required: true,
      default: 0
    },
    failedParameters: {
      type: Number,
      required: true,
      default: 0
    },
    compliancePercentage: {
      type: Number,
      required: true,
      default: 0
    },
    overallStatus: {
      type: String,
      enum: ['COMPLIANT', 'NON-COMPLIANT', 'PENDING'],
      default: 'PENDING',
      index: true
    },
    standardReference: {
      type: String,
      default: 'IS 10500:2012'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewDate: {
      type: Date
    },
    decision: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      index: true
    },
    officerRemarks: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Compliance = mongoose.model('Compliance', complianceSchema);
export default Compliance;
