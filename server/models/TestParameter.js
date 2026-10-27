import mongoose from 'mongoose';

const testParameterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Parameter name is required'],
      unique: true,
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Physical', 'Chemical', 'Microbiological'],
      index: true
    },
    testMethod: {
      type: String,
      required: [true, 'Test method is required'],
      trim: true
    },
    unit: {
      type: String,
      required: [true, 'Unit of measurement is required'],
      trim: true
    },
    minLimit: {
      type: Number,
      default: null
    },
    maxLimit: {
      type: Number,
      default: null
    },
    referenceStandard: {
      type: String,
      default: 'IS 10500:2012',
      trim: true
    },
    applicableSampleTypes: [
      {
        type: String,
        enum: [
          'Drinking Water',
          'Ground Water',
          'Surface Water',
          'Waste Water',
          'Industrial Water',
          'Other'
        ]
      }
    ],
    description: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const TestParameter = mongoose.model('TestParameter', testParameterSchema);
export default TestParameter;
