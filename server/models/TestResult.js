import mongoose from 'mongoose';

const testResultSchema = new mongoose.Schema(
  {
    sample: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sample',
      required: [true, 'Sample reference is required'],
      index: true
    },
    parameter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestParameter',
      required: [true, 'Parameter reference is required']
    },
    parameterName: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true,
      enum: ['Physical', 'Chemical', 'Microbiological']
    },
    unit: {
      type: String,
      required: true
    },
    testMethod: {
      type: String,
      required: true
    },
    referenceStandard: {
      type: String,
      required: true
    },
    minLimit: {
      type: Number,
      default: null
    },
    maxLimit: {
      type: Number,
      default: null
    },
    resultValue: {
      type: Number,
      required: [true, 'Test result value is required']
    },
    status: {
      type: String,
      enum: ['PASS', 'FAIL', 'NOT TESTED'],
      default: 'NOT TESTED',
      required: true,
      index: true
    },
    testedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    testedDate: {
      type: Date,
      default: Date.now
    },
    remarks: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Ensure unique parameter result per sample
testResultSchema.index({ sample: 1, parameter: 1 }, { unique: true });

const TestResult = mongoose.model('TestResult', testResultSchema);
export default TestResult;
